import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Clock, CheckCircle, Truck, ChefHat, XCircle, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-role";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { products } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  delivery_address: string | null;
  created_at: string;
  items: OrderItem[];
}

const statuses = [
  { value: "pending", label: "Ожидает", icon: <Clock className="h-4 w-4" /> },
  { value: "confirmed", label: "Подтверждён", icon: <CheckCircle className="h-4 w-4" /> },
  { value: "preparing", label: "Готовится", icon: <ChefHat className="h-4 w-4" /> },
  { value: "delivering", label: "В доставке", icon: <Truck className="h-4 w-4" /> },
  { value: "delivered", label: "Доставлен", icon: <CheckCircle className="h-4 w-4" /> },
  { value: "cancelled", label: "Отменён", icon: <XCircle className="h-4 w-4" /> },
];

const statusColors: Record<string, string> = {
  pending: "text-muted-foreground",
  confirmed: "text-primary",
  preparing: "text-secondary",
  delivering: "text-blue-500",
  delivered: "text-green-600",
  cancelled: "text-destructive",
};

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
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

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [isAdmin]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      return;
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast({ title: "Статус обновлён" });
  };

  if (!user || roleLoading || loading) {
    return (
      <main className="pt-20 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-spin">⚙️</div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="pt-20 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-slide-up">
          <ShieldAlert className="h-20 w-20 text-destructive mx-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-foreground mb-3">Доступ запрещён</h1>
          <p className="text-muted-foreground mb-6">У вас нет прав администратора</p>
          <Button asChild><Link to="/">На главную</Link></Button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">Управление заказами</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Заказов пока нет</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const color = statusColors[order.status] || "text-muted-foreground";
              return (
                <div key={order.id} className="rounded-2xl border border-border bg-card p-5 animate-fade-slide-up">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {order.delivery_address && (
                        <p className="text-xs text-muted-foreground mt-1">📍 {order.delivery_address}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                        <SelectTrigger className={cn("w-[180px] font-semibold text-sm", color)}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map(s => (
                            <SelectItem key={s.value} value={s.value}>
                              <span className="flex items-center gap-2">{s.icon} {s.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    {order.items.map(item => {
                      const prod = products.find(p => p.id === item.product_id);
                      return (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          <span>{prod?.image || "📦"}</span>
                          <span className="flex-1 text-foreground">{item.product_name}</span>
                          <span className="text-muted-foreground">{item.quantity} × {item.price} ₽</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-border pt-2 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Пользователь: {order.user_id.slice(0, 8)}…</span>
                    <span className="text-lg font-bold text-foreground">{order.total_amount} ₽</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Admin;
