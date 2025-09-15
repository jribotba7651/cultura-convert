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
    
    const printifyApiKey = Deno.env.get('PRINTIFY_API_TOKEN');
    if (!printifyApiKey) {
      throw new Error('PRINTIFY_API_TOKEN not found');
    }

    // Fetch products from Printify
    const response = await fetch('https://api.printify.com/v1/shops.json', {
      headers: {
        'Authorization': `Bearer ${printifyApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.status}`);
    }

    const shops = await response.json();
    console.log('Found shops:', shops.length);

    if (shops.length === 0) {
      throw new Error('No Printify shops found');
    }

    const shopId = shops[0].id;

    // Fetch products from the first shop
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
    console.log('Found products:', printifyProducts.length);

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

    let syncedCount = 0;

    for (const product of printifyProducts) {
      try {
        // Check if product already exists
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('printify_product_id', product.id)
          .single();

        // Filter and normalize all variant prices to cents
        const availableVariants = (product.variants || []).filter(variant => variant.available);
        
        if (availableVariants.length === 0) {
          console.log(`Skipping product ${product.title} - no available variants`);
          continue;
        }

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
            es: product.title,
            en: product.title
          },
          description: {
            es: product.description || 'Café premium de Puerto Rico',
            en: product.description || 'Premium coffee from Puerto Rico'
          },
          category_id: categoryId,
          price_cents: minPrice,
          compare_at_price_cents: maxPrice > minPrice ? maxPrice : Math.round(minPrice * 1.2),
          images: product.images?.map(img => img.src) || [],
          variants: normalizedVariants,
          tags: product.tags || ['coffee', 'puerto rico', 'artisanal'],
          is_active: true,
          printify_data: product
        };


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