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

    // Extract client information for logging.
    // x-forwarded-for can be a comma-separated chain ("1.2.3.4, 10.0.0.1") behind proxies.
    // Postgres `inet` only accepts a single address, so take the FIRST entry only.
    const rawForwarded = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const clientIP = rawForwarded.split(',')[0]?.trim() || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Rate limiting is defense-in-depth, NOT a customer-facing gate.
    // If the check itself errors (bad IP, RPC failure), we log and FAIL OPEN.
    let rateLimited = false;
    try {
      const { data: rateLimitCheck, error: rateLimitError } = await supabase.rpc(
        'check_order_access_rate_limit',
        { p_ip_address: clientIP, p_order_id: order_id }
      );
      if (rateLimitError) {
        console.error('Rate limit RPC failed, failing open:', rateLimitError);
      } else if (rateLimitCheck === false) {
        rateLimited = true;
      }
    } catch (rateLimitException) {
      console.error('Rate limit check threw, failing open:', rateLimitException);
    }

    if (rateLimited) {
      console.log(`Rate limit exceeded for IP ${clientIP} on order ${order_id}`);
      try {
        await supabase.rpc('log_order_access', {
          p_order_id: order_id,
          p_access_method: 'token',
          p_ip_address: clientIP,
          p_user_agent: userAgent,
          p_success: false,
          p_error_message: 'Rate limit exceeded'
        });
      } catch (logError) {
        console.error('Failed to log rate limit event:', logError);
      }
      
      return new Response(
        JSON.stringify({ error: 'Too many failed attempts. Please try again later.', code: 'rate_limited' }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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

    // Check access permissions with enhanced security and logging
    let hasAccess = false;
    let accessMethod = '';
    let errorMessage = '';

    // Case 1: Authenticated user accessing their own order
    if (userId && order.user_id === userId) {
      hasAccess = true;
      accessMethod = 'authenticated_user';
      console.log('Access granted: authenticated user owns order');
    }
    // Case 2: Anonymous order with valid access token
    else if (!order.user_id && access_token) {
      try {
        // Set the access token context for RLS validation
        const { error: contextError } = await supabase
          .rpc('set_order_access_context', {
            p_order_id: order_id,
            p_token: access_token
          });

        if (!contextError) {
          hasAccess = true;
          accessMethod = 'token';
          console.log('Access granted: valid access token for anonymous order');
          
          // Update token usage tracking
          await supabase
            .from('order_access_tokens')
            .update({ 
              access_count: 1, // Will be incremented by a trigger or RPC call
              last_accessed_at: new Date().toISOString()
            })
            .eq('order_id', order_id)
            .eq('token', access_token)
            .eq('is_active', true);
        } else {
          errorMessage = 'Invalid, expired, or inactive access token';
          console.log(errorMessage, contextError);
        }
      } catch (error) {
        errorMessage = 'Token validation failed';
        console.log(errorMessage, error);
      }
    } else if (!order.user_id && !access_token) {
      errorMessage = 'Anonymous order requires access token';
    } else if (order.user_id && !userId) {
      errorMessage = 'Order belongs to authenticated user but no authentication provided';
    } else {
      errorMessage = 'User does not own this order';
    }

    // Log access attempt (never allow logging failures to break the response)
    try {
      await supabase.rpc('log_order_access', {
        p_order_id: order_id,
        p_access_method: accessMethod || 'unknown',
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_success: hasAccess,
        p_error_message: errorMessage || null
      });
    } catch (logError) {
      console.error('Failed to log order access:', logError);
    }

    if (!hasAccess) {
      // Record failed access attempt for rate limiting (best effort)
      try {
        await supabase.rpc('record_order_access_attempt', {
          p_ip_address: clientIP,
          p_order_id: order_id,
          p_success: false
        });
      } catch (attemptError) {
        console.error('Failed to record access attempt:', attemptError);
      }

      console.log('Access denied for order:', order_id, '-', errorMessage);
      return new Response(
        JSON.stringify({ error: 'Access denied', code: 'access_denied' }),
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