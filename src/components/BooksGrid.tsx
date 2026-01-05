import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Book } from "@/types/Book";
import { ShoppingCart, BookOpen, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isValidURL } from "@/utils/sanitize";
import { useBookAnalytics } from "@/hooks/useBookAnalytics";

interface BooksGridProps {
  books: Book[];
  title?: string;
}

export const BooksGrid = ({ books, title }: BooksGridProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { trackBuyDirectClick, trackAmazonClick } = useBookAnalytics();

  const handleBuyDirect = (book: Book) => {
    trackBuyDirectClick({ slug: book.slug, language: language as 'en' | 'es', component: 'grid' });
    navigate(`/libro/${book.slug}`);
  };

  const handleAmazonClick = (book: Book) => {
    const url = book.amazonUrl || book.amazonHardcoverUrl || book.amazonSoftcoverUrl;
    if (url && isValidURL(url)) {
      trackAmazonClick({ slug: book.slug, language: language as 'en' | 'es', component: 'grid' });
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getAmazonUrl = (book: Book) => book.amazonUrl || book.amazonHardcoverUrl || book.amazonSoftcoverUrl;

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {title && (
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {title}
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book, index) => (
            <Card 
              key={index}
              className="group overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl bg-card"
            >
              <CardContent className="p-6">
                {/* Book Cover */}
                <div className="relative mb-6 overflow-hidden rounded-lg">
                  <div className="aspect-[2/3] relative">
                    <img 
                      src={book.coverImage} 
                      alt={book.title}
                      className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Status Badge */}
                  <Badge 
                    className="absolute top-3 right-3"
                    variant={book.status === "published" ? "default" : "secondary"}
                  >
                    {book.status === "published" 
                      ? (language === 'es' ? '✓ Disponible' : '✓ Available')
                      : (language === 'es' ? 'Próximamente' : 'Coming Soon')}
                  </Badge>
                </div>

                {/* Book Info */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground leading-tight line-clamp-2 min-h-[3.5rem]">
                    {book.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {book.description[language]}
                  </p>

                  {/* CTA Buttons */}
                  {book.status === "published" ? (
                    <div className="space-y-2">
                      {/* Primary: Buy Direct */}
                      <Button 
                        onClick={() => handleBuyDirect(book)}
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                        size="lg"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {language === 'es' ? 'Comprar directo' : 'Buy Direct'}
                      </Button>
                      
                      {/* Secondary: Amazon */}
                      {getAmazonUrl(book) && (
                        <Button 
                          variant="outline"
                          onClick={() => handleAmazonClick(book)}
                          className="w-full"
                          size="sm"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Amazon
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full"
                      size="lg"
                      disabled
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      {language === 'es' ? 'Próximamente' : 'Coming Soon'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};