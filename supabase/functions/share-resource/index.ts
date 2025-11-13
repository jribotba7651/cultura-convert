import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug') || url.pathname.split('/').pop();
    const lang = url.searchParams.get('lang') || 'es';

    if (!slug) {
      return new Response('Missing slug parameter', { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch resource from database
    const { data: resource, error } = await supabase
      .from('consulting_resources')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !resource) {
      return new Response('Resource not found', { status: 404 });
    }

    // Get localized content
    const title = lang === 'es' ? resource.title_es : resource.title_en;
    const description = lang === 'es' ? resource.description_es : resource.description_en;
    const ogImage = 'https://www.jibaroenlaluna.com/og-image.jpg';
    const canonicalPath = lang === 'es' ? 'recursos' : 'resources';
    const canonicalUrl = `https://www.jibaroenlaluna.com/${canonicalPath}/${slug}`;

    // Generate HTML with Open Graph meta tags
    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Jíbaro en la Luna</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Jíbaro en la Luna">
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Redirect to actual resource page -->
  <meta http-equiv="refresh" content="0; url=${canonicalUrl}">
  <script>
    window.location.href = '${canonicalUrl}';
  </script>
</head>
<body>
  <p>Redirecting to <a href="${canonicalUrl}">${title}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error in share-resource:', error);
    return new Response('Internal server error', { status: 500 });
  }
});
