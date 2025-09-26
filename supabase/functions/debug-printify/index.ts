import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const printifyApiKey = Deno.env.get('PRINTIFY_API_TOKEN') ?? Deno.env.get('PRINTIFY_API_KEY');
    if (!printifyApiKey) {
      throw new Error('Missing Printify API key');
    }

    // Get shops
    const shopsResponse = await fetch('https://api.printify.com/v1/shops.json', {
      headers: {
        'Authorization': `Bearer ${printifyApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!shopsResponse.ok) {
      throw new Error(`Shops API error: ${shopsResponse.status}`);
    }

    const shops = await shopsResponse.json();
    const shopId = shops[0]?.id;

    // Get products
    const productsResponse = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      headers: {
        'Authorization': `Bearer ${printifyApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!productsResponse.ok) {
      throw new Error(`Products API error: ${productsResponse.status}`);
    }

    const productsData = await productsResponse.json();
    const products = productsData.data || productsData;
    
    // Get first product details
    if (products && products.length > 0) {
      const firstProduct = products[0];
      
      const detailResponse = await fetch(`https://api.printify.com/v1/shops/${shopId}/products/${firstProduct.id}.json`, {
        headers: {
          'Authorization': `Bearer ${printifyApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const detailedProduct = await detailResponse.json();

      return new Response(
        JSON.stringify({
          shop_id: shopId,
          total_products: products.length,
          first_product_basic: firstProduct,
          first_product_detailed: detailedProduct,
          detailed_variants_count: detailedProduct.variants?.length || 0,
          detailed_available_variants: detailedProduct.variants?.filter((v: any) => v.available).length || 0,
          detailed_images_count: detailedProduct.images?.length || 0,
          detailed_images: detailedProduct.images || []
        }, null, 2),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'No products found' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    );

  } catch (error: any) {
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