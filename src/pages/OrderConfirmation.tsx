import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/Store';

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    try {
      // Get access token from localStorage for anonymous orders
      const accessToken = localStorage.getItem(`order_token_${id}`);
      
      // Use the secure verification endpoint
      const { data, error } = await supabase.functions.invoke('verify-order-access', {
        body: {
          order_id: id,
          access_token: accessToken
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to verify order access');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setOrder(data.order as unknown as Order);
      
      // Clean up token after successful access (optional - for security)
      if (accessToken) {
        localStorage.removeItem(`order_token_${id}`);
      }
      
    } catch (error: any) {
      console.error('Error fetching order:', error);
      // Redirect to store with error message
      navigate('/store');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'processing':
        return <Package className="h-6 w-6 text-primary" />;
      case 'shipped':
        return <Truck className="h-6 w-6 text-primary" />;
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Package className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      es: {
        pending: 'Pendiente',
        paid: 'Pagado',
        processing: 'Procesando',
        shipped: 'Enviado',
        delivered: 'Entregado',
        cancelled: 'Cancelado',
        failed: 'Fallido'
      },
      en: {
        pending: 'Pending',
        paid: 'Paid',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        failed: 'Failed'
      }
    };

    return statusTexts[language][status as keyof typeof statusTexts.es] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              {language === 'es' ? 'Pedido no encontrado' : 'Order not found'}
            </p>
            <Button onClick={() => navigate('/store')}>
              {language === 'es' ? 'Volver a la tienda' : 'Back to store'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {language === 'es' ? '¡Gracias por tu compra!' : 'Thank you for your purchase!'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'es' 
                ? 'Tu pedido ha sido confirmado y está siendo procesado.'
                : 'Your order has been confirmed and is being processed.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  {language === 'es' ? 'Estado del pedido' : 'Order Status'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'es' ? 'Número de pedido' : 'Order number'}
                  </p>
                  <p className="font-mono text-sm">{order.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'es' ? 'Estado' : 'Status'}
                  </p>
                  <p className="font-medium">{getStatusText(order.status)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'es' ? 'Fecha del pedido' : 'Order date'}
                  </p>
                  <p>{new Date(order.created_at).toLocaleDateString()}</p>
                </div>

                {order.tracking_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'es' ? 'Número de seguimiento' : 'Tracking number'}
                    </p>
                    <p className="font-mono text-sm">{order.tracking_number}</p>
                    {order.tracking_url && (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto"
                        onClick={() => window.open(order.tracking_url, '_blank')}
                      >
                        {language === 'es' ? 'Rastrear paquete' : 'Track package'}
                      </Button>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'es' ? 'Correo de confirmación enviado a' : 'Confirmation email sent to'}
                  </p>
                  <p>{order.customer_email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  {language === 'es' ? 'Dirección de envío' : 'Shipping Address'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{order.customer_name}</p>
                  <p>{order.shipping_address.line1}</p>
                  {order.shipping_address.line2 && (
                    <p>{order.shipping_address.line2}</p>
                  )}
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                  </p>
                  <p>{order.shipping_address.country}</p>
                  {order.customer_phone && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {order.customer_phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>
                {language === 'es' ? 'Resumen del pedido' : 'Order Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Order items would be displayed here if we had them in the order data */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>{language === 'es' ? 'Subtotal' : 'Subtotal'}</span>
                  <span>{formatPrice(order.total_amount_cents - order.shipping_amount_cents - order.tax_amount_cents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{language === 'es' ? 'Envío' : 'Shipping'}</span>
                  <span>{formatPrice(order.shipping_amount_cents)}</span>
                </div>
                {order.tax_amount_cents > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{language === 'es' ? 'Impuestos' : 'Tax'}</span>
                    <span>{formatPrice(order.tax_amount_cents)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>{language === 'es' ? 'Total' : 'Total'}</span>
                  <span>{formatPrice(order.total_amount_cents)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Button 
              onClick={() => navigate('/store')}
              variant="outline"
            >
              {language === 'es' ? 'Continuar comprando' : 'Continue shopping'}
            </Button>
            
            <Button onClick={() => navigate('/')}>
              {language === 'es' ? 'Volver al inicio' : 'Back to home'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;