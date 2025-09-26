import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    const { order_id, user_id } = await req.json()

    if (!order_id || !user_id) {
      throw new Error('Missing order_id or user_id')
    }

    // Update the order to link it to the user
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        user_id: user_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .is('user_id', null) // Only update if it's currently anonymous

    if (updateError) {
      console.error('Error updating order:', updateError)
      throw new Error('Failed to migrate order')
    }

    // Invalidate any access tokens for this order since it's now linked to a user
    const { error: tokenError } = await supabase
      .from('order_access_tokens')
      .update({ is_active: false })
      .eq('order_id', order_id)

    if (tokenError) {
      console.error('Error invalidating tokens:', tokenError)
      // Don't throw here as the main migration succeeded
    }

    console.log('Order migrated successfully:', order_id, 'to user:', user_id)

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Order migrated successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('Migration error:', err instanceof Error ? err.message : String(err))
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})