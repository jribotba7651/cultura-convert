import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { blogPosts } from "@/data/blogPosts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdSenseAd } from "@/components/AdSenseAd";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";

const BlogPost = () => {
  const { slug } = useParams();
  const { language } = useLanguage();
  
  const post = blogPosts.find(p => p.slug === slug);

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
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/blog" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al blog
        </Link>

        <article className="prose prose-lg max-w-none">
          <header className="mb-8 not-prose">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary">
                {post.category[language]}
              </Badge>
              <span className="text-muted-foreground">
                {new Date(post.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight">
              {post.title[language]}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              {post.excerpt[language]}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </header>

          {/* Ad at article start */}
          <AdSenseAd adSlot="3456789012" adFormat="rectangle" className="my-6" />

          <div className="text-foreground leading-relaxed space-y-6">
            {post.content[language].split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Ad at article end */}
          <AdSenseAd adSlot="4567890123" adFormat="horizontal" className="my-6" />
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