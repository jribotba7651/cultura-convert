import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Book } from "@/types/Book";
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { isValidURL } from "@/utils/sanitize";
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
  const featuredBooks = featured.map(index => books[index]).filter(Boolean);

  const handleBuyClick = (url: string) => {
    if (url && isValidURL(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const hasMultipleFormats = (book: Book) => book.amazonHardcoverUrl && book.amazonSoftcoverUrl;
  const getDefaultUrl = (book: Book) => book.amazonUrl || book.amazonHardcoverUrl || book.amazonSoftcoverUrl;

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

                      {book.status === "published" && (hasMultipleFormats(book) || getDefaultUrl(book)) && (
                        <div className="space-y-3">
                          {hasMultipleFormats(book) ? (
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button 
                                size="lg"
                                onClick={() => handleBuyClick(book.amazonHardcoverUrl!)}
                                className="flex-1 text-lg px-6 py-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                              >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                {language === 'es' ? 'Hardcover' : 'Hardcover'}
                              </Button>
                              <Button 
                                size="lg"
                                onClick={() => handleBuyClick(book.amazonSoftcoverUrl!)}
                                className="flex-1 text-lg px-6 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                              >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                {language === 'es' ? 'Softcover' : 'Softcover'}
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="lg"
                              onClick={() => handleBuyClick(getDefaultUrl(book)!)}
                              className="w-full md:w-auto text-lg px-8 py-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                              <ShoppingCart className="mr-2 h-5 w-5" />
                              {language === 'es' ? 'Comprar en Amazon' : 'Buy on Amazon'}
                            </Button>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span>{language === 'es' ? 'Disponible en Amazon' : 'Available on Amazon'}</span>
                          </div>
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
