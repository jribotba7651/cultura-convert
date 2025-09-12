import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { payment_intent_id } = await req.json();
    
    console.log('Creating Printify order for payment intent:', payment_intent_id);

    const printifyApiKey = Deno.env.get('PRINTIFY_API_TOKEN');
    if (!printifyApiKey) {
      throw new Error('PRINTIFY_API_TOKEN not found');
    }

    // Get order details - ensure single row even if duplicates exist
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('stripe_payment_intent_id', payment_intent_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found or multiple matched: ${orderError?.message ?? 'no matching order'}`);
    }

    // Get first shop ID
    const shopsResponse = await fetch('https://api.printify.com/v1/shops.json', {
      headers: {
        'Authorization': `Bearer ${printifyApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!shopsResponse.ok) {
      throw new Error(`Failed to fetch shops: ${shopsResponse.status}`);
    }

    const shops = await shopsResponse.json();
    if (shops.length === 0) {
      throw new Error('No Printify shops found');
    }

    const shopId = shops[0].id;

    // Prepare line items for Printify
    const lineItems = order.order_items.map((item: any) => ({
      product_id: item.products.printify_product_id,
      variant_id: item.variant_id || item.products.printify_data?.variants?.[0]?.id || '1',
      quantity: item.quantity,
    }));

    // Create Printify order
    const printifyOrderData = {
      external_id: order.id,
      line_items: lineItems,
      shipping_method: 1, // Standard shipping
      is_printify_express: false,
      send_shipping_notification: true,
      address_to: {
        first_name: order.customer_name.split(' ')[0] || '',
        last_name: order.customer_name.split(' ').slice(1).join(' ') || '',
        email: order.customer_email,
        phone: order.customer_phone || '',
        country: order.shipping_address.country,
        region: order.shipping_address.state,
        address1: order.shipping_address.line1,
        address2: order.shipping_address.line2 || '',
        city: order.shipping_address.city,
        zip: order.shipping_address.postal_code,
      },
    };

    const createOrderResponse = await fetch(`https://api.printify.com/v1/shops/${shopId}/orders.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printifyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(printifyOrderData),
    });

    if (!createOrderResponse.ok) {
      const errorText = await createOrderResponse.text();
      throw new Error(`Failed to create Printify order: ${createOrderResponse.status} - ${errorText}`);
    }

    const printifyOrder = await createOrderResponse.json();
    console.log('Printify order created:', printifyOrder.id);

    // Submit order for production
    const submitResponse = await fetch(`https://api.printify.com/v1/shops/${shopId}/orders/${printifyOrder.id}/send_to_production.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printifyApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!submitResponse.ok) {
      console.warn('Failed to submit order to production:', submitResponse.status);
    }

    // Update order with Printify order ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        printify_order_id: printifyOrder.id,
        status: 'processing'
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Failed to update order with Printify ID:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        printify_order_id: printifyOrder.id,
        message: 'Order successfully sent to Printify for production'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error creating Printify order:', error);
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