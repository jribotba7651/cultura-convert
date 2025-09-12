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

const handler = async (req: Request): Promise<Response> => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  
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

  console.log('Processing Stripe webhook:', event.type);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
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

        // Trigger Printify order creation
        const { error: printifyError } = await supabase.functions.invoke('create-printify-order', {
          body: { payment_intent_id: paymentIntent.id }
        });

        if (printifyError) {
          console.error('Failed to create Printify order:', printifyError);
        }

        console.log('Payment succeeded for order:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'failed'
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Failed to update order status:', error);
        }

        console.log('Payment failed for order:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);