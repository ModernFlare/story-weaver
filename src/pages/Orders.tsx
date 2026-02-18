import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Clock, CheckCircle, Truck, ChefHat, XCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { products } from "@/lib/store";

interface OrderItem {
  id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string | null;
  created_at: string;
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: "Ожидает подтверждения", icon: <Clock className="h-4 w-4" />, color: "text-muted-foreground" },
  confirmed: { label: "Подтверждён", icon: <CheckCircle className="h-4 w-4" />, color: "text-primary" },
  preparing: { label: "Готовится", icon: <ChefHat className="h-4 w-4" />, color: "text-secondary" },
  delivering: { label: "В доставке", icon: <Truck className="h-4 w-4" />, color: "text-blue-500" },
  delivered: { label: "Доставлен", icon: <CheckCircle className="h-4 w-4" />, color: "text-green-600" },
  cancelled: { label: "Отменён", icon: <XCircle className="h-4 w-4" />, color: "text-destructive" },
};

const statusSteps = ["pending", "confirmed", "preparing", "delivering", "delivered"];

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!ordersData) { setLoading(false); return; }

      const orderIds = ordersData.map(o => o.id);
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      const mapped: Order[] = ordersData.map(o => ({
        ...o,
        total_amount: Number(o.total_amount),
        items: (itemsData || []).filter(i => i.order_id === o.id).map(i => ({ ...i, price: Number(i.price) })),
      }));

      setOrders(mapped);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <main className="pt-20 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-slide-up">
          <Package className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-foreground mb-3">Войдите в аккаунт</h1>
          <p className="text-muted-foreground mb-6">Чтобы видеть свои заказы, необходимо авторизоваться</p>
          <Button asChild><Link to="/auth">Войти</Link></Button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="pt-20 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center"><div className="text-4xl animate-spin">📦</div><p className="text-muted-foreground mt-4">Загрузка заказов...</p></div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="pt-20 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-slide-up">
          <Package className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-foreground mb-3">Заказов пока нет</h1>
          <p className="text-muted-foreground mb-6">Оформите первый заказ в каталоге</p>
          <Button asChild><Link to="/catalog"><ArrowLeft className="h-4 w-4 mr-2" />Перейти в каталог</Link></Button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-8">Мои заказы</h1>
        <div className="space-y-6">
          {orders.map(order => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            const currentStep = statusSteps.indexOf(order.status);
            const isCancelled = order.status === "cancelled";

            return (
              <div key={order.id} className="rounded-2xl border border-border bg-card p-6 animate-fade-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Заказ от {new Date(order.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    <p className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</p>
                  </div>
                  <div className={cn("flex items-center gap-1.5 font-semibold text-sm", cfg.color)}>
                    {cfg.icon}
                    {cfg.label}
                  </div>
                </div>

                {/* Progress bar */}
                {!isCancelled && (
                  <div className="flex items-center gap-1 mb-5">
                    {statusSteps.map((step, i) => (
                      <div key={step} className={cn(
                        "h-1.5 flex-1 rounded-full transition-colors",
                        i <= currentStep ? "bg-primary" : "bg-muted"
                      )} />
                    ))}
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map(item => {
                    const prod = products.find(p => p.id === item.product_id);
                    return (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        <span className="text-xl">{prod?.image || "📦"}</span>
                        <span className="flex-1 text-foreground">{item.product_name}</span>
                        <span className="text-muted-foreground">{item.quantity} × {item.price} ₽</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Итого</span>
                  <span className="text-lg font-bold text-foreground">{order.total_amount} ₽</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Orders;
