import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/store";
import ProductCard from "@/components/ProductCard";

const Index = () => {
  const promoProducts = products.filter(p => p.badge);

  return (
    <main className="pt-16">
      {/* ===== HERO секция ===== */}
      {/* Задание 1.1: Заголовки h1 */}
      <section
        className="relative overflow-hidden px-4 py-20 md:py-32"
        /* Задание 2.1: inline style к элементу */
        style={{ background: "linear-gradient(135deg, hsl(142 60% 40% / 0.08), hsl(35 90% 55% / 0.06))" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 animate-fade-slide-up">
            <span className="promo-badge animate-pulse-badge inline-block mb-4">Скидка 20% на первый заказ</span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6">
              Свежие продукты<br />
              <span className="text-primary">с доставкой до двери</span>
            </h1>
            {/* Задание 1.2: Тег p */}
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              <strong>ФрешМаркет</strong> — сервис доставки продуктов с <em>лучшими акциями</em> и скидками.
              Оформите заказ за пару минут и получите свежие продукты прямо к вашей двери.
            </p>
            {/* Задание 1.7: Якорный тег (ссылка) */}
            <div className="flex gap-4 flex-wrap">
              <Button size="lg" asChild>
                <Link to="/catalog">
                  Перейти в каталог <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#promotions">Акции дня</a>
              </Button>
            </div>
          </div>
          <div className="flex-1 text-center animate-slide-in-right">
            {/* Задание 1.6: Изображение (эмоджи как замена для демо) */}
            <div className="text-[10rem] leading-none select-none">🛒</div>
          </div>
        </div>
      </section>

      {/* ===== Преимущества ===== */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          {/* Задание 1.1: h2 */}
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">Почему выбирают нас</h2>
          {/* Задание 1.5: Ненумерованный список (визуально через grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Truck className="h-8 w-8 text-primary" />, title: "Быстрая доставка", desc: "Доставим заказ в течение 60 минут в удобное для вас время" },
              { icon: <Shield className="h-8 w-8 text-primary" />, title: "Гарантия свежести", desc: "Контроль качества на каждом этапе — от склада до вашей двери" },
              { icon: <Clock className="h-8 w-8 text-primary" />, title: "Удобный заказ", desc: "Оформите заказ за 2 минуты с автоматическим применением скидок" },
            ].map((item, i) => (
              <div
                key={i}
                className="animate-fade-slide-up rounded-2xl bg-card p-8 text-center shadow-sm border border-border"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  {item.icon}
                </div>
                {/* Задание 1.1: h3 */}
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Акции дня ===== */}
      <section id="promotions" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              <Star className="inline h-6 w-6 text-secondary mr-2" />
              Акции дня
            </h2>
            <Link to="/catalog" className="text-primary font-medium text-sm hover:underline flex items-center gap-1">
              Все товары <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {/* Задание 1.2: div-блоки */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {promoProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== Как это работает ===== */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">Как сделать заказ</h2>
          {/* Задание 1.5: Нумерованный список */}
          <ol className="max-w-2xl mx-auto space-y-6">
            {[
              "Зарегистрируйтесь или войдите в аккаунт",
              "Найдите нужные товары в каталоге",
              "Добавьте товары в корзину — скидки применятся автоматически",
              "Выберите способ доставки и оплаты",
              "Подтвердите заказ и ожидайте доставку",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4 animate-fade-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  {i + 1}
                </span>
                <span className="text-foreground pt-2">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== Видео секция ===== */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Узнайте больше о нас</h2>
          {/* Задание 1.6: video тег */}
          <div className="rounded-2xl overflow-hidden border border-border bg-muted aspect-video flex items-center justify-center">
            <video
              className="w-full h-full object-cover"
              poster=""
              controls
              preload="none"
            >
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
              Ваш браузер не поддерживает видео.
            </video>
          </div>
          <p className="text-muted-foreground text-sm mt-4">
            <em>Короткое видео о том, как работает наш сервис доставки</em>
          </p>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border py-12 px-4 bg-card">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-bold text-foreground mb-3">ФрешМаркет</h4>
            <p className="text-sm text-muted-foreground">Сервис доставки свежих продуктов с лучшими акциями и скидками.</p>
          </div>
          <div>
            {/* Задание 1.5: ul */}
            <h5 className="font-bold text-foreground mb-3">Навигация</h5>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Главная</Link></li>
              <li><Link to="/catalog" className="text-muted-foreground hover:text-primary transition-colors">Каталог</Link></li>
              <li><Link to="/cart" className="text-muted-foreground hover:text-primary transition-colors">Корзина</Link></li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-foreground mb-3">Контакты</h6>
            <p className="text-sm text-muted-foreground">
              Телефон: <a href="tel:+78001234567" className="text-primary hover:underline">8 (800) 123-45-67</a>
              <br />
              Email: <a href="mailto:info@freshmarket.ru" className="text-primary hover:underline">info@freshmarket.ru</a>
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-border text-center">
          {/* Задание 1.2: span */}
          <span className="text-xs text-muted-foreground">© 2025 ФрешМаркет. Все права защищены.</span>
        </div>
      </footer>
    </main>
  );
};

export default Index;
