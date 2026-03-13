/**
 * Лаб. раб. №6: Like/Dislike система с realtime-обновлением (JSON, без перезагрузки)
 * Данные передаются в формате JSON через Supabase Realtime (WebSocket + JSON payload)
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ReactionCounts {
  likes: number;
  dislikes: number;
  userReaction: "like" | "dislike" | null;
}

export function useReactions(productId: number) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<ReactionCounts>({ likes: 0, dislikes: 0, userReaction: null });
  const [loading, setLoading] = useState(false);

  const fetchCounts = useCallback(async () => {
    // Получаем все реакции для данного товара (JSON-ответ от API)
    const { data } = await supabase
      .from("product_reactions")
      .select("user_id, reaction")
      .eq("product_id", productId);

    if (data) {
      const likes = data.filter(r => r.reaction === "like").length;
      const dislikes = data.filter(r => r.reaction === "dislike").length;
      const userReaction = user ? (data.find(r => r.user_id === user.id)?.reaction as "like" | "dislike" | null) ?? null : null;
      setCounts({ likes, dislikes, userReaction });
    }
  }, [productId, user]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Лаб. раб. №6: Realtime — содержимое обновляется у других пользователей без перезагрузки
  useEffect(() => {
    const channel = supabase
      .channel(`reactions-${productId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "product_reactions",
          filter: `product_id=eq.${productId}`,
        },
        () => {
          fetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, fetchCounts]);

  const react = useCallback(
    async (type: "like" | "dislike") => {
      if (!user || loading) return;
      setLoading(true);

      try {
        if (counts.userReaction === type) {
          // Убираем реакцию
          await supabase
            .from("product_reactions")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId);
        } else if (counts.userReaction) {
          // Меняем реакцию
          await supabase
            .from("product_reactions")
            .update({ reaction: type })
            .eq("user_id", user.id)
            .eq("product_id", productId);
        } else {
          // Новая реакция (JSON-тело запроса)
          await supabase
            .from("product_reactions")
            .insert({ user_id: user.id, product_id: productId, reaction: type });
        }
      } catch (e) {
        console.error("Reaction error:", e);
      }

      setLoading(false);
    },
    [user, loading, counts.userReaction, productId]
  );

  return { ...counts, react, loading };
}
