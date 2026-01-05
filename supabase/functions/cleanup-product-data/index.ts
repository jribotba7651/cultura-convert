import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HTML cleaning utilities
const cleanHTML = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  let cleaned = html.replace(/<[^>]*>/g, '');
  
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
  
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

const extractFirstParagraph = (html: string): string => {
  if (!html) return '';
  
  const pMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
  if (pMatch && pMatch[1]) {
    const cleaned = cleanHTML(pMatch[1]);
    return cleaned.length > 20 ? cleaned : cleanHTML(html);
  }
  
  const cleaned = cleanHTML(html);
  const sentences = cleaned.split(/[.!?]\s+/);
  if (sentences.length > 1 && sentences[0].length > 20) {
    return sentences[0] + '.';
  }
  
  const firstLine = cleaned.split('\n')[0];
  if (firstLine.length > 200) {
    return firstLine.substring(0, 197) + '...';
  }
  
  return firstLine || cleaned;
};

const filterVariants = (variants: any[], productTitle: string): any[] => {
  if (!variants || variants.length === 0) return [];
  
  const availableVariants = variants.filter(v => 
    (v.is_available !== false && v.available !== false) && 
    (v.is_enabled !== false && v.enabled !== false)
  );
  
  if (productTitle.toLowerCase().includes('shirt') || 
      productTitle.toLowerCase().includes('hoodie') || 
      productTitle.toLowerCase().includes('t-shirt')) {
    
    const sizeGroups: { [key: string]: any[] } = {};
    
    availableVariants.forEach(variant => {
      const sizeMatch = variant.title?.match(/\b(XS|S|M|L|XL|XXL|XXXL|2XL|3XL)\b/i);
      const size = sizeMatch ? sizeMatch[0] : 'One Size';
      
      if (!sizeGroups[size]) {
        sizeGroups[size] = [];
      }
      sizeGroups[size].push(variant);
    });
    
    const basicColors = ['black', 'white', 'navy', 'gray', 'red', 'blue'];
    const limitedVariants: any[] = [];
    
    Object.entries(sizeGroups).forEach(([size, variants]) => {
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
    
    return limitedVariants.slice(0, 20);
  }
  
  return availableVariants.slice(0, 10);
};

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

    console.log('Starting product data cleanup...');

    // Get all products from database
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*');

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No products found to clean up',
          updatedCount: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    let updatedCount = 0;

    for (const product of products) {
      try {
        let needsUpdate = false;
        const updatedData: any = {};

        // Clean titles
        const esTitle = typeof product.title?.es === 'string' ? product.title.es : '';
        const enTitle = typeof product.title?.en === 'string' ? product.title.en : '';
        const cleanedEsTitle = cleanHTML(esTitle);
        const cleanedEnTitle = cleanHTML(enTitle);

        if (cleanedEsTitle !== esTitle || cleanedEnTitle !== enTitle) {
          updatedData.title = {
            es: cleanedEsTitle || 'Producto de Puerto Rico',
            en: cleanedEnTitle || 'Product from Puerto Rico'
          };
          needsUpdate = true;
        }

        // Clean descriptions
        const esDesc = typeof product.description?.es === 'string' ? product.description.es : '';
        const enDesc = typeof product.description?.en === 'string' ? product.description.en : '';
        const cleanedEsDesc = extractFirstParagraph(esDesc);
        const cleanedEnDesc = extractFirstParagraph(enDesc);

        if (cleanedEsDesc !== esDesc || cleanedEnDesc !== enDesc) {
          updatedData.description = {
            es: cleanedEsDesc || 'Producto premium de Puerto Rico',
            en: cleanedEnDesc || 'Premium product from Puerto Rico'
          };
          needsUpdate = true;
        }

        // Filter variants
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 20) {
          const titleToUse = updatedData.title?.es || product.title?.es || '';
          const filteredVariants = filterVariants(product.variants, titleToUse);
          
          if (filteredVariants.length !== product.variants.length) {
            updatedData.variants = filteredVariants;
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('products')
            .update(updatedData)
            .eq('id', product.id);

          if (updateError) {
            console.error(`Failed to update product ${product.id}:`, updateError);
            continue;
          }

          updatedCount++;
          console.log(`Cleaned up product: ${product.title?.es || product.title?.en}`);
        }

      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
      }
    }

    console.log(`Admin ${user.email} completed cleanup. Updated ${updatedCount} products.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully cleaned up ${updatedCount} products`,
        updatedCount,
        totalProducts: products.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in cleanup-product-data:', error);
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
