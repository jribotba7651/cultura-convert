import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Order } from "@/types/Store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ArrowLeft, Loader2, MoreVertical, XCircle, RefreshCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import OrderDetailsCard from "@/components/admin/OrderDetailsCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type CancelAction = "cancel" | "cancel_refund";

interface CancelModalState {
  isOpen: boolean;
  order: Order | null;
  action: CancelAction;
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [cancelModal, setCancelModal] = useState<CancelModalState>({
    isOpen: false,
    order: null,
    action: "cancel",
  });
  const [cancelReason, setCancelReason] = useState<string>("");

  const canCancelOrder = (order: Order) => {
    return !["shipped", "delivered", "cancelled"].includes(order.status);
  };

  const canRefundOrder = (order: Order) => {
    return order.status === "paid" && !!order.stripe_payment_intent_id;
  };

  const openCancelModal = (order: Order, action: CancelAction) => {
    setCancelModal({ isOpen: true, order, action });
    setCancelReason("");
  };

  const closeCancelModal = () => {
    setCancelModal({ isOpen: false, order: null, action: "cancel" });
    setCancelReason("");
  };

  const handleConfirmCancel = () => {
    const message = cancelModal.action === "cancel_refund"
      ? "UI listo. Falta conectar backend."
      : "UI listo. Falta conectar backend.";
    
    toast({
      title: cancelModal.action === "cancel_refund" ? "Cancelar y reembolsar" : "Cancelar orden",
      description: message,
    });
    
    closeCancelModal();
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

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

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Verificando permisos...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
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
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div 
                      className="space-y-2 flex-1 cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
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
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ${(order.total_amount_cents / 100).toFixed(2)}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setSelectedOrder(order)}
                        >
                          Ver detalles
                        </Button>
                      </div>
                      
                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canCancelOrder(order) ? (
                            <>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCancelModal(order, "cancel");
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancelar orden
                              </DropdownMenuItem>
                              {canRefundOrder(order) && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openCancelModal(order, "cancel_refund");
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <RefreshCcw className="mr-2 h-4 w-4" />
                                  Cancelar y reembolsar
                                </DropdownMenuItem>
                              )}
                            </>
                          ) : (
                            <DropdownMenuItem disabled className="text-muted-foreground">
                              No se puede cancelar después de enviar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Modal */}
      <Dialog open={cancelModal.isOpen} onOpenChange={(open) => !open && closeCancelModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cancelación</DialogTitle>
            <DialogDescription>
              Esta acción cancelará la orden seleccionada.
            </DialogDescription>
          </DialogHeader>
          
          {cancelModal.order && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p>
                  <strong>Número de orden:</strong> #{cancelModal.order.id.slice(0, 8)}
                </p>
                <p>
                  <strong>Email del cliente:</strong> {cancelModal.order.customer_email}
                </p>
                <p>
                  <strong>Total:</strong> ${(cancelModal.order.total_amount_cents / 100).toFixed(2)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cancel-reason">Razón de cancelación (opcional)</Label>
                <Select value={cancelReason} onValueChange={setCancelReason}>
                  <SelectTrigger id="cancel-reason">
                    <SelectValue placeholder="Seleccionar razón..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_request">Solicitud del cliente</SelectItem>
                    <SelectItem value="payment_issue">Problema de pago</SelectItem>
                    <SelectItem value="inventory">Inventario</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeCancelModal}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              {cancelModal.action === "cancel_refund" ? "Cancelar y reembolsar" : "Cancelar orden"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
