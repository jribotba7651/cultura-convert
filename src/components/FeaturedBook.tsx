import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Book } from "@/types/Book";
import { ShoppingCart, Star, TrendingUp, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isValidURL } from "@/utils/sanitize";
import { useBookAnalytics } from "@/hooks/useBookAnalytics";

interface FeaturedBookProps {
  book: Book;
  badge?: string;
}

export const FeaturedBook = ({ book, badge }: FeaturedBookProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { trackBuyDirectClick, trackAmazonClick } = useBookAnalytics();

  const handleBuyDirect = () => {
    trackBuyDirectClick({ slug: book.slug, language: language as 'en' | 'es', component: 'featured' });
    navigate(`/libro/${book.slug}`);
  };

  const handleAmazonClick = () => {
    const url = book.amazonUrl || book.amazonHardcoverUrl || book.amazonSoftcoverUrl;
    if (url && isValidURL(url)) {
      trackAmazonClick({ slug: book.slug, language: language as 'en' | 'es', component: 'featured' });
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getAmazonUrl = () => book.amazonUrl || book.amazonHardcoverUrl || book.amazonSoftcoverUrl;

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-accent/10 via-background to-secondary/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 text-lg px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <TrendingUp className="mr-2 h-5 w-5" />
            {badge || (language === 'es' ? '🔥 Más Vendido' : '🔥 Bestseller')}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            {language === 'es' ? 'Libro Destacado' : 'Featured Book'}
          </h2>
        </div>

        <div className="grid md:grid-cols-5 gap-12 items-center bg-card/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-border/50">
          {/* Book Cover - Larger on mobile */}
          <div className="md:col-span-2 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-6 bg-gradient-to-r from-primary/30 via-accent/30 to-secondary/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 animate-pulse"></div>
              <img 
                src={book.coverImage} 
                alt={book.title}
                className="relative w-full max-w-md h-auto rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Book Details */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                {book.title}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {book.description[language]}
              </p>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap gap-4 items-center py-4 border-y border-border/50">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {language === 'es' ? 'Altamente recomendado' : 'Highly recommended'}
              </span>
            </div>

            {/* CTA */}
            {book.status === "published" && (
              <div className="space-y-4">
                {/* Primary: Buy Direct */}
                <Button 
                  size="lg"
                  onClick={handleBuyDirect}
                  className="w-full md:w-auto text-xl px-12 py-7 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <ShoppingCart className="mr-3 h-6 w-6" />
                  {language === 'es' ? 'Comprar directo' : 'Buy Direct'}
                </Button>

                {/* Secondary: Amazon */}
                {getAmazonUrl() && (
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleAmazonClick}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Amazon
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};