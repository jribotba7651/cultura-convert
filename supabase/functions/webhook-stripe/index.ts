import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      throw new Error('Missing stripe-signature header')
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET')
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        console.log('Payment succeeded:', paymentIntent.id)

        // Buscar la orden asociada
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (orderError) {
          console.error('Error finding order:', orderError)
          break
        }

        if (!order) {
          console.log('No order found for payment intent:', paymentIntent.id)
          break
        }

        // Actualizar estado de la orden
        await supabase
          .from('orders')
          .update({ 
            status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id)

        // Enviar email de confirmación
        try {
          const customerEmail = order.customer_email || paymentIntent.metadata?.customer_email
          const customerName = order.customer_name || paymentIntent.metadata?.customer_name

          if (customerEmail) {
            console.log('Sending confirmation email to:', customerEmail)

            // Llamar a la función de envío de emails
            const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-auth-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
              },
              body: JSON.stringify({
                type: 'order_confirmation',
                email: customerEmail,
                data: {
                  customerName: customerName || 'Cliente',
                  orderId: order.id,
                  amount: (paymentIntent.amount / 100).toFixed(2),
                  items: order.order_items,
                  orderDate: new Date().toLocaleDateString('es-PR')
                }
              })
            })

            if (emailResponse.ok) {
              console.log('Confirmation email sent successfully')
            } else {
              const emailError = await emailResponse.text()
              console.error('Error sending email:', emailError)
            }
          } else {
            console.log('No customer email found for order:', order.id)
          }
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError)
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', paymentIntent.id)
        
        // Actualizar estado de la orden
        await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('Webhook error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})