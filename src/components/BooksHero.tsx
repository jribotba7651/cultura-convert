import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Book } from "@/types/Book";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isValidURL } from "@/utils/sanitize";
import { useBookAnalytics } from "@/hooks/useBookAnalytics";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface BooksHeroProps {
  books: Book[];
  featured?: number[];
}

export const BooksHero = ({ books, featured = [0, 1, 2] }: BooksHeroProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { trackBuyDirectClick, trackAmazonClick } = useBookAnalytics();
  const featuredBooks = featured.map(index => books[index]).filter(Boolean);

  const handleBuyDirect = (book: Book) => {
    trackBuyDirectClick({ slug: book.slug, language: language as 'en' | 'es', component: 'hero' });
    navigate(`/libro/${book.slug}`);
  };

  const handleAmazonClick = (book: Book) => {
    const url = book.amazonUrl || book.amazonHardcoverUrl || book.amazonSoftcoverUrl;
    if (url && isValidURL(url)) {
      trackAmazonClick({ slug: book.slug, language: language as 'en' | 'es', component: 'hero' });
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getAmazonUrl = (book: Book) => book.amazonUrl || book.amazonHardcoverUrl || book.amazonSoftcoverUrl;

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4">
            {language === 'es' ? 'Descubre Historias Únicas' : 'Discover Unique Stories'}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            {language === 'es' 
              ? 'Literatura puertorriqueña que trasciende fronteras' 
              : 'Puerto Rican literature that transcends borders'}
          </p>
        </div>

        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {featuredBooks.map((book, index) => (
              <CarouselItem key={index}>
                <div className="p-4">
                  <div className="grid md:grid-cols-2 gap-8 items-center bg-card/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-border/50">
                    {/* Book Cover */}
                    <div className="flex justify-center">
                      <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                        <img 
                          src={book.coverImage} 
                          alt={book.title}
                          className="relative w-full max-w-sm h-auto rounded-xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                          {book.status === "published" 
                            ? (language === 'es' ? 'Disponible Ahora' : 'Available Now')
                            : (language === 'es' ? 'Próximamente' : 'Coming Soon')}
                        </Badge>
                      </div>
                    </div>

                    {/* Book Info */}
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                          {book.title}
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed line-clamp-6">
                          {book.description[language]}
                        </p>
                      </div>

                      {book.status === "published" && (
                        <div className="space-y-3">
                          {/* Primary: Buy Direct */}
                          <Button 
                            size="lg"
                            onClick={() => handleBuyDirect(book)}
                            className="w-full text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                          >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            {language === 'es' ? 'Comprar directo' : 'Buy Direct'}
                          </Button>
                          
                          {/* Secondary: Amazon */}
                          {getAmazonUrl(book) && (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleAmazonClick(book)}
                              className="w-full text-sm"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Amazon
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};