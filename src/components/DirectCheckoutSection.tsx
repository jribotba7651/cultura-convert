import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Book } from "@/types/Book";
import { ShoppingCart, ExternalLink, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isValidURL } from "@/utils/sanitize";
import { useBookAnalytics } from "@/hooks/useBookAnalytics";

interface DirectCheckoutSectionProps {
  books: Book[];
}

const DIRECT_CHECKOUT_SLUGS = [
  'cartas-de-newark',
  'raices-en-tierra-ajena',
  'jibara-en-la-luna-espanol'
];

export const DirectCheckoutSection = ({ books }: DirectCheckoutSectionProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { trackBuyDirectClick, trackAmazonClick } = useBookAnalytics();

  const directCheckoutBooks = books.filter(book => 
    DIRECT_CHECKOUT_SLUGS.includes(book.slug)
  );

  if (directCheckoutBooks.length === 0) return null;

  const handleBuyDirect = (book: Book) => {
    trackBuyDirectClick({ 
      slug: book.slug, 
      language: language as 'en' | 'es', 
      component: 'direct-checkout-section' 
    });
    navigate(`/libro/${book.slug}`);
  };

  const handleAmazonClick = (book: Book) => {
    const url = book.amazonUrl || book.amazonHardcoverUrl || book.amazonSoftcoverUrl;
    if (url && isValidURL(url)) {
      trackAmazonClick({ 
        slug: book.slug, 
        language: language as 'en' | 'es', 
        component: 'direct-checkout-section' 
      });
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getAmazonUrl = (book: Book) => 
    book.amazonUrl || book.amazonHardcoverUrl || book.amazonSoftcoverUrl;

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-primary/5 via-accent/5 to-background border-y border-border/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium text-sm">
              {language === 'es' ? 'Envío Directo' : 'Direct Shipping'}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {language === 'es' 
              ? 'Disponibles para Compra Directa' 
              : 'Available for Direct Purchase'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'es'
              ? 'Compra directamente y recibe tu libro en casa. Envío rápido y seguro.'
              : 'Buy directly and receive your book at home. Fast and secure shipping.'}
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {directCheckoutBooks.map((book) => (
            <Card 
              key={book.slug}
              className="group overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-0">
                {/* Cover Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Available Badge */}
                  <Badge 
                    className="absolute top-3 right-3 bg-green-500 hover:bg-green-600 text-white shadow-lg"
                  >
                    {language === 'es' ? 'Disponible' : 'Available'}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-foreground line-clamp-2 min-h-[3.5rem]">
                    {book.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {book.description[language]}
                  </p>

                  {/* CTAs */}
                  <div className="space-y-3 pt-2">
                    <Button 
                      onClick={() => handleBuyDirect(book)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {language === 'es' ? 'Comprar Directo' : 'Buy Direct'}
                    </Button>

                    {getAmazonUrl(book) && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleAmazonClick(book)}
                        className="w-full"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Amazon
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
