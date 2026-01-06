import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// List of all blog post URLs from Blogspot (extracted from archive)
const BLOGSPOT_POSTS = [
  { url: 'https://jibaroenlaluna.blogspot.com/2025/04/por-que-no-regreso-mi-isla-el-corazon.html', date: '2025-04-27' },
  { url: 'https://jibaroenlaluna.blogspot.com/2021/06/los-jibaros-y-sus-andanzas.html', date: '2021-06-07' },
  { url: 'https://jibaroenlaluna.blogspot.com/2020/07/jibaros-en-la-pandemia-2020.html', date: '2020-07-24' },
  { url: 'https://jibaroenlaluna.blogspot.com/2019/06/los-jibaros-y-la-nueva-luna.html', date: '2019-06-06' },
  { url: 'https://jibaroenlaluna.blogspot.com/2016/06/una-proteina.html', date: '2016-06-02' },
  { url: 'https://jibaroenlaluna.blogspot.com/2016/05/aprender-es-vivir.html', date: '2016-05-24' },
  { url: 'https://jibaroenlaluna.blogspot.com/2016/05/jibara-tekjob.html', date: '2016-05-18' },
  { url: 'https://jibaroenlaluna.blogspot.com/2016/04/una-jibara-y-la-moda.html', date: '2016-04-08' },
  { url: 'https://jibaroenlaluna.blogspot.com/2016/02/el-jibaro-y-su-retiro.html', date: '2016-02-05' },
  { url: 'https://jibaroenlaluna.blogspot.com/2015/12/los-jibaros-y-su-viaje-navidad-2015.html', date: '2015-12-30' },
  { url: 'https://jibaroenlaluna.blogspot.com/2015/12/los-jibaros-y-su-viaje-navidad-2015_29.html', date: '2015-12-29' },
  { url: 'https://jibaroenlaluna.blogspot.com/2015/10/los-jibaros-y-el-cientifico.html', date: '2015-10-05' },
  { url: 'https://jibaroenlaluna.blogspot.com/2015/08/los-jibaros-y-su-viaje-parte-2.html', date: '2015-08-24' },
  { url: 'https://jibaroenlaluna.blogspot.com/2015/08/los-jibaros-y-su-viaje.html', date: '2015-08-17' },
  { url: 'https://jibaroenlaluna.blogspot.com/2015/06/los-jibaros-y-el-viaje-de-la-jibarita.html', date: '2015-06-01' },
  { url: 'https://jibaroenlaluna.blogspot.com/2015/03/el-jibaro-busca-trabajo-parte-2.html', date: '2015-03-30' },
  { url: 'https://jibaroenlaluna.blogspot.com/2015/03/el-jibaro-busca-trabajo.html', date: '2015-03-04' },
  { url: 'https://jibaroenlaluna.blogspot.com/2015/01/el-jibaro-y-la-realidad.html', date: '2015-01-22' },
  { url: 'https://jibaroenlaluna.blogspot.com/2015/01/el-jibaro-y-su-mudanza.html', date: '2015-01-12' },
  { url: 'https://jibaroenlaluna.blogspot.com/2015/01/el-jibaro-y-la-ciencia.html', date: '2015-01-06' },
  { url: 'https://jibaroenlaluna.blogspot.com/2014/07/los-jibaros-comen-rico.html', date: '2014-07-28' },
  { url: 'https://jibaroenlaluna.blogspot.com/2012/10/los-jibaros-en-el-otono.html', date: '2012-10-11' },
  { url: 'https://jibaroenlaluna.blogspot.com/2012/09/los-jibaros-toman-las-calles.html', date: '2012-09-18' },
  { url: 'https://jibaroenlaluna.blogspot.com/2012/09/los-jibaros-se-van-de-vacaciones.html', date: '2012-09-07' },
  { url: 'https://jibaroenlaluna.blogspot.com/2012/08/los-jibaros-trabajan-mientras-uno.html', date: '2012-08-31' },
  { url: 'https://jibaroenlaluna.blogspot.com/2012/08/los-jibaros-se-pasean.html', date: '2012-08-22' },
  { url: 'https://jibaroenlaluna.blogspot.com/2012/08/jibaros-en-la-luna.html', date: '2012-08-09' },
];

async function fetchBlogPost(url: string): Promise<{ title: string; content: string; images: string[]; labels: string[] } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<h3[^>]*class=['\"]post-title[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i) ||
                       html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : 'Sin título';
    title = title.replace(/\s*\|\s*Jibaros En La Luna.*$/i, '').trim();
    title = decodeHtmlEntities(title);
    
    // Extract content from post-body
    const contentMatch = html.match(/<div[^>]*class=['\"][^'\"]*post-body[^'\"]*['\"][^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class=['\"][^'\"]*post-footer/i) ||
                         html.match(/<div[^>]*class=['\"][^'\"]*post-body[^'\"]*['\"][^>]*>([\s\S]*?)<\/div>/i);
    let content = contentMatch ? contentMatch[1] : '';
    
    // Extract images from content
    const imageRegex = /<img[^>]*src=['\"]([^'\"]+)['\"][^>]*>/gi;
    const images: string[] = [];
    let imgMatch;
    while ((imgMatch = imageRegex.exec(content)) !== null) {
      const imgUrl = imgMatch[1];
      if (imgUrl.includes('blogger.googleusercontent.com') || imgUrl.includes('blogspot.com')) {
        // Get the highest resolution version
        const highResUrl = imgUrl.replace(/\/[s]\d+(-c)?\//, '/s1600/').replace(/=w\d+-h\d+/, '=s1600');
        images.push(highResUrl);
      }
    }
    
    // Also check for linked images in anchor tags
    const anchorImgRegex = /<a[^>]*href=['\"]([^'\"]*blogger\.googleusercontent[^'\"]+)['\"][^>]*>/gi;
    while ((imgMatch = anchorImgRegex.exec(content)) !== null) {
      const imgUrl = imgMatch[1];
      if (!images.includes(imgUrl)) {
        images.push(imgUrl);
      }
    }
    
    // Extract labels/tags
    const labelsRegex = /search\/label\/([^'\"]+)['\"]/gi;
    const labels: string[] = [];
    let labelMatch;
    while ((labelMatch = labelsRegex.exec(html)) !== null) {
      const label = decodeURIComponent(labelMatch[1]).replace(/\+/g, ' ');
      if (!labels.includes(label)) {
        labels.push(label);
      }
    }
    
    // Clean content - convert HTML to more readable format
    content = cleanHtmlContent(content);
    
    return { title, content, images, labels };
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '\"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)))
    .replace(/&([a-z]+);/gi, (match, entity) => {
      const entities: Record<string, string> = {
        'ntilde': 'ñ', 'Ntilde': 'Ñ',
        'aacute': 'á', 'Aacute': 'Á',
        'eacute': 'é', 'Eacute': 'É',
        'iacute': 'í', 'Iacute': 'Í',
        'oacute': 'ó', 'Oacute': 'Ó',
        'uacute': 'ú', 'Uacute': 'Ú',
        'uuml': 'ü', 'Uuml': 'Ü'
      };
      return entities[entity] || match;
    });
}

function cleanHtmlContent(html: string): string {
  // Remove script and style tags
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  
  // Remove Blogger-specific elements
  html = html.replace(/<div[^>]*class=['\"][^'\"]*separator[^'\"]*['\"][^>]*>/gi, '<p>');
  
  // Convert breaks to newlines
  html = html.replace(/<br\s*\/?>/gi, '\n');
  
  // Convert divs and paragraphs
  html = html.replace(/<\/div>/gi, '\n');
  html = html.replace(/<\/p>/gi, '\n\n');
  html = html.replace(/<p[^>]*>/gi, '');
  html = html.replace(/<div[^>]*>/gi, '');
  
  // Keep links
  html = html.replace(/<a[^>]*href=['\"]([^'\"]+)['\"][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  
  // Remove remaining HTML tags but keep image references as placeholders
  html = html.replace(/<img[^>]*>/gi, '[IMAGEN]');
  html = html.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  html = decodeHtmlEntities(html);
  
  // Clean up whitespace
  html = html.replace(/\n{3,}/g, '\n\n');
  html = html.trim();
  
  return html;
}

async function uploadImageToStorage(
  supabase: ReturnType<typeof createClient>,
  imageUrl: string,
  postSlug: string,
  imageIndex: number
): Promise<string | null> {
  try {
    console.log(`Downloading image: ${imageUrl}`);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to download image: ${response.status}`);
      return null;
    }
    
    const imageBlob = await response.blob();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const extension = contentType.includes('png') ? 'png' : 
                      contentType.includes('gif') ? 'gif' : 
                      contentType.includes('webp') ? 'webp' : 'jpg';
    
    const fileName = `blog/${postSlug}/image-${imageIndex}.${extension}`;
    
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, imageBlob, {
        contentType,
        upsert: true
      });
    
    if (error) {
      console.error(`Failed to upload image:`, error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);
    
    console.log(`Uploaded image to: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error(`Error uploading image:`, error);
    return null;
  }
}

function generateSlug(title: string, date: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
  
  return `${date.substring(0, 7)}-${slug}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, postIndex } = await req.json();
    
    if (action === 'list') {
      // Return list of posts to migrate
      return new Response(
        JSON.stringify({ success: true, posts: BLOGSPOT_POSTS }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'migrate-single' && postIndex !== undefined) {
      const postInfo = BLOGSPOT_POSTS[postIndex];
      if (!postInfo) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid post index' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      console.log(`Migrating post ${postIndex + 1}/${BLOGSPOT_POSTS.length}: ${postInfo.url}`);
      
      // Fetch blog post content
      const post = await fetchBlogPost(postInfo.url);
      if (!post) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to fetch post' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      const slug = generateSlug(post.title, postInfo.date);
      
      // Check if already migrated
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (existing) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            skipped: true, 
            message: 'Post already exists',
            title: post.title 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Upload images
      const uploadedImages: string[] = [];
      for (let i = 0; i < post.images.length; i++) {
        const uploadedUrl = await uploadImageToStorage(supabase, post.images[i], slug, i);
        if (uploadedUrl) {
          uploadedImages.push(uploadedUrl);
        }
      }
      
      // Use first image as cover
      const coverImage = uploadedImages.length > 0 ? uploadedImages[0] : null;
      
      // Create excerpt from first 150 chars
      const excerpt = post.content.substring(0, 200).replace(/\[IMAGEN\]/g, '').trim() + '...';
      
      // Insert blog post
      const { data: insertedPost, error: insertError } = await supabase
        .from('blog_posts')
        .insert({
          slug,
          title_es: post.title,
          title_en: post.title, // Same title for now
          excerpt_es: excerpt,
          excerpt_en: excerpt, // Same excerpt for now
          content_es: post.content,
          content_en: post.content, // Same content for now
          category_es: 'Vida en la Diáspora',
          category_en: 'Diaspora Life',
          tags: post.labels.length > 0 ? post.labels : ['Jibaros', 'Puerto Rico', 'Diáspora'],
          cover_image: coverImage,
          images: uploadedImages.length > 0 ? uploadedImages : null,
          published: true,
          featured: false,
          date: new Date(postInfo.date).toISOString()
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(
          JSON.stringify({ success: false, error: insertError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          post: {
            id: insertedPost.id,
            title: post.title,
            slug,
            imagesCount: uploadedImages.length
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'migrate-all') {
      const results = [];
      
      for (let i = 0; i < BLOGSPOT_POSTS.length; i++) {
        const postInfo = BLOGSPOT_POSTS[i];
        console.log(`Processing ${i + 1}/${BLOGSPOT_POSTS.length}: ${postInfo.url}`);
        
        try {
          const post = await fetchBlogPost(postInfo.url);
          if (!post) {
            results.push({ index: i, url: postInfo.url, success: false, error: 'Failed to fetch' });
            continue;
          }
          
          const slug = generateSlug(post.title, postInfo.date);
          
          // Check if already migrated
          const { data: existing } = await supabase
            .from('blog_posts')
            .select('id')
            .eq('slug', slug)
            .single();
          
          if (existing) {
            results.push({ index: i, title: post.title, success: true, skipped: true });
            continue;
          }
          
          // Upload images
          const uploadedImages: string[] = [];
          for (let j = 0; j < Math.min(post.images.length, 10); j++) { // Limit to 10 images per post
            const uploadedUrl = await uploadImageToStorage(supabase, post.images[j], slug, j);
            if (uploadedUrl) {
              uploadedImages.push(uploadedUrl);
            }
          }
          
          const coverImage = uploadedImages.length > 0 ? uploadedImages[0] : null;
          const excerpt = post.content.substring(0, 200).replace(/\[IMAGEN\]/g, '').trim() + '...';
          
          const { error: insertError } = await supabase
            .from('blog_posts')
            .insert({
              slug,
              title_es: post.title,
              title_en: post.title,
              excerpt_es: excerpt,
              excerpt_en: excerpt,
              content_es: post.content,
              content_en: post.content,
              category_es: 'Vida en la Diáspora',
              category_en: 'Diaspora Life',
              tags: post.labels.length > 0 ? post.labels : ['Jibaros', 'Puerto Rico', 'Diáspora'],
              cover_image: coverImage,
              images: uploadedImages.length > 0 ? uploadedImages : null,
              published: true,
              featured: false,
              date: new Date(postInfo.date).toISOString()
            });
          
          if (insertError) {
            results.push({ index: i, title: post.title, success: false, error: insertError.message });
          } else {
            results.push({ index: i, title: post.title, success: true, imagesCount: uploadedImages.length });
          }
        } catch (error) {
          results.push({ index: i, url: postInfo.url, success: false, error: String(error) });
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
