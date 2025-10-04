import { useState } from "react";
import { Order } from "@/types/Store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Package, MapPin, Mail, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OrderDetailsCardProps {
  order: Order;
  onBack: () => void;
}

export default function OrderDetailsCard({
  order,
  onBack,
}: OrderDetailsCardProps) {
  const [status, setStatus] = useState<Order['status']>(order.status);
  const [trackingNumber, setTrackingNumber] = useState(
    order.tracking_number || ""
  );
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || "");
  const [updating, setUpdating] = useState(false);

  const handleUpdateOrder = async () => {
    try {
      setUpdating(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No session found");
      }

      const { error } = await supabase.functions.invoke("update-order-status", {
        body: {
          orderId: order.id,
          status,
          trackingNumber: trackingNumber || null,
          trackingUrl: trackingUrl || null,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Orden actualizada",
        description:
          status === "shipped"
            ? "La orden ha sido marcada como enviada y se ha notificado al cliente"
            : "La orden ha sido actualizada exitosamente",
      });

      onBack();
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la orden",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return "No disponible";
    return (
      <>
        {address.name && <div className="font-semibold">{address.name}</div>}
        <div>{address.line1}</div>
        {address.line2 && <div>{address.line2}</div>}
        <div>
          {address.city}, {address.state} {address.postal_code}
        </div>
        <div>{address.country}</div>
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a órdenes
      </Button>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                Orden #{order.id.slice(0, 8)}
              </h1>
              <p className="text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString("es-PR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-3xl font-bold text-primary">
                ${(order.total_amount_cents / 100).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Información del Cliente
                </h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>
                    <strong>Nombre:</strong> {order.customer_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {order.customer_email}
                  </p>
                  {order.customer_phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {order.customer_phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Dirección de Envío
                </h3>
                <div className="text-sm text-muted-foreground">
                  {formatAddress(order.shipping_address)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Información de Envío
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="status">Estado de la Orden</Label>
                    <Select value={status} onValueChange={(value) => setStatus(value as Order['status'])}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Pagada</SelectItem>
                        <SelectItem value="processing">Procesando</SelectItem>
                        <SelectItem value="shipped">Enviada</SelectItem>
                        <SelectItem value="delivered">Entregada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tracking">Número de Tracking</Label>
                    <Input
                      id="tracking"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Ej: 1Z999AA10123456784"
                    />
                  </div>

                  <div>
                    <Label htmlFor="trackingUrl">URL de Tracking</Label>
                    <Input
                      id="trackingUrl"
                      value={trackingUrl}
                      onChange={(e) => setTrackingUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <Button
                    onClick={handleUpdateOrder}
                    disabled={updating}
                    className="w-full"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar Orden"
                    )}
                  </Button>

                  {status === "shipped" && trackingNumber && (
                    <p className="text-xs text-muted-foreground">
                      Al marcar como "Enviada", se enviará un email automático
                      al cliente con el número de tracking.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
