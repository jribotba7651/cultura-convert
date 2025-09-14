import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeText, validateInput } from '@/utils/sanitize';
import { validateAddress, formatZipCode } from '@/utils/addressValidation';

const stripePromise = loadStripe('pk_test_51QdK4IGfIcOJCKx4mhHTfOcE6lRN6yyF9sZUYi7YdktKGqzksQkGEJzPL5ZVEFhyO8KMCaVOHnfJPLhAhOLNJK2v00T5qdgVrR');

interface CheckoutFormData {
  email: string;
  name: string;
  phone: string;
  shippingAddress: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billingAddress: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  sameAsShipping: boolean;
}

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [addressErrors, setAddressErrors] = useState<{[key: string]: string[]}>({});
  const [addressWarnings, setAddressWarnings] = useState<{[key: string]: string[]}>({});
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    name: '',
    phone: '',
    shippingAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
    billingAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
    },
    sameAsShipping: true,
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const shippingCost = 599;
  const subtotal = getTotalPrice();
  const total = subtotal + shippingCost;

  const handleInputChange = (field: string, value: string) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else if (keys.length === 2) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...(prev[keys[0] as 'shippingAddress' | 'billingAddress']),
          [keys[1]]: value
        }
      }));
    }

    // Validate address in real-time for postal codes
    if (field.includes('postal_code') || field.includes('country')) {
      const addressType = field.startsWith('shipping') ? 'shippingAddress' : 'billingAddress';
      setTimeout(() => validateAddressField(addressType), 100);
    }
  };

  const validateAddressField = (addressType: 'shippingAddress' | 'billingAddress') => {
    const address = formData[addressType];
    const validation = validateAddress(address, language);
    
    setAddressErrors(prev => ({
      ...prev,
      [addressType]: validation.errors
    }));
    
    setAddressWarnings(prev => ({
      ...prev,
      [addressType]: validation.warnings
    }));
  };

  const handleSameAsShippingChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sameAsShipping: checked,
      billingAddress: checked ? { ...prev.shippingAddress } : prev.billingAddress
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    // Validate addresses before proceeding
    const shippingValidation = validateAddress(formData.shippingAddress, language);
    const billingValidation = validateAddress(
      formData.sameAsShipping ? formData.shippingAddress : formData.billingAddress, 
      language
    );

    if (!shippingValidation.isValid || !billingValidation.isValid) {
      setAddressErrors({
        shippingAddress: shippingValidation.errors,
        billingAddress: billingValidation.errors
      });
      
      toast({
        title: language === 'es' ? 'Error en la dirección' : 'Address Error',
        description: language === 'es' 
          ? 'Por favor corrige los errores en las direcciones.'
          : 'Please correct the address errors.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create payment intent
      const { data, error } = await supabase.functions.invoke('create-stripe-payment-intent', {
        body: {
          items: items.map(item => ({
            id: item.product.id,
            quantity: item.quantity,
            variant_id: item.variant_id
          })),
          shipping_address: {
            name: formData.name,
            ...formData.shippingAddress
          },
          billing_address: {
            name: formData.name,
            ...(formData.sameAsShipping ? formData.shippingAddress : formData.billingAddress)
          },
          customer_email: formData.email,
          customer_name: formData.name,
          customer_phone: formData.phone
        }
      });

      if (error) throw error;

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: {
                line1: formData.sameAsShipping ? formData.shippingAddress.line1 : formData.billingAddress.line1,
                line2: formData.sameAsShipping ? formData.shippingAddress.line2 : formData.billingAddress.line2,
                city: formData.sameAsShipping ? formData.shippingAddress.city : formData.billingAddress.city,
                state: formData.sameAsShipping ? formData.shippingAddress.state : formData.billingAddress.state,
                postal_code: formData.sameAsShipping ? formData.shippingAddress.postal_code : formData.billingAddress.postal_code,
                country: formData.sameAsShipping ? formData.shippingAddress.country : formData.billingAddress.country,
              }
            }
          }
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        clearCart();
        
        // Store access token for anonymous orders
        if (data.access_token) {
          localStorage.setItem(`order_token_${data.order_id}`, data.access_token);
        }
        
        toast({
          title: language === 'es' ? '¡Pago exitoso!' : 'Payment successful!',
          description: language === 'es' 
            ? 'Tu pedido ha sido procesado correctamente.'
            : 'Your order has been processed successfully.',
        });
        navigate(`/order-confirmation/${data.order_id}`);
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: language === 'es' ? 'Error en el pago' : 'Payment error',
        description: error.message || (language === 'es' 
          ? 'Hubo un problema procesando tu pago.'
          : 'There was a problem processing your payment.'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              {language === 'es' ? 'Tu carrito está vacío' : 'Your cart is empty'}
            </p>
            <Button onClick={() => navigate('/store')}>
              {language === 'es' ? 'Continuar comprando' : 'Continue shopping'}
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
        <Button 
          variant="ghost" 
          onClick={() => navigate('/store')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'es' ? 'Volver a la tienda' : 'Back to store'}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {language === 'es' ? 'Información de pago' : 'Payment Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    {language === 'es' ? 'Información de contacto' : 'Contact Information'}
                  </h3>
                  
                  <div>
                    <Label htmlFor="email">
                      {language === 'es' ? 'Correo electrónico' : 'Email'}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="name">
                      {language === 'es' ? 'Nombre completo' : 'Full name'}
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">
                      {language === 'es' ? 'Teléfono' : 'Phone'}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Shipping Address */}
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    {language === 'es' ? 'Dirección de envío' : 'Shipping Address'}
                  </h3>
                  
                  <div>
                    <Label htmlFor="shipping-line1">
                      {language === 'es' ? 'Dirección' : 'Address'}
                    </Label>
                    <Input
                      id="shipping-line1"
                      value={formData.shippingAddress.line1}
                      onChange={(e) => handleInputChange('shippingAddress.line1', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="shipping-line2">
                      {language === 'es' ? 'Apartamento, suite, etc.' : 'Apartment, suite, etc.'}
                    </Label>
                    <Input
                      id="shipping-line2"
                      value={formData.shippingAddress.line2}
                      onChange={(e) => handleInputChange('shippingAddress.line2', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shipping-city">
                        {language === 'es' ? 'Ciudad' : 'City'}
                      </Label>
                      <Input
                        id="shipping-city"
                        value={formData.shippingAddress.city}
                        onChange={(e) => handleInputChange('shippingAddress.city', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="shipping-state">
                        {language === 'es' ? 'Estado' : 'State'}
                      </Label>
                      <Input
                        id="shipping-state"
                        value={formData.shippingAddress.state}
                        onChange={(e) => handleInputChange('shippingAddress.state', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shipping-postal">
                        {language === 'es' ? 'Código postal' : 'Postal code'}
                      </Label>
                      <Input
                        id="shipping-postal"
                        value={formData.shippingAddress.postal_code}
                        onChange={(e) => {
                          const formatted = formatZipCode(e.target.value, formData.shippingAddress.country);
                          handleInputChange('shippingAddress.postal_code', formatted);
                        }}
                        className={addressErrors.shippingAddress?.some(error => 
                          error.toLowerCase().includes('postal') || error.toLowerCase().includes('zip')
                        ) ? 'border-destructive' : ''}
                        required
                      />
                      {addressErrors.shippingAddress?.filter(error => 
                        error.toLowerCase().includes('postal') || error.toLowerCase().includes('zip')
                      ).map((error, index) => (
                        <p key={index} className="text-sm text-destructive mt-1">{error}</p>
                      ))}
                      {addressWarnings.shippingAddress?.filter(warning => 
                        warning.toLowerCase().includes('postal') || warning.toLowerCase().includes('zip')
                      ).map((warning, index) => (
                        <p key={index} className="text-sm text-yellow-600 mt-1">{warning}</p>
                      ))}
                    </div>
                    
                    <div>
                      <Label htmlFor="shipping-country">
                        {language === 'es' ? 'País' : 'Country'}
                      </Label>
                      <Input
                        id="shipping-country"
                        value={formData.shippingAddress.country}
                        onChange={(e) => handleInputChange('shippingAddress.country', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    {language === 'es' ? 'Método de pago' : 'Payment Method'}
                  </h3>
                  
                  <div className="p-3 border border-border rounded-md">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: 'hsl(var(--foreground))',
                            '::placeholder': {
                              color: 'hsl(var(--muted-foreground))',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!stripe || loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {language === 'es' 
                    ? `Pagar ${formatPrice(total)}`
                    : `Pay ${formatPrice(total)}`
                  }
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>
                {language === 'es' ? 'Resumen del pedido' : 'Order Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=100&h=100'}
                    alt={item.product.title[language]}
                    className="w-16 h-16 object-cover rounded"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {item.product.title[language]}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {language === 'es' ? 'Cantidad' : 'Quantity'}: {item.quantity}
                    </p>
                    <p className="font-medium text-sm">
                      {formatPrice(item.product.price_cents * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{language === 'es' ? 'Subtotal' : 'Subtotal'}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{language === 'es' ? 'Envío' : 'Shipping'}</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>{language === 'es' ? 'Total' : 'Total'}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;