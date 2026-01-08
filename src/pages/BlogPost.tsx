import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdSenseAd } from "@/components/AdSenseAd";
import { NewsletterModal } from "@/components/NewsletterModal";
import { ArrowLeft, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { cleanMarkdown } from '@/utils/htmlCleaner';

// Convert markdown-style links to HTML and handle basic markdown
const processContent = (content: string): string => {
  if (!content) return '';
  
  // Check if content is already HTML (from TipTap editor)
  if (content.includes('<p>') || content.includes('<div>') || content.includes('<figure')) {
    return content;
  }
  
  // Convert markdown links [text](url) to HTML
  let processed = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');
  
  // Convert double newlines to paragraphs
  const paragraphs = processed.split(/\n\n+/);
  processed = paragraphs
    .filter(p => p.trim())
    .map(p => `<p class="mb-4">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');
  
  return processed;
};

interface BlogPostData {
  id: string;
  title_en: string;
  title_es: string;
  excerpt_en: string;
  excerpt_es: string;
  content_en: string;
  content_es: string;
  category_en: string;
  category_es: string;
  slug: string;
  tags: string[];
  date: string;
  cover_image?: string;
}

const BlogPost = () => {
  const { slug } = useParams();
  const { language } = useLanguage();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Post not found</h1>
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <NewsletterModal />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/blog" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al blog
        </Link>

        <article className="prose prose-lg max-w-none">
          <header className="mb-8 not-prose">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary">
                {language === 'es' ? post.category_es : post.category_en}
              </Badge>
              <span className="text-muted-foreground">
                {new Date(post.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight">
              {language === 'es' ? post.title_es : post.title_en}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              {cleanMarkdown(language === 'es' ? post.excerpt_es : post.excerpt_en)}
            </p>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {post.cover_image && (
            <img
              src={post.cover_image}
              alt={language === 'es' ? post.title_es : post.title_en}
              className="w-full h-auto rounded-lg mb-8"
            />
          )}

          {/* Ad at article start */}
          <AdSenseAd adSlot="4747218112" adFormat="rectangle" className="my-6" />

          <div 
            className="text-foreground leading-relaxed prose prose-lg max-w-none
                       prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                       prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto
                       prose-p:mb-4 prose-headings:text-foreground"
            dangerouslySetInnerHTML={{ 
              __html: processContent(language === 'es' ? post.content_es : post.content_en) 
            }}
          />

          {/* Ad at article end */}
          <AdSenseAd adSlot="4747218112" adFormat="horizontal" className="my-6" />
        </article>

        <div className="mt-12 pt-8 border-t border-border">
          <Link to="/blog">
            <Button variant="outline" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al blog
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default BlogPost;