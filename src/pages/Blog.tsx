import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
            {t('blog')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('blogDescription')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{language === 'es' ? 'No hay publicaciones disponibles aún.' : 'No blog posts available yet.'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 hover:bg-card/80">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">
                        {language === 'es' ? post.category_es : post.category_en}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(post.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
                      </span>
                    </div>
                    <CardTitle className="text-xl line-clamp-2 text-foreground">
                      {language === 'es' ? post.title_es : post.title_en}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {language === 'es' ? post.excerpt_es : post.excerpt_en}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;