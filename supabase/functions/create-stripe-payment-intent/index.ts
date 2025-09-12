import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
});

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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      items,
      shipping_address,
      billing_address,
      customer_email,
      customer_name,
      customer_phone
    }: CreatePaymentIntentRequest = await req.json();

    console.log('Creating payment intent for items:', items.length);

    // Calculate order total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.id)
        .single();

      if (error || !product) {
        throw new Error(`Product not found: ${item.id}`);
      }

      const unitPrice = product.price_cents;
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

    // Add shipping (flat rate for now - $5.99)
    const shippingAmount = 599;
    totalAmount += shippingAmount;

    // Create payment intent
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

    // Get current user if authenticated
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      } catch (error) {
        console.log('No authenticated user, proceeding with anonymous order');
      }
    }

    // Create order record
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
      })
      .select('id')
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // Generate secure access token for anonymous orders
    let accessToken = null;
    if (!userId) {
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
      }
    }

    console.log('Payment intent created:', paymentIntent.id);

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        order_id: order.id,
        access_token: accessToken, // Include token for anonymous orders
        amount: totalAmount,
      }),
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