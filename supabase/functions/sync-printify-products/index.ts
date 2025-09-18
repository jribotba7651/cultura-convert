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

interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  images: Array<{ src: string; alt?: string }>;
  variants: Array<{
    id: string;
    title: string;
    price: number;
    sku: string;
    available: boolean;
  }>;
  tags: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Printify product sync...');
    
    const printifyApiKey = Deno.env.get('PRINTIFY_API_TOKEN') ?? Deno.env.get('PRINTIFY_API_KEY');
    if (!printifyApiKey) {
      throw new Error('Missing Printify API key. Set PRINTIFY_API_TOKEN or PRINTIFY_API_KEY in Supabase secrets.');
    }

    // Resolve shop ID (prefer configured one)
    const configuredShopId = Deno.env.get('PRINTIFY_SHOP_ID');
    let shopId: string;

    if (configuredShopId) {
      shopId = configuredShopId;
      console.log('Using configured Printify shop ID:', shopId);
    } else {
      // Fetch shops from Printify
      const response = await fetch('https://api.printify.com/v1/shops.json', {
        headers: {
          'Authorization': `Bearer ${printifyApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Printify API error: ${response.status} - ${errText}`);
      }

      const shops = await response.json();
      console.log('Found shops:', shops.length);

      if (shops.length === 0) {
        throw new Error('No Printify shops found');
      }

      shopId = shops[0].id;
    }


    console.log(`Fetching products from shop: ${shopId}`);
    
    // Fetch products from the first shop
    const productsResponse = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      headers: {
        'Authorization': `Bearer ${printifyApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Products response status: ${productsResponse.status}`);
    
    if (!productsResponse.ok) {
      const errorText = await productsResponse.text();
      console.error(`Products API error: ${productsResponse.status} - ${errorText}`);
      throw new Error(`Failed to fetch products: ${productsResponse.status} - ${errorText}`);
    }

    const productsData = await productsResponse.json();
    console.log('Raw products response:', JSON.stringify(productsData, null, 2));
    
    const printifyProducts = productsData.data || productsData;
    console.log('Found products:', printifyProducts?.length || 0);
    console.log('First product sample:', printifyProducts?.[0]);

    // Get current active products from database to identify deleted ones
    const { data: currentProducts } = await supabase
      .from('products')
      .select('id, printify_product_id')
      .eq('is_active', true)
      .not('printify_product_id', 'is', null);

    const printifyProductIds = new Set(printifyProducts.map(p => p.id));
    const deletedProducts = (currentProducts || []).filter(
      p => p.printify_product_id && !printifyProductIds.has(p.printify_product_id)
    );

    // Deactivate products that no longer exist in Printify
    if (deletedProducts.length > 0) {
      console.log(`Deactivating ${deletedProducts.length} deleted products...`);
      const { error: deactivateError } = await supabase
        .from('products')
        .update({ is_active: false })
        .in('id', deletedProducts.map(p => p.id));
      
      if (deactivateError) {
        console.error('Failed to deactivate deleted products:', deactivateError);
      } else {
        console.log('Successfully deactivated deleted products');
      }
    }

    // Create or update coffee category
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'coffee')
      .single();

    let categoryId = existingCategory?.id;

    if (!categoryId) {
      const { data: newCategory, error: categoryError } = await supabase
        .from('categories')
        .insert({
          slug: 'coffee',
          name: {
            es: 'Café Puertorriqueño',
            en: 'Puerto Rican Coffee'
          },
          description: {
            es: 'Café artesanal de las montañas de Puerto Rico',
            en: 'Artisanal coffee from the mountains of Puerto Rico'
          },
          image_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=400&h=300'
        })
        .select('id')
        .single();

      if (categoryError) {
        throw new Error(`Failed to create category: ${categoryError.message}`);
      }
      categoryId = newCategory.id;
    }

    if (!printifyProducts || printifyProducts.length === 0) {
      console.log('No products found in Printify API response');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No products found to sync',
          syncedCount: 0,
          deactivatedCount: 0,
          totalProducts: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

let syncedCount = 0;

    for (const product of printifyProducts) {
      try {
        console.log(`Processing product ${product.id}: ${product.title}`);
        
        // Get DETAILED product info with variants and images
        const detailResponse = await fetch(`https://api.printify.com/v1/shops/${shopId}/products/${product.id}.json`, {
          headers: {
            'Authorization': `Bearer ${printifyApiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!detailResponse.ok) {
          console.error(`Failed to fetch product details for ${product.id}: ${detailResponse.status}`);
          continue;
        }

        const detailedProduct = await detailResponse.json();
        console.log(`Detailed product:`, detailedProduct.title);
        console.log(`Product variants count:`, detailedProduct.variants?.length || 0);
        console.log(`Product images count:`, detailedProduct.images?.length || 0);
        
        // Check if product already exists
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('printify_product_id', product.id)
          .single();

        // Get variants from DETAILED product data
        const availableVariants = (detailedProduct.variants || []).filter((variant: any) => ((variant.is_available ?? variant.available) && (variant.is_enabled ?? true)));
        
        if (availableVariants.length === 0) {
          console.log(`Skipping product ${detailedProduct.title} - no available variants`);
          continue;
        }

        console.log(`Product ${detailedProduct.title} has ${availableVariants.length} available variants`);

        // Normalize all variant prices to cents
        const normalizedVariants = availableVariants.map(variant => {
          const rawPrice = variant.price ?? 15.99;
          const normalized_price_cents = Number.isFinite(rawPrice)
            ? ((Number.isInteger(rawPrice) && (rawPrice as number) >= 100)
                ? Math.round(rawPrice as number)
                : Math.round((rawPrice as number) * 100))
            : 1599;
          
          return {
            ...variant,
            price: normalized_price_cents
          };
        });

        // Get minimum price from available variants for product base price
        const minPrice = Math.min(...normalizedVariants.map(v => v.price));
        const maxPrice = Math.max(...normalizedVariants.map(v => v.price));

        const productData = {
          printify_product_id: product.id,
          title: {
            es: detailedProduct.title,
            en: detailedProduct.title
          },
          description: {
            es: detailedProduct.description || 'Producto premium de Puerto Rico',
            en: detailedProduct.description || 'Premium product from Puerto Rico'
          },
          category_id: categoryId,
          price_cents: minPrice,
          compare_at_price_cents: maxPrice > minPrice ? maxPrice : Math.round(minPrice * 1.2),
          images: (detailedProduct.images || []).map(img => typeof img === 'string' ? img : img.src).filter(Boolean),
          variants: normalizedVariants,
          tags: detailedProduct.tags || ['puerto rico', 'artisanal'],
          is_active: true,
          printify_data: detailedProduct
        };

        console.log(`Product data for ${product.id}:`, {
          title: productData.title,
          images_count: productData.images.length,
          images_sample: productData.images.slice(0, 2),
          variants_count: normalizedVariants.length
        });


        if (existingProduct) {
          const { error: updateError } = await supabase
            .from('products')
            .update(productData)
            .eq('id', existingProduct.id);

          if (updateError) {
            console.error('Failed to update product:', product.id, updateError);
            continue;
          }
        } else {
          const { error: insertError } = await supabase
            .from('products')
            .insert(productData);

          if (insertError) {
            console.error('Failed to insert product:', product.id, insertError);
            continue;
          }
        }

        syncedCount++;
        console.log(`Synced product: ${product.title} - Price: $${(minPrice/100).toFixed(2)} (${normalizedVariants.length} variants)`);
      } catch (error) {
        console.error('Error processing product:', product.id, error);
      }
    }

    console.log(`Sync completed. Synced ${syncedCount} products. Deactivated ${deletedProducts.length} deleted products.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${syncedCount} products and deactivated ${deletedProducts.length} deleted products`,
        syncedCount,
        deactivatedCount: deletedProducts.length,
        totalProducts: printifyProducts.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in sync-printify-products:', error);
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