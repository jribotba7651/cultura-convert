import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sanitizeText, validateInput } from '@/utils/sanitize';
import { validateAddress, formatZipCode } from '@/utils/addressValidation';
// NOTE: We now fetch the publishable key from a secure Edge Function to avoid env mismatches
let initialStripePromise: Promise<Stripe | null> | null = null;

interface CheckoutFormData {
  email: string;
  name: string;
  phone: string;
  createAccount: boolean;
  password: string;
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

const countries = [
  { code: 'US', name: { en: 'United States', es: 'Estados Unidos' } },
  { code: 'CA', name: { en: 'Canada', es: 'Canadá' } },
  { code: 'MX', name: { en: 'Mexico', es: 'México' } },
  { code: 'PR', name: { en: 'Puerto Rico', es: 'Puerto Rico' } },
  { code: 'GB', name: { en: 'United Kingdom', es: 'Reino Unido' } },
  { code: 'FR', name: { en: 'France', es: 'Francia' } },
  { code: 'DE', name: { en: 'Germany', es: 'Alemania' } },
  { code: 'ES', name: { en: 'Spain', es: 'España' } },
  { code: 'IT', name: { en: 'Italy', es: 'Italia' } },
  { code: 'AU', name: { en: 'Australia', es: 'Australia' } },
  { code: 'BR', name: { en: 'Brazil', es: 'Brasil' } },
  { code: 'AR', name: { en: 'Argentina', es: 'Argentina' } },
  { code: 'CL', name: { en: 'Chile', es: 'Chile' } },
  { code: 'CO', name: { en: 'Colombia', es: 'Colombia' } },
  { code: 'PE', name: { en: 'Peru', es: 'Perú' } },
];

const statesByCountry = {
  US: [
    { code: 'AL', name: { en: 'Alabama', es: 'Alabama' } },
    { code: 'AK', name: { en: 'Alaska', es: 'Alaska' } },
    { code: 'AZ', name: { en: 'Arizona', es: 'Arizona' } },
    { code: 'AR', name: { en: 'Arkansas', es: 'Arkansas' } },
    { code: 'CA', name: { en: 'California', es: 'California' } },
    { code: 'CO', name: { en: 'Colorado', es: 'Colorado' } },
    { code: 'CT', name: { en: 'Connecticut', es: 'Connecticut' } },
    { code: 'DE', name: { en: 'Delaware', es: 'Delaware' } },
    { code: 'FL', name: { en: 'Florida', es: 'Florida' } },
    { code: 'GA', name: { en: 'Georgia', es: 'Georgia' } },
    { code: 'HI', name: { en: 'Hawaii', es: 'Hawái' } },
    { code: 'ID', name: { en: 'Idaho', es: 'Idaho' } },
    { code: 'IL', name: { en: 'Illinois', es: 'Illinois' } },
    { code: 'IN', name: { en: 'Indiana', es: 'Indiana' } },
    { code: 'IA', name: { en: 'Iowa', es: 'Iowa' } },
    { code: 'KS', name: { en: 'Kansas', es: 'Kansas' } },
    { code: 'KY', name: { en: 'Kentucky', es: 'Kentucky' } },
    { code: 'LA', name: { en: 'Louisiana', es: 'Luisiana' } },
    { code: 'ME', name: { en: 'Maine', es: 'Maine' } },
    { code: 'MD', name: { en: 'Maryland', es: 'Maryland' } },
    { code: 'MA', name: { en: 'Massachusetts', es: 'Massachusetts' } },
    { code: 'MI', name: { en: 'Michigan', es: 'Michigan' } },
    { code: 'MN', name: { en: 'Minnesota', es: 'Minnesota' } },
    { code: 'MS', name: { en: 'Mississippi', es: 'Mississippi' } },
    { code: 'MO', name: { en: 'Missouri', es: 'Missouri' } },
    { code: 'MT', name: { en: 'Montana', es: 'Montana' } },
    { code: 'NE', name: { en: 'Nebraska', es: 'Nebraska' } },
    { code: 'NV', name: { en: 'Nevada', es: 'Nevada' } },
    { code: 'NH', name: { en: 'New Hampshire', es: 'Nuevo Hampshire' } },
    { code: 'NJ', name: { en: 'New Jersey', es: 'Nueva Jersey' } },
    { code: 'NM', name: { en: 'New Mexico', es: 'Nuevo México' } },
    { code: 'NY', name: { en: 'New York', es: 'Nueva York' } },
    { code: 'NC', name: { en: 'North Carolina', es: 'Carolina del Norte' } },
    { code: 'ND', name: { en: 'North Dakota', es: 'Dakota del Norte' } },
    { code: 'OH', name: { en: 'Ohio', es: 'Ohio' } },
    { code: 'OK', name: { en: 'Oklahoma', es: 'Oklahoma' } },
    { code: 'OR', name: { en: 'Oregon', es: 'Oregón' } },
    { code: 'PA', name: { en: 'Pennsylvania', es: 'Pensilvania' } },
    { code: 'RI', name: { en: 'Rhode Island', es: 'Rhode Island' } },
    { code: 'SC', name: { en: 'South Carolina', es: 'Carolina del Sur' } },
    { code: 'SD', name: { en: 'South Dakota', es: 'Dakota del Sur' } },
    { code: 'TN', name: { en: 'Tennessee', es: 'Tennessee' } },
    { code: 'TX', name: { en: 'Texas', es: 'Texas' } },
    { code: 'UT', name: { en: 'Utah', es: 'Utah' } },
    { code: 'VT', name: { en: 'Vermont', es: 'Vermont' } },
    { code: 'VA', name: { en: 'Virginia', es: 'Virginia' } },
    { code: 'WA', name: { en: 'Washington', es: 'Washington' } },
    { code: 'WV', name: { en: 'West Virginia', es: 'Virginia Occidental' } },
    { code: 'WI', name: { en: 'Wisconsin', es: 'Wisconsin' } },
    { code: 'WY', name: { en: 'Wyoming', es: 'Wyoming' } },
  ],
  CA: [
    { code: 'AB', name: { en: 'Alberta', es: 'Alberta' } },
    { code: 'BC', name: { en: 'British Columbia', es: 'Columbia Británica' } },
    { code: 'MB', name: { en: 'Manitoba', es: 'Manitoba' } },
    { code: 'NB', name: { en: 'New Brunswick', es: 'Nueva Brunswick' } },
    { code: 'NL', name: { en: 'Newfoundland and Labrador', es: 'Terranova y Labrador' } },
    { code: 'NS', name: { en: 'Nova Scotia', es: 'Nueva Escocia' } },
    { code: 'ON', name: { en: 'Ontario', es: 'Ontario' } },
    { code: 'PE', name: { en: 'Prince Edward Island', es: 'Isla del Príncipe Eduardo' } },
    { code: 'QC', name: { en: 'Quebec', es: 'Quebec' } },
    { code: 'SK', name: { en: 'Saskatchewan', es: 'Saskatchewan' } },
    { code: 'NT', name: { en: 'Northwest Territories', es: 'Territorios del Noroeste' } },
    { code: 'NU', name: { en: 'Nunavut', es: 'Nunavut' } },
    { code: 'YT', name: { en: 'Yukon', es: 'Yukón' } },
  ],
  MX: [
    { code: 'AGU', name: { en: 'Aguascalientes', es: 'Aguascalientes' } },
    { code: 'BCN', name: { en: 'Baja California', es: 'Baja California' } },
    { code: 'BCS', name: { en: 'Baja California Sur', es: 'Baja California Sur' } },
    { code: 'CAM', name: { en: 'Campeche', es: 'Campeche' } },
    { code: 'CHP', name: { en: 'Chiapas', es: 'Chiapas' } },
    { code: 'CHH', name: { en: 'Chihuahua', es: 'Chihuahua' } },
    { code: 'COA', name: { en: 'Coahuila', es: 'Coahuila' } },
    { code: 'COL', name: { en: 'Colima', es: 'Colima' } },
    { code: 'DUR', name: { en: 'Durango', es: 'Durango' } },
    { code: 'GUA', name: { en: 'Guanajuato', es: 'Guanajuato' } },
    { code: 'GRO', name: { en: 'Guerrero', es: 'Guerrero' } },
    { code: 'HID', name: { en: 'Hidalgo', es: 'Hidalgo' } },
    { code: 'JAL', name: { en: 'Jalisco', es: 'Jalisco' } },
    { code: 'MEX', name: { en: 'Mexico State', es: 'Estado de México' } },
    { code: 'MIC', name: { en: 'Michoacán', es: 'Michoacán' } },
    { code: 'MOR', name: { en: 'Morelos', es: 'Morelos' } },
    { code: 'NAY', name: { en: 'Nayarit', es: 'Nayarit' } },
    { code: 'NLE', name: { en: 'Nuevo León', es: 'Nuevo León' } },
    { code: 'OAX', name: { en: 'Oaxaca', es: 'Oaxaca' } },
    { code: 'PUE', name: { en: 'Puebla', es: 'Puebla' } },
    { code: 'QUE', name: { en: 'Querétaro', es: 'Querétaro' } },
    { code: 'ROO', name: { en: 'Quintana Roo', es: 'Quintana Roo' } },
    { code: 'SLP', name: { en: 'San Luis Potosí', es: 'San Luis Potosí' } },
    { code: 'SIN', name: { en: 'Sinaloa', es: 'Sinaloa' } },
    { code: 'SON', name: { en: 'Sonora', es: 'Sonora' } },
    { code: 'TAB', name: { en: 'Tabasco', es: 'Tabasco' } },
    { code: 'TAM', name: { en: 'Tamaulipas', es: 'Tamaulipas' } },
    { code: 'TLA', name: { en: 'Tlaxcala', es: 'Tlaxcala' } },
    { code: 'VER', name: { en: 'Veracruz', es: 'Veracruz' } },
    { code: 'YUC', name: { en: 'Yucatán', es: 'Yucatán' } },
    { code: 'ZAC', name: { en: 'Zacatecas', es: 'Zacatecas' } },
    { code: 'CMX', name: { en: 'Mexico City', es: 'Ciudad de México' } },
  ],
  AU: [
    { code: 'NSW', name: { en: 'New South Wales', es: 'Nueva Gales del Sur' } },
    { code: 'QLD', name: { en: 'Queensland', es: 'Queensland' } },
    { code: 'SA', name: { en: 'South Australia', es: 'Australia Meridional' } },
    { code: 'TAS', name: { en: 'Tasmania', es: 'Tasmania' } },
    { code: 'VIC', name: { en: 'Victoria', es: 'Victoria' } },
    { code: 'WA', name: { en: 'Western Australia', es: 'Australia Occidental' } },
    { code: 'ACT', name: { en: 'Australian Capital Territory', es: 'Territorio de la Capital Australiana' } },
    { code: 'NT', name: { en: 'Northern Territory', es: 'Territorio del Norte' } },
  ],
};

const getStatesForCountry = (countryCode: string) => {
  return statesByCountry[countryCode as keyof typeof statesByCountry] || [];
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [paymentRequest, setPaymentRequest] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [applePayProcessing, setApplePayProcessing] = useState(false);
  const [addressErrors, setAddressErrors] = useState<{[key: string]: string[]}>({});
  const [addressWarnings, setAddressWarnings] = useState<{[key: string]: string[]}>({});
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    name: '',
    phone: '',
    createAccount: false,
    password: '',
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

  // Initialize Payment Request for Apple Pay/Google Pay
  useEffect(() => {
    if (stripe) {
      console.log('🍎 Initializing Apple Pay/Google Pay Payment Request');
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: language === 'es' ? 'Total del pedido' : 'Order Total',
          amount: total,
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestPayerPhone: true,
        requestShipping: true,
        shippingOptions: [
          {
            id: 'standard',
            label: language === 'es' ? 'Envío estándar' : 'Standard Shipping',
            detail: language === 'es' ? '5-7 días laborales' : '5-7 business days',
            amount: shippingCost,
          },
        ],
      });

      // Check if Payment Request is available
      pr.canMakePayment().then((result) => {
        if (result) {
          console.log('✅ Apple Pay/Google Pay is available:', result);
          setPaymentRequest(pr);
        } else {
          console.log('❌ Apple Pay/Google Pay is NOT available on this device');
        }
      }).catch((error) => {
        console.error('❌ Error checking Apple Pay availability:', error);
      });

      // Handle shipping address change to update total dynamically
      pr.on('shippingaddresschange', (ev) => {
        console.log('📍 Shipping address changed:', ev.shippingAddress);
        
        // You can update shipping options based on address here
        ev.updateWith({
          status: 'success',
          shippingOptions: [
            {
              id: 'standard',
              label: language === 'es' ? 'Envío estándar' : 'Standard Shipping',
              detail: language === 'es' ? '5-7 días laborales' : '5-7 business days',
              amount: shippingCost,
            },
          ],
        });
      });

      pr.on('paymentmethod', async (ev) => {
        console.log('💳 Apple Pay payment method received');
        setApplePayProcessing(true);
        
        try {
          // Validate and extract shipping address
          const shippingAddress = {
            line1: ev.shippingAddress?.addressLine?.[0] || '',
            line2: ev.shippingAddress?.addressLine?.[1] || '',
            city: ev.shippingAddress?.city || '',
            state: ev.shippingAddress?.region || '',
            postal_code: ev.shippingAddress?.postalCode || '',
            country: ev.shippingAddress?.country?.toUpperCase() || 'US',
          };

          // Validate required fields
          if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.postal_code) {
            throw new Error(language === 'es' 
              ? 'Dirección de envío incompleta' 
              : 'Incomplete shipping address');
          }

          const updatedFormData = {
            email: ev.payerEmail || '',
            name: ev.payerName || '',
            phone: ev.payerPhone || '',
            shippingAddress,
            billingAddress: shippingAddress,
            sameAsShipping: true,
          };

          console.log('📦 Creating payment intent for Apple Pay order');

          // Create payment intent
          const { data, error } = await supabase.functions.invoke('create-stripe-payment-intent', {
            body: {
              items: items.map(item => ({
                id: item.product.id,
                quantity: item.quantity,
                variant_id: item.variant_id
              })),
              shipping_address: {
                name: updatedFormData.name,
                ...updatedFormData.shippingAddress
              },
              billing_address: {
                name: updatedFormData.name,
                ...updatedFormData.shippingAddress
              },
              customer_email: updatedFormData.email,
              customer_name: updatedFormData.name,
              customer_phone: updatedFormData.phone
            }
          });

          if (error) {
            console.error('❌ Payment intent creation error:', error);
            throw error;
          }

          console.log('✅ Payment intent created, confirming payment...');

          // Confirm payment
          const { error: confirmError } = await stripe.confirmCardPayment(
            data.client_secret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (confirmError) {
            console.error('❌ Payment confirmation error:', confirmError);
            ev.complete('fail');
            toast({
              title: language === 'es' ? 'Error en el pago' : 'Payment error',
              description: confirmError.message,
              variant: 'destructive',
            });
            setApplePayProcessing(false);
          } else {
            console.log('✅ Payment successful! Order ID:', data.order_id);
            ev.complete('success');
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
            
            setApplePayProcessing(false);
            navigate(`/order-confirmation/${data.order_id}`);
          }
        } catch (error: any) {
          console.error('❌ Apple Pay payment error:', error);
          ev.complete('fail');
          
          const errorMessage = error.message || (language === 'es' 
            ? 'Error procesando el pago con Apple Pay' 
            : 'Error processing Apple Pay payment');
          
          toast({
            title: language === 'es' ? 'Error en el pago' : 'Payment error',
            description: errorMessage,
            variant: 'destructive',
          });
          
          setApplePayProcessing(false);
        }
      });
    }
  }, [stripe, total, items, language, navigate, clearCart, toast]);


  const handleInputChange = (field: string, value: string | boolean) => {
    const keys = field.split('.');

    // Build next form state synchronously
    let nextForm = { ...formData } as typeof formData;
    if (keys.length === 1) {
      nextForm = { ...nextForm, [field as keyof CheckoutFormData]: value } as typeof formData;
    } else if (keys.length === 2) {
      const [group, key] = keys as ['shippingAddress' | 'billingAddress', keyof CheckoutFormData['shippingAddress']];
      nextForm = {
        ...nextForm,
        [group]: {
          ...nextForm[group],
          [key]: value as any,
        },
      };
      
      // Reset state when country changes
      if (key === 'country') {
        nextForm[group] = {
          ...nextForm[group],
          state: '',
        };
      }
    }

    setFormData(nextForm);

    // Real-time validate with the up-to-date state (no stale closure)
    if (field.includes('postal_code') || field.includes('country')) {
      const addressType = field.startsWith('shipping') ? 'shippingAddress' : 'billingAddress';
      const validation = validateAddress(nextForm[addressType], language);
      setAddressErrors(prev => ({
        ...prev,
        [addressType]: validation.errors,
      }));
      setAddressWarnings(prev => ({
        ...prev,
        [addressType]: validation.warnings,
      }));
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
    const shippingValidation = { isValid: true, errors: [] };
    const billingValidation = { isValid: true, errors: [] };
    
    // const shippingValidation = validateAddress(formData.shippingAddress, language);
    // const billingValidation = validateAddress(
    //   formData.sameAsShipping ? formData.shippingAddress : formData.billingAddress, 
    //   language
    // );

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
      // Create account if requested
      let userId = null;
      if (formData.createAccount && formData.password) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              emailRedirectTo: `${window.location.origin}/`
            }
          });

          if (authError) {
            console.error('Account creation error:', authError);
            toast({
              title: language === 'es' ? 'Error creando cuenta' : 'Account creation error',
              description: authError.message,
              variant: 'destructive',
            });
          } else if (authData.user) {
            userId = authData.user.id;
            console.log('Account created successfully');
          }
        } catch (accountError) {
          console.error('Account creation failed:', accountError);
          // Continue with order even if account creation fails
        }
      }

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
          customer_phone: formData.phone,
          user_id: userId
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

        // Send fallback confirmation email
        try {
          await supabase.functions.invoke('send-auth-email', {
            body: {
              type: 'order_confirmation',
              email: formData.email,
              data: {
                customerName: formData.name,
                orderId: data.order_id,
                amount: (paymentIntent.amount / 100).toFixed(2),
                items: items.map(item => ({
                  product_name: item.product.title?.es || item.product.title?.en || 'Producto',
                  quantity: item.quantity,
                  unit_price_cents: item.product.price_cents
                })),
                orderDate: new Date().toLocaleDateString('es-PR'),
                trackingUrl: `${window.location.origin}/order-confirmation/${data.order_id}`
              }
            }
          });
          console.log('Fallback confirmation email sent');
        } catch (emailError) {
          console.error('Fallback email failed:', emailError);
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

                {/* Account Creation Option */}
                <div className="border rounded-lg p-4 bg-accent/50">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="createAccount"
                      checked={formData.createAccount}
                      onCheckedChange={(checked) => handleInputChange('createAccount', checked)}
                    />
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="createAccount" className="text-sm font-medium cursor-pointer">
                        {language === 'es' 
                          ? '¿Crear cuenta para hacer seguimiento de pedidos?' 
                          : 'Create account to track orders?'
                        }
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {language === 'es'
                          ? 'Podrás ver el historial de compras y hacer recompras fácilmente.'
                          : 'You\'ll be able to view order history and reorder easily.'
                        }
                      </p>
                      
                      {formData.createAccount && (
                        <div className="mt-3">
                          <Label htmlFor="password" className="text-sm">
                            {language === 'es' ? 'Contraseña' : 'Password'}
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder={language === 'es' ? 'Crear contraseña' : 'Create password'}
                            className="mt-1"
                            required={formData.createAccount}
                          />
                        </div>
                      )}
                    </div>
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
                        {language === 'es' ? 'Estado/Provincia' : 'State/Province'}
                      </Label>
                      {getStatesForCountry(formData.shippingAddress.country).length > 0 ? (
                        <Select
                          value={formData.shippingAddress.state}
                          onValueChange={(value) => handleInputChange('shippingAddress.state', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'es' ? 'Seleccionar estado' : 'Select state'} />
                          </SelectTrigger>
                          <SelectContent className="bg-background border z-50">
                            {getStatesForCountry(formData.shippingAddress.country).map((state) => (
                              <SelectItem key={state.code} value={state.code}>
                                {state.name[language]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="shipping-state"
                          value={formData.shippingAddress.state}
                          onChange={(e) => handleInputChange('shippingAddress.state', e.target.value)}
                          placeholder={language === 'es' ? 'Estado/Provincia' : 'State/Province'}
                          required
                        />
                      )}
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
                      <Select
                        value={formData.shippingAddress.country}
                        onValueChange={(value) => handleInputChange('shippingAddress.country', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'es' ? 'Seleccionar país' : 'Select country'} />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name[language]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Billing Address */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="same-as-shipping"
                      checked={formData.sameAsShipping}
                      onCheckedChange={handleSameAsShippingChange}
                    />
                    <Label htmlFor="same-as-shipping">
                      {language === 'es' 
                        ? 'Dirección de facturación igual a la de envío' 
                        : 'Billing address same as shipping'}
                    </Label>
                  </div>

                  {!formData.sameAsShipping && (
                    <>
                      <h3 className="font-semibold">
                        {language === 'es' ? 'Dirección de facturación' : 'Billing Address'}
                      </h3>
                      
                      <div>
                        <Label htmlFor="billing-line1">
                          {language === 'es' ? 'Dirección' : 'Address'}
                        </Label>
                        <Input
                          id="billing-line1"
                          value={formData.billingAddress.line1}
                          onChange={(e) => handleInputChange('billingAddress.line1', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="billing-line2">
                          {language === 'es' ? 'Apartamento, suite, etc.' : 'Apartment, suite, etc.'}
                        </Label>
                        <Input
                          id="billing-line2"
                          value={formData.billingAddress.line2}
                          onChange={(e) => handleInputChange('billingAddress.line2', e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billing-city">
                            {language === 'es' ? 'Ciudad' : 'City'}
                          </Label>
                          <Input
                            id="billing-city"
                            value={formData.billingAddress.city}
                            onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="billing-state">
                            {language === 'es' ? 'Estado/Provincia' : 'State/Province'}
                          </Label>
                          {getStatesForCountry(formData.billingAddress.country).length > 0 ? (
                            <Select
                              value={formData.billingAddress.state}
                              onValueChange={(value) => handleInputChange('billingAddress.state', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={language === 'es' ? 'Seleccionar estado' : 'Select state'} />
                              </SelectTrigger>
                              <SelectContent className="bg-background border z-50">
                                {getStatesForCountry(formData.billingAddress.country).map((state) => (
                                  <SelectItem key={state.code} value={state.code}>
                                    {state.name[language]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id="billing-state"
                              value={formData.billingAddress.state}
                              onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                              placeholder={language === 'es' ? 'Estado/Provincia' : 'State/Province'}
                              required
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billing-postal">
                            {language === 'es' ? 'Código postal' : 'Postal code'}
                          </Label>
                          <Input
                            id="billing-postal"
                            value={formData.billingAddress.postal_code}
                            onChange={(e) => {
                              const formatted = formatZipCode(e.target.value, formData.billingAddress.country);
                              handleInputChange('billingAddress.postal_code', formatted);
                            }}
                            className={addressErrors.billingAddress?.some(error => 
                              error.toLowerCase().includes('postal') || error.toLowerCase().includes('zip')
                            ) ? 'border-destructive' : ''}
                            required
                          />
                          {addressErrors.billingAddress?.filter(error => 
                            error.toLowerCase().includes('postal') || error.toLowerCase().includes('zip')
                          ).map((error, index) => (
                            <p key={index} className="text-sm text-destructive mt-1">{error}</p>
                          ))}
                          {addressWarnings.billingAddress?.filter(warning => 
                            warning.toLowerCase().includes('postal') || warning.toLowerCase().includes('zip')
                          ).map((warning, index) => (
                            <p key={index} className="text-sm text-yellow-600 mt-1">{warning}</p>
                          ))}
                        </div>
                        
                        <div>
                          <Label htmlFor="billing-country">
                            {language === 'es' ? 'País' : 'Country'}
                          </Label>
                          <Select
                            value={formData.billingAddress.country}
                            onValueChange={(value) => handleInputChange('billingAddress.country', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={language === 'es' ? 'Seleccionar país' : 'Select country'} />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  {country.name[language]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Separator />

                {/* Apple Pay / Google Pay Button */}
                {paymentRequest && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <PaymentRequestButtonElement 
                        options={{ paymentRequest }}
                        className="StripeElement StripeElement--empty"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          {language === 'es' ? 'O paga con tarjeta' : 'Or pay with card'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

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
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(initialStripePromise);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // Fetch publishable key from Edge Function
        const { data, error } = await supabase.functions.invoke('get-stripe-publishable-key');
        if (error) throw error;
        const key = (data as any)?.publishableKey;
        if (typeof key === 'string' && key.startsWith('pk_')) {
          const p = loadStripe(key);
          if (!cancelled) setStripePromise(p);
        } else {
          // Fallback to test key if misconfigured
          const p = loadStripe('pk_test_51QdK4IGfIcOJCKx4mhHTfOcE6lRN6yyF9sZUYi7YdktKGqzksQkGEJzPL5ZVEFhyO8KMCaVOHnfJPLhAhOLNJK2v00T5qdgVrR');
          if (!cancelled) setStripePromise(p);
        }
      } catch (e) {
        const p = loadStripe('pk_test_51QdK4IGfIcOJCKx4mhHTfOcE6lRN6yyF9sZUYi7YdktKGqzksQkGEJzPL5ZVEFhyO8KMCaVOHnfJPLhAhOLNJK2v00T5qdgVrR');
        if (!cancelled) setStripePromise(p);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (!stripePromise) return null; // Avoid rendering until Stripe is ready

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;