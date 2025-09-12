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

interface VerifyOrderAccessRequest {
  order_id: string;
  access_token?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, access_token }: VerifyOrderAccessRequest = await req.json();

    console.log('Verifying access for order:', order_id);

    // Check if user is authenticated
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
        console.log('Authenticated user found:', userId);
      } catch (error) {
        console.log('No authenticated user');
      }
    }

    // First, try to get the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            title,
            images,
            price_cents
          )
        )
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Check access permissions
    let hasAccess = false;

    // Case 1: Authenticated user accessing their own order
    if (userId && order.user_id === userId) {
      hasAccess = true;
      console.log('Access granted: authenticated user owns order');
    }
    // Case 2: Anonymous order with valid access token
    else if (!order.user_id && access_token) {
      const { data: tokenData, error: tokenError } = await supabase
        .from('order_access_tokens')
        .select('*')
        .eq('order_id', order_id)
        .eq('token', access_token)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (!tokenError && tokenData) {
        hasAccess = true;
        console.log('Access granted: valid access token for anonymous order');
      } else {
        console.log('Invalid or expired access token');
      }
    }

    if (!hasAccess) {
      console.log('Access denied for order:', order_id);
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Return order data
    return new Response(
      JSON.stringify({ order }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error verifying order access:', error);
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