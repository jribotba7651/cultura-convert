import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// HTML cleaning utilities (copied from src/utils/htmlCleaner.ts)
const cleanHTML = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  // Remove HTML tags
  let cleaned = html.replace(/<[^>]*>/g, '');
  
  // Decode common HTML entities including Spanish characters
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#39;': "'",
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—',
    '&aacute;': 'á',
    '&eacute;': 'é',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú',
    '&ntilde;': 'ñ',
    '&Aacute;': 'Á',
    '&Eacute;': 'É',
    '&Iacute;': 'Í',
    '&Oacute;': 'Ó',
    '&Uacute;': 'Ú',
    '&Ntilde;': 'Ñ',
    '&uuml;': 'ü',
    '&Uuml;': 'Ü',
    '&iquest;': '¿',
    '&iexcl;': '¡',
    '&deg;': '°',
    '&hellip;': '...',
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&rdquo;': '"',
    '&ldquo;': '"',
    '&trade;': '™',
    '&copy;': '©',
    '&reg;': '®'
  };
  
  Object.entries(entities).forEach(([entity, replacement]) => {
    cleaned = cleaned.replace(new RegExp(entity, 'g'), replacement);
  });
  
  // Remove extra whitespace and normalize
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

const extractFirstParagraph = (html: string): string => {
  if (!html) return '';
  
  // Try to find content within p tags first
  const pMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
  if (pMatch && pMatch[1]) {
    const cleaned = cleanHTML(pMatch[1]);
    return cleaned.length > 20 ? cleaned : cleanHTML(html);
  }
  
  // Try to get first sentence/line if no paragraphs
  const cleaned = cleanHTML(html);
  const sentences = cleaned.split(/[.!?]\s+/);
  if (sentences.length > 1 && sentences[0].length > 20) {
    return sentences[0] + '.';
  }
  
  // Return cleaned content up to first line break or 200 chars
  const firstLine = cleaned.split('\n')[0];
  if (firstLine.length > 200) {
    return firstLine.substring(0, 197) + '...';
  }
  
  return firstLine || cleaned;
};

const filterVariants = (variants: any[], productTitle: string): any[] => {
  if (!variants || variants.length === 0) return [];
  
  // Filter to only enabled and available variants
  const availableVariants = variants.filter(v => 
    (v.is_available !== false && v.available !== false) && 
    (v.is_enabled !== false && v.enabled !== false)
  );
  
  // If it's clothing, limit size/color combinations
  if (productTitle.toLowerCase().includes('shirt') || 
      productTitle.toLowerCase().includes('hoodie') || 
      productTitle.toLowerCase().includes('t-shirt')) {
    
    // Group by size first, then limit colors per size
    const sizeGroups: { [key: string]: any[] } = {};
    
    availableVariants.forEach(variant => {
      const sizeMatch = variant.title?.match(/\b(XS|S|M|L|XL|XXL|XXXL|2XL|3XL)\b/i);
      const size = sizeMatch ? sizeMatch[0] : 'One Size';
      
      if (!sizeGroups[size]) {
        sizeGroups[size] = [];
      }
      sizeGroups[size].push(variant);
    });
    
    // Limit to max 6 colors per size, prioritize basic colors
    const basicColors = ['black', 'white', 'navy', 'gray', 'red', 'blue'];
    const limitedVariants: any[] = [];
    
    Object.entries(sizeGroups).forEach(([size, variants]) => {
      // Sort by basic colors first, then by price
      const sorted = variants.sort((a, b) => {
        const aBasic = basicColors.some(color => 
          a.title?.toLowerCase().includes(color)
        ) ? 0 : 1;
        const bBasic = basicColors.some(color => 
          b.title?.toLowerCase().includes(color)
        ) ? 0 : 1;
        
        if (aBasic !== bBasic) return aBasic - bBasic;
        return (a.price || 0) - (b.price || 0);
      });
      
      limitedVariants.push(...sorted.slice(0, 6));
    });
    
    return limitedVariants.slice(0, 20); // Max 20 total variants
  }
  
  // For coffee and other products, limit to 10 variants
  return availableVariants.slice(0, 10);
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    // === AUTHENTICATION CHECK ===
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's JWT to verify identity
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Invalid token or user not found:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role using the has_role function
    const { data: hasAdminRole, error: roleError } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (roleError || !hasAdminRole) {
      console.error('User is not admin:', user.email, roleError?.message);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin access verified for:', user.email);
    // === END AUTHENTICATION CHECK ===

    // Use service role for actual operations
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

    const printifyProductIds = new Set(printifyProducts.map((p: any) => p.id));
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

        // Get filtered variants using intelligent filtering
        const availableVariants = filterVariants(detailedProduct.variants || [], detailedProduct.title);
        
        if (availableVariants.length === 0) {
          console.log(`Skipping product ${detailedProduct.title} - no available variants after filtering`);
          continue;
        }

        console.log(`Product ${detailedProduct.title} has ${availableVariants.length} variants after intelligent filtering (from ${(detailedProduct.variants || []).length} total)`);

        // Normalize all variant prices to cents
        const normalizedVariants = availableVariants.map((variant: any) => {
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
        const minPrice = Math.min(...normalizedVariants.map((v: any) => v.price));
        const maxPrice = Math.max(...normalizedVariants.map((v: any) => v.price));

        // Clean and process descriptions
        const cleanedDescription = extractFirstParagraph(detailedProduct.description || '');
        const fallbackDescription = 'Producto premium de Puerto Rico';
        
        const productData = {
          printify_product_id: product.id,
          title: {
            es: cleanHTML(detailedProduct.title || '').substring(0, 100) || 'Producto de Puerto Rico',
            en: cleanHTML(detailedProduct.title || '').substring(0, 100) || 'Product from Puerto Rico'
          },
          description: {
            es: cleanedDescription || fallbackDescription,
            en: cleanedDescription || 'Premium product from Puerto Rico'
          },
          category_id: categoryId,
          price_cents: minPrice,
          compare_at_price_cents: maxPrice > minPrice ? maxPrice : Math.round(minPrice * 1.2),
          images: (detailedProduct.images || []).map((img: any) => typeof img === 'string' ? img : img.src).filter(Boolean),
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

    console.log(`Admin ${user.email} completed sync. Synced ${syncedCount} products. Deactivated ${deletedProducts.length} deleted products.`);

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
