import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Book } from "@/types/Book";
import { ShoppingCart, Star, TrendingUp } from "lucide-react";
import { isValidURL } from "@/utils/sanitize";

interface FeaturedBookProps {
  book: Book;
  badge?: string;
}

export const FeaturedBook = ({ book, badge }: FeaturedBookProps) => {
  const { language } = useLanguage();

  const handleBuyClick = (url: string) => {
    if (url && isValidURL(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const hasMultipleFormats = book.amazonHardcoverUrl && book.amazonSoftcoverUrl;
  const getDefaultUrl = book.amazonUrl || book.amazonHardcoverUrl || book.amazonSoftcoverUrl;

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
            {book.status === "published" && (hasMultipleFormats || getDefaultUrl) && (
              <div className="space-y-4">
                {hasMultipleFormats ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg"
                      onClick={() => handleBuyClick(book.amazonHardcoverUrl!)}
                      className="flex-1 text-xl px-8 py-7 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse hover:animate-none"
                    >
                      <ShoppingCart className="mr-3 h-6 w-6" />
                      {language === 'es' ? '📚 Hardcover' : '📚 Hardcover'}
                    </Button>
                    <Button 
                      size="lg"
                      onClick={() => handleBuyClick(book.amazonSoftcoverUrl!)}
                      className="flex-1 text-xl px-8 py-7 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse hover:animate-none"
                    >
                      <ShoppingCart className="mr-3 h-6 w-6" />
                      {language === 'es' ? '📖 Softcover' : '📖 Softcover'}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="lg"
                    onClick={() => handleBuyClick(getDefaultUrl!)}
                    className="w-full md:w-auto text-xl px-12 py-7 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse hover:animate-none"
                  >
                    <ShoppingCart className="mr-3 h-6 w-6" />
                    {language === 'es' ? '🛒 Consigue tu Copia' : '🛒 Get Your Copy'}
                  </Button>
                )}
                <p className="text-sm text-muted-foreground">
                  {language === 'es' 
                    ? '✓ Envío gratis con Amazon Prime | ✓ Disponible ahora' 
                    : '✓ Free shipping with Amazon Prime | ✓ Available now'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
