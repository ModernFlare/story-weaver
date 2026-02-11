import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product, useCart } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  return (
    <div className="product-card group rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-lg transition-shadow duration-300 relative overflow-hidden">
      {/* Задание: Промо-бейдж */}
      {product.badge && (
        <span className="promo-badge animate-pulse-badge absolute top-3 right-3 z-10">
          {product.badge}
        </span>
      )}

      {/* Задание 1.6: img замена — эмоджи */}
      <div className="flex items-center justify-center h-32 text-7xl mb-4 rounded-xl bg-muted/50 group-hover:scale-105 transition-transform duration-300">
        {product.image}
      </div>

      <div className="space-y-1">
        {/* Задание 1.2: p, span, div */}
        <p className="text-xs text-muted-foreground">{product.category}</p>
        <h3 className="font-semibold text-foreground text-sm leading-tight">{product.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>

        {/* Задание 2.2: border, margin, padding */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-border">
          <div>
            <span className="text-lg font-bold text-foreground">{product.price} ₽</span>
            {product.oldPrice && (
              <span className="ml-2 text-sm text-muted-foreground line-through">{product.oldPrice} ₽</span>
            )}
            {product.promoThreshold && (
              <p className="text-xs text-primary font-medium mt-0.5">
                от {product.promoThreshold} шт. — скидка {product.promoDiscount}%
              </p>
            )}
          </div>
          <Button
            size="icon"
            className={cn("h-9 w-9 rounded-full")}
            onClick={() => addToCart(product)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
