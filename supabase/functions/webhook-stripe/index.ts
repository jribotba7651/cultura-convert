// Updated webhook with improved logging and CORS handling
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import Stripe from "https://esm.sh/stripe@14.21.0";

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Security: Maximum request size (2MB for webhooks)
const MAX_REQUEST_SIZE = 2 * 1024 * 1024;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  // Handle non-POST requests (like browser GET requests to webhook URL)
  if (req.method !== 'POST') {
    console.log(`Received ${req.method} request to webhook endpoint`);
    return new Response('Stripe webhook endpoint - POST only', { 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      status: 200 
    });
  }

  // Security: Check request size
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
    console.error('Request too large:', contentLength);
    return new Response('Request too large', { 
      headers: corsHeaders,
      status: 413 
    });
  }

  // Only process POST requests with proper Stripe signature
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    console.error('Missing stripe-signature header');
    return new Response('Missing stripe-signature header', { 
      headers: corsHeaders,
      status: 400 
    });
  }

  const body = await req.text();
  if (!body) {
    console.error('Missing request body');
    return new Response('Missing request body', { 
      headers: corsHeaders,
      status: 400 
    });
  }
  
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`Processing Stripe webhook: ${event.type} (ID: ${event.id})`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded - PaymentIntent: ${paymentIntent.id}, Amount: ${paymentIntent.amount}`);
        
        // Update order status
        const { error: orderError } = await supabase
          .from('orders')
          .update({ 
            status: 'paid'
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (orderError) {
          console.error('Failed to update order status:', orderError);
          throw new Error('Failed to update order status');
        }

        console.log(`Order status updated to 'paid' for PaymentIntent: ${paymentIntent.id}`);

        // Trigger Printify order creation
        const { error: printifyError } = await supabase.functions.invoke('create-printify-order', {
          body: { payment_intent_id: paymentIntent.id }
        });

        if (printifyError) {
          console.error('Failed to create Printify order:', printifyError);
          console.log('Continuing despite Printify error - order is still marked as paid');
        } else {
          console.log(`Printify order creation initiated for PaymentIntent: ${paymentIntent.id}`);
        }

        console.log(`✅ Payment processing complete for PaymentIntent: ${paymentIntent.id}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed - PaymentIntent: ${paymentIntent.id}, Last error: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`);
        
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'failed'
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Failed to update order status to failed:', error);
        } else {
          console.log(`Order status updated to 'failed' for PaymentIntent: ${paymentIntent.id}`);
        }

        console.log(`❌ Payment failure processed for PaymentIntent: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
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