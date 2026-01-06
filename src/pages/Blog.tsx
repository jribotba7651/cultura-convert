import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { NewsletterModal } from "@/components/NewsletterModal";
import Navigation from "@/components/Navigation";
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Loader2, Calendar, Tag } from 'lucide-react';
import { cleanMarkdown } from '@/utils/htmlCleaner';

interface BlogPost {
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
  published: boolean;
  cover_image?: string;
}

const Blog = () => {
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('date', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'es' ? 'es-ES' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  const getTitle = (post: BlogPost) => language === 'es' ? post.title_es : post.title_en;
  const getExcerpt = (post: BlogPost) => cleanMarkdown(language === 'es' ? post.excerpt_es : post.excerpt_en);
  const getCategory = (post: BlogPost) => language === 'es' ? post.category_es : post.category_en;

  const [featuredPost, ...previousPosts] = posts;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <NewsletterModal />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            {t('blog')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('blogDescription')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="max-w-[900px] mx-auto bg-card rounded-lg border p-12 text-center">
            <p className="text-muted-foreground">
              {language === 'es' ? 'No hay publicaciones disponibles aún.' : 'No blog posts available yet.'}
            </p>
          </div>
        ) : (
          <div className="max-w-[900px] mx-auto space-y-12">
            {/* Hero Section - Featured Post */}
            {featuredPost && (
              <Link to={`/blog/${featuredPost.slug}`} className="block group">
                <article className="rounded-xl overflow-hidden border bg-card transition-all duration-300 hover:shadow-xl hover:border-primary/30">
                  {/* Cover Image */}
                  <div className="aspect-[2/1] w-full overflow-hidden bg-muted">
                    {featuredPost.cover_image ? (
                      <img
                        src={featuredPost.cover_image}
                        alt={getTitle(featuredPost)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-6xl opacity-30">📖</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge variant="default" className="bg-primary text-primary-foreground">
                        {getCategory(featuredPost)}
                      </Badge>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(featuredPost.date)}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {getTitle(featuredPost)}
                    </h2>
                    
                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
                      {getExcerpt(featuredPost)}
                    </p>
                    
                    {featuredPost.tags && featuredPost.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        {featuredPost.tags.slice(0, 4).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            )}

            {/* Previous Posts - Vertical List */}
            {previousPosts.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-6 border-b pb-3">
                  {language === 'es' ? 'Publicaciones Anteriores' : 'Previous Posts'}
                </h2>
                
                <div className="space-y-6">
                  {previousPosts.map((post) => (
                    <Link key={post.id} to={`/blog/${post.slug}`} className="block group">
                      <article className="flex gap-5 p-4 rounded-lg border bg-card transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:bg-card/80">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0 w-[180px] md:w-[200px] aspect-[16/10] rounded-md overflow-hidden bg-muted">
                          {post.cover_image ? (
                            <img
                              src={post.cover_image}
                              alt={getTitle(post)}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                              <span className="text-3xl opacity-30">📖</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {getCategory(post)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(post.date)}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {getTitle(post)}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {getExcerpt(post)}
                          </p>
                          
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {post.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;
