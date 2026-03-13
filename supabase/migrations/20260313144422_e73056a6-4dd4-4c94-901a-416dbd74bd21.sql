
-- Таблица реакций (like/dislike) на товары
CREATE TABLE public.product_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id integer NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- RLS
ALTER TABLE public.product_reactions ENABLE ROW LEVEL SECURITY;

-- Все могут видеть реакции (для подсчёта)
CREATE POLICY "Anyone can view reactions"
  ON public.product_reactions FOR SELECT
  TO public
  USING (true);

-- Авторизованные пользователи управляют своими реакциями
CREATE POLICY "Users manage own reactions"
  ON public.product_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reactions"
  ON public.product_reactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own reactions"
  ON public.product_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Realtime для обновления реакций у всех пользователей без перезагрузки
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_reactions;
