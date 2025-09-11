import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sanitizeText, sanitizeURLParam, isValidURL } from "@/utils/sanitize";

interface Book {
  title: string;
  description: string;
  status: "published" | "coming-soon";
}

interface AuthorProfileProps {
  name: string;
  bio: string;
  books: Book[];
  image?: string;
}

const AuthorProfile = ({ name, bio, books, image }: AuthorProfileProps) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const { toast } = useToast();

  const handleKnowMore = () => {
    setShowMoreInfo(!showMoreInfo);
    toast({
      title: showMoreInfo ? "Info ocultada" : "Más información",
      description: showMoreInfo ? "Se ocultó la información adicional" : "Mostrando más información del autor",
    });
  };

  const handleContact = () => {
    toast({
      title: "Contacto",
      description: "Funcionalidad de contacto en desarrollo. Pronto podrás contactar al autor.",
    });
  };

  const handleBuyOnAmazon = (bookTitle: string) => {
    const sanitizedTitle = sanitizeURLParam(bookTitle);
    const amazonURL = `https://amazon.com/s?k=${sanitizedTitle}`;
    
    if (isValidURL(amazonURL)) {
      toast({
        title: "Comprar en Amazon",
        description: `Redirigiendo a Amazon para comprar "${sanitizeText(bookTitle)}"`,
      });
      // window.open(amazonURL, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: "Error",
        description: "URL no válida",
        variant: "destructive"
      });
    }
  };

  const handlePreview = (bookTitle: string) => {
    toast({
      title: "Vista Previa",
      description: `Abriendo vista previa de "${bookTitle}"`,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <div className="aspect-square bg-gradient-to-br from-primary to-accent rounded-lg mb-4 flex items-center justify-center">
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
          <p className="text-muted-foreground leading-relaxed mb-6">{bio}</p>
          
          <div className="flex gap-4">
            <Button 
              variant="default" 
              className="bg-primary hover:bg-primary/90"
              onClick={handleKnowMore}
            >
              {showMoreInfo ? "Ocultar Info" : "Conoce Más"}
            </Button>
            <Button variant="outline" onClick={handleContact}>
              Contacto
            </Button>
          </div>
          
          {showMoreInfo && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Información Adicional</h4>
              <p className="text-sm text-muted-foreground">
                Aquí puedes agregar más detalles sobre el autor, como premios recibidos, 
                trayectoria profesional, otros trabajos, etc.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-foreground">Obras</h3>
        
        {books.map((book, index) => (
          <Card key={index} className="border-muted/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-xl font-semibold text-foreground">{book.title}</h4>
                {book.status === "coming-soon" && (
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">
                    Próximamente
                  </span>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">{book.description}</p>
              
              {book.status === "published" && (
                <div className="flex gap-3">
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => handleBuyOnAmazon(book.title)}
                  >
                    Comprar en Amazon
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handlePreview(book.title)}
                  >
                    Vista Previa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AuthorProfile;