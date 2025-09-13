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
    const { action, productId } = await req.json();
    
    if (!action || !productId) {
      throw new Error('Missing required parameters: action and productId');
    }

    let result;
    
    switch (action) {
      case 'deactivate':
        result = await supabase
          .from('products')
          .update({ is_active: false })
          .eq('id', productId)
          .select();
        break;
        
      case 'activate':
        result = await supabase
          .from('products')
          .update({ is_active: true })
          .eq('id', productId)
          .select();
        break;
        
      case 'delete':
        result = await supabase
          .from('products')
          .delete()
          .eq('id', productId);
        break;
        
      default:
        throw new Error(`Invalid action: ${action}. Supported actions: deactivate, activate, delete`);
    }

    if (result.error) {
      throw new Error(`Failed to ${action} product: ${result.error.message}`);
    }

    console.log(`Successfully ${action}d product ${productId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Product ${action}d successfully`,
        action,
        productId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in manage-product:', error);
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