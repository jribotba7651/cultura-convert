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
    console.log('Webhook received:', req.method)
    
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    console.log('Signature present:', !!signature)
    console.log('Body length:', body.length)

    if (!signature) {
      console.error('Missing stripe-signature header')
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET')
      return new Response(JSON.stringify({ error: 'Missing STRIPE_WEBHOOK_SECRET' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    let event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
      console.log('Webhook event constructed successfully:', event.type)
    } catch (webhookError) {
      console.error('Webhook signature verification failed:', webhookError instanceof Error ? webhookError.message : String(webhookError))
      return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        console.log('Payment succeeded:', paymentIntent.id)

        try {
          // Buscar la orden asociada
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('stripe_payment_intent_id', paymentIntent.id)
            .single()

          if (orderError) {
            console.error('Error finding order:', orderError)
            // Don't break, return success to Stripe even if order not found
            console.log('Order not found but returning success to Stripe')
            break
          }

          if (!order) {
            console.log('No order found for payment intent:', paymentIntent.id)
            // Don't break, return success to Stripe
            break
          }

          // Actualizar estado de la orden
          const { error: updateError } = await supabase
            .from('orders')
            .update({ 
              status: 'paid',
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id)

          if (updateError) {
            console.error('Error updating order status:', updateError)
          } else {
            console.log('Order status updated to paid:', order.id)
          }

        // Enviar email de confirmación
        try {
          const customerEmail = order.customer_email || paymentIntent.metadata?.customer_email
          const customerName = order.customer_name || paymentIntent.metadata?.customer_name

          if (customerEmail) {
            console.log('Sending confirmation email to:', customerEmail)

            // Obtener información completa de productos
            const { data: orderItems, error: itemsError } = await supabase
              .from('order_items')
              .select(`
                quantity,
                unit_price_cents,
                product_id,
                products!inner(
                  title,
                  images
                )
              `)
              .eq('order_id', order.id)

            if (itemsError) {
              console.error('Error fetching order items:', itemsError)
            }

            const productsWithInfo = orderItems?.map(item => ({
              product_name: (item.products as any)?.title?.es || (item.products as any)?.title?.en || 'Producto',
              quantity: item.quantity,
              unit_price_cents: item.unit_price_cents,
              image_url: (item.products as any)?.images?.[0] || null
            })) || []

            // Send customer confirmation email
            const { data: emailData, error: emailError } = await supabase.functions.invoke('send-auth-email', {
              body: {
                type: 'order_confirmation',
                email: customerEmail,
                data: {
                  customerName: customerName || 'Cliente',
                  orderId: order.id,
                  amount: (paymentIntent.amount / 100).toFixed(2),
                  items: productsWithInfo,
                  orderDate: new Date().toLocaleDateString('es-PR'),
                  trackingUrl: `https://cultura-convert.lovable.app/order-confirmation/${order.id}`
                }
              }
            })

            if (emailError) {
              console.error('Error sending customer confirmation email:', emailError)
            } else {
              console.log('Customer confirmation email sent successfully:', emailData)
            }

            // Send admin notification email
            const shippingAddress = order.shipping_address || {}
            const billingAddress = order.billing_address || {}
            
            const { data: adminEmailData, error: adminEmailError } = await supabase.functions.invoke('send-auth-email', {
              body: {
                type: 'admin_new_order',
                email: 'jribot@gmail.com',
                data: {
                  customerName: customerName || 'Cliente',
                  customerEmail: customerEmail,
                  customerPhone: order.customer_phone || 'No proporcionado',
                  orderId: order.id,
                  amount: (paymentIntent.amount / 100).toFixed(2),
                  items: productsWithInfo,
                  orderDate: new Date().toLocaleDateString('es-PR'),
                  shippingAddress,
                  billingAddress
                }
              }
            })

            if (adminEmailError) {
              console.error('Error sending admin notification email:', adminEmailError)
            } else {
              console.log('Admin notification email sent successfully:', adminEmailData)
            }
          } else {
            console.log('No customer email found for order:', order.id)
          }
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError)
        }

        } catch (processError) {
          console.error('Error processing payment_intent.succeeded:', processError)
          // Still return success to Stripe to avoid retries
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', paymentIntent.id)
        
        try {
          // Actualizar estado de la orden
          const { error: updateError } = await supabase
            .from('orders')
            .update({ status: 'failed' })
            .eq('stripe_payment_intent_id', paymentIntent.id)
            
          if (updateError) {
            console.error('Error updating failed order status:', updateError)
          }
        } catch (processError) {
          console.error('Error processing payment_intent.payment_failed:', processError)
        }
        
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
        // Return success for unhandled events to avoid Stripe retries
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : '';
    console.error('Webhook error:', errorMsg, errorStack)
    
    // For webhook signature errors, return 400
    if (errorMsg.includes('signature') || errorMsg.includes('timestamp')) {
      return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    // For other errors, return 500 but Stripe will still retry
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})