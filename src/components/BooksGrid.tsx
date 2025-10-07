import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Book } from "@/types/Book";
import { ShoppingCart, BookOpen } from "lucide-react";
import { isValidURL } from "@/utils/sanitize";

interface BooksGridProps {
  books: Book[];
  title?: string;
}

export const BooksGrid = ({ books, title }: BooksGridProps) => {
  const { language } = useLanguage();

  const handleBuyClick = (book: Book) => {
    if (book.amazonUrl && isValidURL(book.amazonUrl)) {
      window.open(book.amazonUrl, '_blank', 'noopener,noreferrer');
    }
  };

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

                  {/* CTA Button */}
                  {book.status === "published" && book.amazonUrl ? (
                    <Button 
                      onClick={() => handleBuyClick(book)}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                      size="lg"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {language === 'es' ? 'Comprar Ahora' : 'Buy Now'}
                    </Button>
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
