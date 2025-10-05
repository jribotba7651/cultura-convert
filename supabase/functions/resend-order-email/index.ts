import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const orderId = '0138bfe4-eea0-4a28-85aa-a40f3d40f7f2'
    
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    // Get product info
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
      .eq('order_id', orderId)

    if (itemsError) {
      console.error('Error fetching items:', itemsError)
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
        email: order.customer_email,
        data: {
          customerName: order.customer_name || 'Cliente',
          orderId: order.id,
          amount: ((order.total_amount_cents || 0) / 100).toFixed(2),
          items: productsWithInfo,
          orderDate: new Date(order.created_at).toLocaleDateString('es-PR'),
          trackingUrl: `https://cultura-convert.lovable.app/order-confirmation/${order.id}`
        }
      }
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      throw emailError
    }

    console.log('Email sent successfully:', emailData)

    // Send admin notification
    const { data: adminEmailData, error: adminEmailError } = await supabase.functions.invoke('send-auth-email', {
      body: {
        type: 'admin_new_order',
        email: 'jribot@gmail.com',
        data: {
          customerName: order.customer_name || 'Cliente',
          customerEmail: order.customer_email,
          customerPhone: order.customer_phone || 'No proporcionado',
          orderId: order.id,
          amount: ((order.total_amount_cents || 0) / 100).toFixed(2),
          items: productsWithInfo,
          orderDate: new Date(order.created_at).toLocaleDateString('es-PR'),
          shippingAddress: order.shipping_address,
          billingAddress: order.billing_address
        }
      }
    })

    if (adminEmailError) {
      console.error('Error sending admin email:', adminEmailError)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      customerEmail: emailData,
      adminEmail: adminEmailData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
