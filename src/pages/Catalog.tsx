import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { products, categories } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/utils";

const Catalog = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "discount">("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [onlyDiscount, setOnlyDiscount] = useState(false);

  let filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Все" || p.category === category;
    const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    const matchDiscount = !onlyDiscount || p.badge;
    return matchSearch && matchCat && matchPrice && matchDiscount;
  });

  if (sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === "discount") filtered.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));

  return (
    <main className="pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Задание 1.1: h1 */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">Каталог товаров</h1>
        <p className="text-muted-foreground mb-8">Найдите свежие продукты по лучшим ценам</p>

        {/* Поиск и фильтры */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск товаров..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value="default">По умолчанию</option>
              <option value="price-asc">Сначала дешёвые</option>
              <option value="price-desc">Сначала дорогие</option>
              <option value="discount">Сначала со скидкой</option>
            </select>
            <Button
              variant={onlyDiscount ? "default" : "outline"}
              size="sm"
              onClick={() => setOnlyDiscount(!onlyDiscount)}
              className="h-10"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Только акции
            </Button>
          </div>
        </div>

        {/* Категории — Задание 1.8: навигация по странице */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                category === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Сетка товаров */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="text-lg font-semibold text-foreground mb-2">Ничего не найдено</h3>
            <p className="text-muted-foreground text-sm">Попробуйте изменить запрос или сбросить фильтры</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setCategory("Все"); setOnlyDiscount(false); }}>
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Catalog;
