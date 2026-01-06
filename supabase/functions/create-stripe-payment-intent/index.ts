import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security: Maximum request size (1MB)
const MAX_REQUEST_SIZE = 1024 * 1024;

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Stripe client will be initialized inside the handler after validating the secret

interface CartItem {
  id: string;
  quantity: number;
  variant_id?: string;
}

interface CreatePaymentIntentRequest {
  items: CartItem[];
  shipping_address: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billing_address: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
}

// Country normalization helper
function normalizeCountry(input: any): string {
  if (!input) return '';
  const raw = String(input).trim();
  const upper = raw.toUpperCase();
  
  // Valid country codes
  const validCountryCodes = [
    'US', 'CA', 'MX', 'PR', 'GB', 'FR', 'DE', 'ES', 'IT', 'AU', 'BR', 'AR', 'CL', 'CO', 'PE'
  ];
  
  // If it's already a valid 2-letter code, return it
  if (upper.length === 2 && validCountryCodes.includes(upper)) {
    return upper;
  }
  
  // Country name mappings
  const map: Record<string, string> = {
    USA: 'US', 'UNITED STATES': 'US', 'UNITED STATES OF AMERICA': 'US', 'U.S.': 'US', 'U.S.A.': 'US',
    'PUERTO RICO': 'PR',
    CANADA: 'CA',
    MEXICO: 'MX', MÉXICO: 'MX',
    'UNITED KINGDOM': 'GB', UK: 'GB', BRITAIN: 'GB',
    FRANCE: 'FR', FRANCIA: 'FR',
    GERMANY: 'DE', ALEMANIA: 'DE',
    SPAIN: 'ES', ESPAÑA: 'ES',
    ITALY: 'IT', ITALIA: 'IT',
    AUSTRALIA: 'AU',
    BRAZIL: 'BR', BRASIL: 'BR',
    ARGENTINA: 'AR',
    CHILE: 'CL',
    COLOMBIA: 'CO',
    PERU: 'PE', PERÚ: 'PE',
  };
  
  return map[upper] || '';
}

// Server-side address validation (robust & sanitizing)
async function validateServerSideAddress(address: any): Promise<{ valid: boolean; errors?: string[] }> {
  const errors: string[] = [];

  // Coerce to safe strings
  const safe = {
    name: typeof address?.name === 'string' ? address.name.trim() : '',
    line1: typeof address?.line1 === 'string' ? address.line1.trim() : '',
    line2: typeof address?.line2 === 'string' ? address.line2.trim() : '',
    city: typeof address?.city === 'string' ? address.city.trim() : '',
    state: typeof address?.state === 'string' ? address.state.trim() : '',
    postal_code: typeof address?.postal_code === 'string' ? address.postal_code.trim() : '',
    country: normalizeCountry(address?.country),
  };

  // Basic validation
  if (safe.name.length < 2) {
    errors.push('Full name is required and must be at least 2 characters');
  }

  if (safe.line1.length < 5) {
    errors.push('Address line 1 is required and must be at least 5 characters');
  }

  if (safe.city.length < 2) {
    errors.push('City is required and must be at least 2 characters');
  }

  if (safe.state.length < 2) {
    errors.push('State is required');
  }

  if (!safe.postal_code) {
    errors.push('Postal code is required');
  }

  // Validate postal code format based on country
  if (safe.country === 'US' || safe.country === 'PR') {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(safe.postal_code)) {
      errors.push('Invalid US/PR postal code format');
    }
  }

  // Validate country code is exactly 2 letters and from our allowed list
  const validCountryCodes = [
    'US', 'CA', 'MX', 'PR', 'GB', 'FR', 'DE', 'ES', 'IT', 'AU', 'BR', 'AR', 'CL', 'CO', 'PE'
  ];
  
  if (!safe.country || safe.country.length !== 2 || !validCountryCodes.includes(safe.country)) {
    errors.push('Valid country code is required (2-letter code like US, CA, MX)');
  }

  // Sanitize text fields
  const sanitizeText = (text: string) => {
    return text.replace(/[<>'"]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        default: return char;
      }
    });
  };

  // Apply sanitized values back into original object for downstream usage
  address.name = sanitizeText(safe.name);
  address.line1 = sanitizeText(safe.line1);
  if (safe.line2) address.line2 = sanitizeText(safe.line2);
  address.city = sanitizeText(safe.city);
  address.state = sanitizeText(safe.state);
  address.postal_code = safe.postal_code;
  address.country = safe.country;

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting payment intent creation process');
    
    // Security: Check request size
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      console.log('Request too large:', contentLength);
      return new Response(JSON.stringify({ error: 'Request too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Parsing request body...');
    const {
      items,
      shipping_address,
      billing_address,
      customer_email,
      customer_name,
      customer_phone
    }: CreatePaymentIntentRequest = await req.json();

    console.log('Creating payment intent for items:', items.length);
    console.log('Customer email:', customer_email);

    // Validate shipping address server-side
    console.log('Validating shipping address...');
    const addressValidation = await validateServerSideAddress(shipping_address);
    if (!addressValidation.valid) {
      console.log('Address validation failed:', addressValidation.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid shipping address', 
          details: addressValidation.errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate order total
    console.log('Calculating order total...');
    let totalAmount = 0;
    const orderItems = [];
    let hasManualFulfillment = false;
    let hasPrintifyItems = false;

    for (const item of items) {
      console.log('Processing item:', item.id);
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.id)
        .single();

      if (error || !product) {
        console.error('Product fetch error:', error);
        throw new Error(`Product not found: ${item.id}`);
      }

      // Track fulfillment type
      if (product.printify_product_id) {
        hasPrintifyItems = true;
      } else {
        hasManualFulfillment = true;
      }

      let unitPrice = product.price_cents;
      
      // Use variant price if variant_id is provided
      if (item.variant_id && product.variants) {
        const variant = product.variants.find((v: any) => v.id === item.variant_id);
        if (variant && variant.price) {
          unitPrice = variant.price;
        }
      }
      
      const itemTotal = unitPrice * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price_cents: unitPrice,
        total_price_cents: itemTotal,
        variant_id: item.variant_id,
      });
    }

    console.log('Order fulfillment types - Manual:', hasManualFulfillment, 'Printify:', hasPrintifyItems);

    // Add shipping (flat rate for now - $5.99)
    const shippingAmount = 599;
    totalAmount += shippingAmount;
    
    console.log('Total amount calculated:', totalAmount);

    // Create payment intent
    console.log('Creating Stripe payment intent...');

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return new Response(
        JSON.stringify({ error: 'Payment processor not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extra safety: ensure we are not accidentally using the webhook secret
    if (!stripeKey.startsWith('sk_')) {
      console.error('STRIPE_SECRET_KEY appears misconfigured (expected to start with sk_)');
      return new Response(
        JSON.stringify({ error: 'Payment processor misconfigured (contact support)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      console.error('Invalid total amount for payment intent:', totalAmount);
      return new Response(
        JSON.stringify({ error: 'Invalid order total' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      metadata: {
        customer_email,
        customer_name,
        customer_phone: customer_phone || '',
        items_count: items.length.toString(),
      },
    });
    
    console.log('Stripe payment intent created:', paymentIntent.id);

    // Get current user if authenticated
    console.log('Checking authentication...');
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
        console.log('User authenticated:', userId ? 'yes' : 'no');
      } catch (error) {
        console.log('No authenticated user, proceeding with anonymous order');
      }
    }

    // Create order record
    console.log('Creating order record...');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId, // Set user_id if authenticated, null if anonymous
        total_amount_cents: totalAmount,
        shipping_amount_cents: shippingAmount,
        tax_amount_cents: 0,
        shipping_address,
        billing_address,
        customer_email,
        customer_name,
        customer_phone,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending',
        currency: 'USD',
        has_manual_fulfillment: hasManualFulfillment,
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }
    
    console.log('Order created with ID:', order.id);

    // Create order items
    console.log('Creating order items...');
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }
    
    console.log('Order items created successfully');

    // Generate secure access token for anonymous orders
    let accessToken = null;
    if (!userId) {
      console.log('Generating access token for anonymous order...');
      // Generate a cryptographically secure random token
      const tokenArray = new Uint8Array(32);
      crypto.getRandomValues(tokenArray);
      accessToken = Array.from(tokenArray, byte => byte.toString(16).padStart(2, '0')).join('');
      
      // Store the token in the database
      const { error: tokenError } = await supabase
        .from('order_access_tokens')
        .insert({
          order_id: order.id,
          token: accessToken,
        });

      if (tokenError) {
        console.error('Failed to create access token:', tokenError);
        // Don't fail the entire request, just log the error
      } else {
        console.log('Access token created successfully');
      }
    }

    console.log('Payment intent process completed successfully:', paymentIntent.id);

    const response = {
      client_secret: paymentIntent.client_secret,
      order_id: order.id,
      access_token: accessToken, // Include token for anonymous orders
      amount: totalAmount,
    };
    
    console.log('Returning successful response');

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);