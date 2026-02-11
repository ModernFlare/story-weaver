import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, Leaf } from "lucide-react";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getTotalItems } = useCart();
  const location = useLocation();
  const totalItems = getTotalItems();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: "Главная" },
    { to: "/catalog", label: "Каталог" },
    { to: "/cart", label: "Корзина" },
  ];

  return (
    /* Задание 2.7: Фиксированное, разворачивающееся меню */
    <nav className={cn("navbar-fixed bg-background/95 backdrop-blur-md", scrolled && "scrolled")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            {/* Задание 2.1: inline style */}
            <span
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, letterSpacing: "-0.02em" }}
              className="text-xl text-foreground"
            >
              ФрешМаркет
            </span>
          </Link>

          {/* Десктоп ссылки — Задание 1.8, 1.9: Навигация */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={cn("nav-link text-sm font-medium text-muted-foreground hover:text-foreground",
                  location.pathname === l.to && "active text-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
            {/* Корзина с счётчиком */}
            <Link to="/cart" className="relative p-2">
              <ShoppingCart className="h-5 w-5 text-foreground" />
              {totalItems > 0 && <span className="cart-counter">{totalItems}</span>}
            </Link>
          </div>

          {/* Мобильная кнопка — разворачивающееся меню */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-foreground">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Мобильное меню с анимацией */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-60 pb-4" : "max-h-0"
          )}
        >
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block py-2 px-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                location.pathname === l.to && "bg-muted text-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
