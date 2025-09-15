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
    console.log('Received Printify webhook');
    
    const body = await req.json();
    console.log('Webhook payload:', JSON.stringify(body, null, 2));

    const { event, data } = body;

    switch (event) {
      case 'product:updated':
      case 'product:publish-started':
      case 'product:publish-succeeded':
        console.log(`Processing ${event} for product ID: ${data?.id}`);
        
        // Trigger a product sync for the specific product or full sync
        const { data: syncResult, error: syncError } = await supabase.functions.invoke('sync-printify-products');
        
        if (syncError) {
          console.error('Failed to trigger sync after webhook:', syncError);
        } else {
          console.log('Successfully triggered sync after webhook:', syncResult);
        }
        break;

      case 'product:deleted':
        console.log(`Product deleted: ${data?.id}`);
        
        // Deactivate the product in our database
        if (data?.id) {
          const { error: deactivateError } = await supabase
            .from('products')
            .update({ is_active: false })
            .eq('printify_product_id', data.id);
          
          if (deactivateError) {
            console.error('Failed to deactivate deleted product:', deactivateError);
          } else {
            console.log('Successfully deactivated deleted product');
          }
        }
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return new Response(
      JSON.stringify({ success: true, event, processed: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error processing Printify webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);