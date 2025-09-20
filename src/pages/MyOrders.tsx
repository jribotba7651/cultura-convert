import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package2, Calendar, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import Navigation from '@/components/Navigation';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
  product: {
    id: string;
    title: any;
    images: string[] | null;
  };
}

interface Order {
  id: string;
  total_amount_cents: number;
  status: string;
  created_at: string;
  customer_name: string;
  order_items: OrderItem[];
}

const MyOrders = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            total_amount_cents,
            status,
            created_at,
            customer_name,
            order_items (
              id,
              quantity,
              unit_price_cents,
              total_price_cents,
              product:products (
                id,
                title,
                images
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(t('error'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, t]);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'shipped':
        return 'outline';
      case 'delivered':
        return 'default';
      case 'cancelled':
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === 'es' ? es : enUS;
    return format(date, 'PPP', { locale });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            {[1, 2, 3].map((i) => (
              <Card key={i} className="mb-6">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">{t('myOrders')}</h1>
            <p className="text-muted-foreground mb-6">
              {t('welcomeMessage')}
            </p>
            <Link to="/auth">
              <Button>{t('signIn')}</Button>
            </Link>
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
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/store">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToStore')}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{t('myOrders')}</h1>
          </div>

          {/* Orders List */}
          {error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">{t('noOrders')}</h3>
                <p className="text-muted-foreground mb-4">
                  {language === 'es' ? 
                    'Cuando hagas tu primera compra, aparecerá aquí.' :
                    'When you make your first purchase, it will appear here.'
                  }
                </p>
                <Link to="/store">
                  <Button>{t('store')}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {t('orderNumber')} #{order.id.slice(-8).toUpperCase()}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusVariant(order.status)}>
                          {t(order.status)}
                        </Badge>
                        <p className="text-lg font-semibold mt-2 flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatPrice(order.total_amount_cents)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-medium">{t('orderProducts')}:</h4>
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          {item.product.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title?.[language] || 'Product'}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">
                              {item.product.title?.[language] || 'Product'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {language === 'es' ? 'Cantidad' : 'Quantity'}: {item.quantity} × {formatPrice(item.unit_price_cents)}
                            </p>
                          </div>
                          <p className="font-medium">
                            {formatPrice(item.total_price_cents)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;