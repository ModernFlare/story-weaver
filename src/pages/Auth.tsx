import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Loader2 } from "lucide-react";
import { toast } from "sonner";

/* Лаб. раб. №2, Задание 2: JS-валидация полей формы */

/** Проверка имени: только буквы (кириллица/латиница), ровно одна заглавная (первая) */
const validateName = (value: string): string => {
  if (!value.trim()) return "Поле обязательно для заполнения";
  if (value.length < 2) return "Минимум 2 символа";
  if (value.length > 50) return "Максимум 50 символов";
  if (!/^[a-zA-Zа-яА-ЯёЁ]+$/.test(value)) return "Только буквы (без пробелов, цифр и спецсимволов)";
  const upperCount = (value.match(/[A-ZА-ЯЁ]/g) || []).length;
  if (upperCount !== 1) return "Должна быть ровно одна заглавная буква";
  if (!/^[A-ZА-ЯЁ]/.test(value)) return "Первая буква должна быть заглавной";
  return "";
};

/** Расстояние Левенштейна */
const levenshtein = (a: string, b: string): number => {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
  return dp[m][n];
};

/** Автокоррекция: fuzzy-match к популярным доменам (порог ≤ 2) */
const POPULAR_DOMAINS = [
  "gmail.com", "mail.ru", "yandex.ru", "yandex.com", "yahoo.com",
  "hotmail.com", "outlook.com", "icloud.com", "bk.ru", "inbox.ru",
  "list.ru", "rambler.ru", "ya.ru",
];

const fixEmailDomain = (email: string): string => {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const domain = parts[1].toLowerCase();
  if (POPULAR_DOMAINS.includes(domain)) return email;

  let bestDomain = domain;
  let bestDist = Infinity;
  for (const pop of POPULAR_DOMAINS) {
    const dist = levenshtein(domain, pop);
    if (dist < bestDist) { bestDist = dist; bestDomain = pop; }
  }
  // Исправляем только при расстоянии ≤ 2 (1–2 опечатки)
  if (bestDist > 0 && bestDist <= 2) return parts[0] + "@" + bestDomain;
  return email;
};

/** Проверка email по маске */
const validateEmail = (value: string): string => {
  if (!value.trim()) return "Поле обязательно для заполнения";
  if (value.length > 255) return "Максимум 255 символов";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return "Введите корректный email (например, user@mail.com)";
  return "";
};

/** Проверка пароля: мин. 6 символов, макс. 128 */
const validatePassword = (value: string): string => {
  if (!value) return "Поле обязательно для заполнения";
  if (value.length < 6) return "Минимум 6 символов";
  if (value.length > 128) return "Максимум 128 символов";
  return "";
};

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email: string; password: string }>({ email: "", password: "" });

  // Register state
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regErrors, setRegErrors] = useState<{ firstName: string; lastName: string; email: string; password: string }>({
    firstName: "", lastName: "", email: "", password: "",
  });

  /* Задание 2: JS-валидация при вводе (onBlur) */
  const validateLoginField = useCallback((field: "email" | "password", value: string) => {
    setLoginErrors(prev => ({
      ...prev,
      [field]: field === "email" ? validateEmail(value) : validatePassword(value),
    }));
  }, []);

  const validateRegField = useCallback((field: "firstName" | "lastName" | "email" | "password", value: string) => {
    let error = "";
    if (field === "firstName" || field === "lastName") error = validateName(value);
    else if (field === "email") {
      const fixed = fixEmailDomain(value);
      if (fixed !== value) setRegEmail(fixed);
      error = validateEmail(fixed);
    }
    else error = validatePassword(value);
    setRegErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(loginEmail);
    const passErr = validatePassword(loginPassword);
    setLoginErrors({ email: emailErr, password: passErr });
    if (emailErr || passErr) return;

    setLoginLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoginLoading(false);
    if (error) {
      toast.error("Ошибка входа: " + error.message);
    } else {
      toast.success("Вы успешно вошли!");
      navigate("/");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const firstNameErr = validateName(regFirstName);
    const lastNameErr = validateName(regLastName);
    const emailErr = validateEmail(regEmail);
    const passErr = validatePassword(regPassword);
    setRegErrors({ firstName: firstNameErr, lastName: lastNameErr, email: emailErr, password: passErr });
    if (firstNameErr || lastNameErr || emailErr || passErr) return;

    setRegLoading(true);
    const fullName = `${regFirstName} ${regLastName}`;
    const { error } = await signUp(regEmail, regPassword, fullName);
    setRegLoading(false);
    if (error) {
      toast.error("Ошибка регистрации: " + error.message);
    } else {
      toast.success("Регистрация успешна! Вы вошли в аккаунт.");
      navigate("/");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-20 pb-8 bg-background">
      <Card className="w-full max-w-md animate-fade-slide-up">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, letterSpacing: "-0.02em" }}
              className="text-2xl text-foreground"
            >
              ФрешМаркет
            </span>
          </div>
          <CardTitle className="text-xl">Добро пожаловать</CardTitle>
          <CardDescription>Войдите или создайте аккаунт</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            {/* Задание 1: CSS-псевдоклассы :valid, :invalid, :required, :optional */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="auth-form space-y-4 mt-4" noValidate>
                <div className="space-y-1">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="example@mail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    onBlur={() => validateLoginField("email", loginEmail)}
                    required
                    maxLength={255}
                  />
                  {loginErrors.email && <p className="validation-error">{loginErrors.email}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="login-password">Пароль</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onBlur={() => validateLoginField("password", loginPassword)}
                    required
                    minLength={6}
                    maxLength={128}
                  />
                  {loginErrors.password && <p className="validation-error">{loginErrors.password}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? <Loader2 className="animate-spin" /> : "Войти"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="auth-form space-y-4 mt-4" noValidate>
                <div className="space-y-1">
                  <Label htmlFor="reg-firstname">Имя</Label>
                  <Input
                    id="reg-firstname"
                    type="text"
                    placeholder="Иван"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    onBlur={() => validateRegField("firstName", regFirstName)}
                    required
                    minLength={2}
                    maxLength={50}
                    pattern="[a-zA-Zа-яА-ЯёЁ]+"
                    title="Только буквы, одна заглавная (первая)"
                  />
                  {regErrors.firstName && <p className="validation-error">{regErrors.firstName}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reg-lastname">Фамилия</Label>
                  <Input
                    id="reg-lastname"
                    type="text"
                    placeholder="Иванов"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    onBlur={() => validateRegField("lastName", regLastName)}
                    required
                    minLength={2}
                    maxLength={50}
                    pattern="[a-zA-Zа-яА-ЯёЁ]+"
                    title="Только буквы, одна заглавная (первая)"
                  />
                  {regErrors.lastName && <p className="validation-error">{regErrors.lastName}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="example@mail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    onBlur={() => validateRegField("email", regEmail)}
                    required
                    maxLength={255}
                  />
                  {regErrors.email && <p className="validation-error">{regErrors.email}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reg-password">Пароль</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Минимум 6 символов"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    onBlur={() => validateRegField("password", regPassword)}
                    required
                    minLength={6}
                    maxLength={128}
                  />
                  {regErrors.password && <p className="validation-error">{regErrors.password}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={regLoading}>
                  {regLoading ? <Loader2 className="animate-spin" /> : "Зарегистрироваться"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
};

export default Auth;
