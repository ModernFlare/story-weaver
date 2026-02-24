import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const validateName = (v: string) => {
  if (!v.trim()) return "Обязательное поле";
  if (v.length < 2) return "Минимум 2 символа";
  if (v.length > 100) return "Максимум 100 символов";
  return "";
};
const validateEmail = (v: string) => {
  if (!v.trim()) return "Обязательное поле";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Некорректный email";
  return "";
};
const validateMessage = (v: string) => {
  if (!v.trim()) return "Обязательное поле";
  if (v.length < 10) return "Минимум 10 символов";
  if (v.length > 1000) return "Максимум 1000 символов";
  return "";
};

const Feedback = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = useCallback((field: string, value: string) => {
    let err = "";
    if (field === "name") err = validateName(value);
    else if (field === "email") err = validateEmail(value);
    else err = validateMessage(value);
    setErrors((p) => ({ ...p, [field]: err }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const msgErr = validateMessage(message);
    setErrors({ name: nameErr, email: emailErr, message: msgErr });
    if (nameErr || emailErr || msgErr) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-telegram", {
        body: { name: name.trim(), email: email.trim(), message: message.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSent(true);
      toast.success("Сообщение отправлено!");
    } catch (err: any) {
      toast.error("Ошибка отправки: " + (err?.message || "попробуйте позже"));
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 pt-20 pb-8 bg-background">
        <div className="text-center animate-fade-slide-up">
          <CheckCircle className="h-20 w-20 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-foreground mb-3">Спасибо за обращение!</h1>
          <p className="text-muted-foreground mb-6">Ваше сообщение отправлено в Telegram. Мы свяжемся с вами в ближайшее время.</p>
          <Button onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}>
            Отправить ещё
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-20 pb-8 bg-background">
      <Card className="w-full max-w-lg animate-fade-slide-up">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Обратная связь</CardTitle>
          <CardDescription>Напишите нам — мы получим уведомление в Telegram</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="auth-form space-y-4" noValidate>
            <div className="space-y-1">
              <Label htmlFor="fb-name">Имя</Label>
              <Input
                id="fb-name"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => validate("name", name)}
                required
                maxLength={100}
              />
              {errors.name && <p className="validation-error">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="fb-email">Email</Label>
              <Input
                id="fb-email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => validate("email", email)}
                required
                maxLength={255}
              />
              {errors.email && <p className="validation-error">{errors.email}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="fb-message">Сообщение</Label>
              <Textarea
                id="fb-message"
                placeholder="Ваш вопрос или пожелание (минимум 10 символов)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onBlur={() => validate("message", message)}
                required
                rows={5}
                maxLength={1000}
                className="resize-none"
              />
              {errors.message && <p className="validation-error">{errors.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Отправить"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Feedback;
