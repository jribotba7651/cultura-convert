import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Order } from "@/types/Store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import OrderDetailsCard from "@/components/admin/OrderDetailsCard";

export default function AdminOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    // Check if user is admin
    if (!user || user.email !== "jribot@gmail.com") {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a esta página",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data || []) as unknown as Order[]);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: "Pendiente" },
      paid: { variant: "default", label: "Pagada" },
      processing: { variant: "outline", label: "Procesando" },
      shipped: { variant: "default", label: "Enviada" },
      delivered: { variant: "default", label: "Entregada" },
      cancelled: { variant: "destructive", label: "Cancelada" },
      failed: { variant: "destructive", label: "Fallida" },
    };

    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <OrderDetailsCard
        order={selectedOrder}
        onBack={() => {
          setSelectedOrder(null);
          fetchOrders();
        }}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Package className="h-8 w-8" />
          Panel de Administración de Órdenes
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona todas las órdenes de la tienda
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="paid">Pagadas</TabsTrigger>
          <TabsTrigger value="processing">Procesando</TabsTrigger>
          <TabsTrigger value="shipped">Enviadas</TabsTrigger>
          <TabsTrigger value="delivered">Entregadas</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No hay órdenes con este estado
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-lg">
                          Orden #{order.id.slice(0, 8)}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <strong>Cliente:</strong> {order.customer_name}
                        </p>
                        <p>
                          <strong>Email:</strong> {order.customer_email}
                        </p>
                        <p>
                          <strong>Fecha:</strong>{" "}
                          {new Date(order.created_at).toLocaleDateString(
                            "es-PR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ${(order.total_amount_cents / 100).toFixed(2)}
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
