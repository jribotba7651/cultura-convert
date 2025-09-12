import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sanitizeURLParam, isValidURL } from "@/utils/sanitize";
import { useLanguage } from "@/contexts/LanguageContext";
import { Book } from "@/types/Book";

interface AuthorProfileProps {
  name: string;
  bio: {
    es: string;
    en: string;
  };
  books: Book[];
  image?: string;
}

const AuthorProfile = ({ name, bio, books, image }: AuthorProfileProps) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const { toast } = useToast();
  const { language, t } = useLanguage();

  const handleKnowMore = () => {
    setShowMoreInfo(!showMoreInfo);
    toast({
      title: t('knowMore'),
      description: showMoreInfo ? "Información oculta" : "Mostrando más información del autor",
    });
  };

  const handleContact = () => {
    toast({
      title: t('contactDevelopment'),
      description: t('contactDevelopmentDesc'),
    });
  };

  const handleBuyOnAmazon = (book: Book) => {
    if (book.amazonUrl && isValidURL(book.amazonUrl)) {
      toast({
        title: t('buyingRedirect'),
        description: `${t('buyingRedirectDesc')} "${book.title}"`,
      });
      window.open(book.amazonUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback to Amazon search
      const searchQuery = sanitizeURLParam(book.title);
      const amazonUrl = `https://www.amazon.com/s?k=${searchQuery}`;
      
      toast({
        title: t('buyingRedirect'),
        description: `${t('buyingRedirectDesc')} "${book.title}"`,
      });
      window.open(amazonUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePreview = (bookTitle: string) => {
    toast({
      title: t('previewOpen'),
      description: `${t('previewOpenDesc')} "${bookTitle}"`,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <div className="aspect-square bg-gradient-to-br from-primary to-secondary rounded-lg mb-4 flex items-center justify-center">
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="text-primary-foreground text-4xl font-bold">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
          </div>
        </div>
        
        <div className="md:col-span-2">
          <h2 className="text-3xl font-bold text-foreground mb-4">{name}</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">{bio[language]}</p>
            <div className="flex gap-4">
              <Button onClick={handleKnowMore} variant="outline">
                {t('knowMore')}
              </Button>
              <Button onClick={handleContact} variant="secondary">
                {t('contact')}
              </Button>
            </div>
            {showMoreInfo && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">
                  {t('additionalInfo')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-foreground">Obras</h3>
        
        {books.map((book, index) => (
          <Card key={index} className="border border-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{book.title}</CardTitle>
                <Badge variant={book.status === "published" ? "default" : "secondary"}>
                  {book.status === "published" ? t('published') : t('comingSoon')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {book.coverImage && (
                  <div className="flex-shrink-0">
                    <img 
                      src={book.coverImage} 
                      alt={`Portada de ${book.title}`}
                      className="w-24 h-32 object-cover rounded-md shadow-md"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <CardDescription className="text-sm mb-4">
                    {book.description[language]}
                  </CardDescription>
                  {book.status === "published" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleBuyOnAmazon(book)}
                        className="bg-secondary hover:bg-secondary/90"
                      >
                        {t('buyOnAmazon')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(book.title)}
                      >
                        {t('preview')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AuthorProfile;