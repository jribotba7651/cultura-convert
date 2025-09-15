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
    console.log('Checking price discrepancies between database and Printify...');
    
    const printifyApiKey = Deno.env.get('PRINTIFY_API_TOKEN');
    if (!printifyApiKey) {
      throw new Error('PRINTIFY_API_TOKEN not found');
    }

    // Get all active products from database
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, title, price_cents, printify_product_id, updated_at')
      .eq('is_active', true)
      .not('printify_product_id', 'is', null);

    if (dbError) throw dbError;

    // Fetch shops and products from Printify
    const shopsResponse = await fetch('https://api.printify.com/v1/shops.json', {
      headers: {
        'Authorization': `Bearer ${printifyApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!shopsResponse.ok) {
      throw new Error(`Printify API error: ${shopsResponse.status}`);
    }

    const shops = await shopsResponse.json();
    const shopId = shops[0]?.id;

    if (!shopId) {
      throw new Error('No Printify shops found');
    }

    const productsResponse = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      headers: {
        'Authorization': `Bearer ${printifyApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!productsResponse.ok) {
      throw new Error(`Failed to fetch products: ${productsResponse.status}`);
    }

    const { data: printifyProducts } = await productsResponse.json();

    // Create a map for quick lookup
    const printifyMap = new Map();
    printifyProducts.forEach(product => {
      const availableVariants = (product.variants || []).filter(v => v.available);
      if (availableVariants.length > 0) {
        const prices = availableVariants.map(v => {
          const rawPrice = v.price ?? 15.99;
          return Number.isFinite(rawPrice)
            ? ((Number.isInteger(rawPrice) && rawPrice >= 100)
                ? Math.round(rawPrice)
                : Math.round(rawPrice * 100))
            : 1599;
        });
        printifyMap.set(product.id, {
          title: product.title,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          variantCount: availableVariants.length
        });
      }
    });

    // Check for discrepancies
    const discrepancies = [];
    const missingInPrintify = [];

    dbProducts.forEach(dbProduct => {
      if (!dbProduct.printify_product_id) return;

      const printifyData = printifyMap.get(dbProduct.printify_product_id);
      
      if (!printifyData) {
        missingInPrintify.push({
          id: dbProduct.id,
          title: dbProduct.title,
          printify_product_id: dbProduct.printify_product_id
        });
        return;
      }

      if (dbProduct.price_cents !== printifyData.minPrice) {
        discrepancies.push({
          id: dbProduct.id,
          title: dbProduct.title,
          database_price_cents: dbProduct.price_cents,
          printify_min_price_cents: printifyData.minPrice,
          printify_max_price_cents: printifyData.maxPrice,
          variant_count: printifyData.variantCount,
          last_updated: dbProduct.updated_at,
          difference_cents: printifyData.minPrice - dbProduct.price_cents
        });
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        discrepancies,
        missingInPrintify,
        summary: {
          total_db_products: dbProducts.length,
          total_printify_products: printifyProducts.length,
          discrepancies_found: discrepancies.length,
          missing_in_printify: missingInPrintify.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error checking price discrepancies:', error);
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