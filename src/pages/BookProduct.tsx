import { useParams, useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, ExternalLink, Bell, Gift } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Import all book covers
import jibaraEnLaLunaCover from "@/assets/jibara-en-la-luna-cover.jpg";
import jibaraEnLaLunaEnglishCover from "@/assets/jibara-en-la-luna-english-cover.jpg";
import lasAventurasLunaAvoCover from "@/assets/las-aventuras-luna-avo-cover.jpg";
import sofiaMariePalomaCover from "@/assets/sofia-marie-paloma-cover.jpg";
import cartasDeNewarkCover from "@/assets/cartas-de-newark-cover.jpg";
import raicesEnTierraAjenaCover from "@/assets/raices-en-tierra-ajena-cover.jpg";
import nietosEnLaDiasporaCover from "@/assets/nietos-en-la-diaspora-cover.jpg";
import lasQueSiempreEstuvieronCover from "@/assets/las-que-siempre-estuvieron-cover.jpg";

interface BookData {
  title: string;
  slug: string;
  description: { es: string; en: string };
  coverImage: string;
  amazonUrl?: string;
  amazonHardcoverUrl?: string;
  amazonSoftcoverUrl?: string;
  author: string;
}

// Book data with all details
const booksData: Record<string, BookData> = {
  "las-que-siempre-estuvieron": {
    title: "Las Que Siempre Estuvieron: Conversación Entre Dioses",
    slug: "las-que-siempre-estuvieron",
    description: {
      es: "Cinco figuras religiosas llegan a la cima del Monte Roraima: Jesús, Buda, Mahoma, Krishna y Quetzalcóatl. Por primera vez, los fundadores de las tradiciones espirituales más influyentes se encuentran cara a cara. Pero la conversación cambia cuando ellas llegan: María Magdalena, Khadija, Mahapajapati, Radha e Ixchel. Las mujeres que fueron borradas de las escrituras vienen con preguntas incómodas. Una novela sobre el diálogo entre tradiciones que han dividido a la humanidad y las voces femeninas que la historia silenció.",
      en: "Five religious figures arrive at the summit of Mount Roraima: Jesus, Buddha, Muhammad, Krishna, and Quetzalcoatl. For the first time, the founders of the world's most influential spiritual traditions meet face to face. But the conversation changes when they arrive: Mary Magdalene, Khadija, Mahapajapati, Radha, and Ixchel. The women who were erased from scriptures come with uncomfortable questions. A novel about dialogue between traditions that have divided humanity and the feminine voices that history silenced."
    },
    coverImage: lasQueSiempreEstuvieronCover,
    amazonHardcoverUrl: "https://a.co/d/hJpEIi0",
    amazonSoftcoverUrl: "https://a.co/d/dGGqrQO",
    author: "Juan C. Ribot Guzmán"
  },
  "raices-en-tierra-ajena": {
    title: "Raíces En Tierra Ajena",
    slug: "raices-en-tierra-ajena",
    description: {
      es: "Una historia poderosa sobre familia, supervivencia y esperanza en la América dividida de hoy. Los Ramírez sacrificaron todo por el sueño americano. Ahora viven con miedo diario en Kenner, Louisiana. Al otro lado de la calle viven los Davis. Familia blanca, republicana, con sus propios prejuicios y certezas. Dos mundos separados por más que una cerca de jardín. Pero cuando las amistades inesperadas florecen entre los hijos, todo cambia.",
      en: "A powerful story about family, survival, and hope in today's divided America. The Ramírez family sacrificed everything for the American dream. Now they live in daily fear in Kenner, Louisiana. Across the street live the Davis family. White, Republican, with their own prejudices and certainties. Two worlds separated by more than a garden fence. But when unexpected friendships bloom between the children, everything changes."
    },
    coverImage: raicesEnTierraAjenaCover,
    amazonUrl: "https://a.co/d/d47VqsO",
    author: "Juan C. Ribot Guzmán"
  },
  "cartas-de-newark": {
    title: "Cartas de Newark",
    slug: "cartas-de-newark",
    description: {
      es: "Una colección de cartas que capturan la experiencia puertorriqueña en Nueva Jersey, explorando temas de identidad, nostalgia y la diáspora.",
      en: "A collection of letters capturing the Puerto Rican experience in New Jersey, exploring themes of identity, nostalgia, and diaspora."
    },
    coverImage: cartasDeNewarkCover,
    amazonUrl: "https://a.co/d/4dgdLk4",
    author: "Juan C. Ribot Guzmán"
  },
  "nietos-en-la-diaspora": {
    title: "Nietos en la Diáspora: Tres Generaciones, Una Historia",
    slug: "nietos-en-la-diaspora",
    description: {
      es: "¿Qué significa ser puertorriqueño cuando tu familia ha estado migrando por más de un siglo? A través de diálogos familiares auténticos que mezclan español e inglés, este libro explora 500 años de historia puertorriqueña desde los taínos hasta Bad Bunny, las políticas económicas que forzaron la Gran Migración, las contribuciones monumentales de los puertorriqueños en Estados Unidos, y cómo la próxima generación puede ser global sin perder sus raíces.",
      en: "What does it mean to be Puerto Rican when your family has been migrating for over a century? Through authentic family dialogues that blend Spanish and English, this book explores 500 years of Puerto Rican history from the Taínos to Bad Bunny, the economic policies that forced the Great Migration, the monumental contributions of Puerto Ricans in the United States, and how the next generation can be global without losing their roots."
    },
    coverImage: nietosEnLaDiasporaCover,
    amazonUrl: "https://a.co/d/31LLEzW",
    author: "Rosnelma García Amalbert"
  },
  "jibara-en-la-luna-english": {
    title: "JÍBARA EN LA LUNA: Transforming Challenges into Opportunities",
    slug: "jibara-en-la-luna-english",
    description: {
      es: "¿Qué pasaría si una jíbara de Puerto Rico pudiera alcanzar la luna sin perder su esencia? Rosnelma García comparte su extraordinario viaje de 22 años navegando Corporate America—desde una planta farmacéutica en Puerto Rico hasta oficinas ejecutivas en California.",
      en: "What would happen if a jíbara from Puerto Rico could reach the moon without losing her essence? Rosnelma García shares her extraordinary 22-year journey navigating Corporate America—from a pharmaceutical plant in Puerto Rico to executive offices in California. A practical, honest guide to conscious leadership."
    },
    coverImage: jibaraEnLaLunaEnglishCover,
    amazonUrl: "https://a.co/d/7QKyJOu",
    author: "Rosnelma García Amalbert"
  },
  "jibara-en-la-luna-espanol": {
    title: "JÍBARA EN LA LUNA: Transformando Desafíos en Oportunidades (Edición Español)",
    slug: "jibara-en-la-luna-espanol",
    description: {
      es: "¿Qué pasaría si una jíbara de Puerto Rico pudiera llegar a la luna sin perder su esencia? Una guía práctica y honesta para el liderazgo consciente con estrategias comprobadas para convertir desafíos en oportunidades.",
      en: "What would happen if a jíbara from Puerto Rico could reach the moon without losing her essence? A practical and honest guide to conscious leadership with proven strategies to turn challenges into opportunities. (Spanish Edition)"
    },
    coverImage: jibaraEnLaLunaCover,
    amazonUrl: "https://a.co/d/23apCTx",
    author: "Rosnelma García Amalbert"
  },
  "las-aventuras-de-luna-y-avo": {
    title: "Las Aventuras de Luna y Avo",
    slug: "las-aventuras-de-luna-y-avo",
    description: {
      es: "Un libro infantil lleno de aventuras que enseña a los niños sobre la valentía, la amistad y el poder de la imaginación.",
      en: "A children's book full of adventures teaching kids about courage, friendship, and the power of imagination."
    },
    coverImage: lasAventurasLunaAvoCover,
    amazonUrl: "https://www.amazon.com/Las-aventuras-Luna-Avo-Spanish-ebook/dp/B0DYYV2NKH",
    author: "Rosnelma García Amalbert"
  },
  "sofia-marie-paloma": {
    title: "Sofía Marie, 'Sofí Mary' o Paloma",
    slug: "sofia-marie-paloma",
    description: {
      es: "Sofía Marie, también conocida como 'Sofí Mary,' es mucho más que una estudiante universitaria de primer año. Es el resultado de una infancia marcada por una madre brillante pero obsesivamente controladora, que combinaba tecnología de punta con rituales antiguos para vigilar cada uno de sus pasos.",
      en: "Sofía Marie, also known as 'Sofí Mary,' is much more than a college freshman. She is the result of a childhood marked by a brilliant but obsessively controlling mother, who combined cutting-edge technology with ancient rituals to monitor her every step."
    },
    coverImage: sofiaMariePalomaCover,
    amazonUrl: "https://www.amazon.com/dp/B0FB82RBP6",
    author: "Rosnelma García Amalbert"
  }
};

const BookProduct = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const book = slug ? booksData[slug] : null;

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !slug) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: {
          name: "Book Waitlist",
          email,
          interests: [`direct-checkout-${slug}`],
          language
        }
      });

      if (error) throw error;

      toast({
        title: language === 'es' ? '¡Listo!' : 'Success!',
        description: language === 'es' 
          ? 'Te avisaremos cuando esté disponible la compra directa.' 
          : "We'll notify you when direct checkout is available."
      });
      setEmail("");
    } catch (error) {
      toast({
        title: language === 'es' ? 'Error' : 'Error',
        description: language === 'es' 
          ? 'No pudimos registrar tu email. Intenta de nuevo.' 
          : 'Could not register your email. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAmazonUrl = () => {
    return book?.amazonUrl || book?.amazonHardcoverUrl || book?.amazonSoftcoverUrl;
  };

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">
            {language === 'es' ? 'Libro no encontrado' : 'Book not found'}
          </h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === 'es' ? 'Volver al inicio' : 'Back to home'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {language === 'es' ? 'Volver' : 'Back'}
        </Button>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Book Cover */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl"></div>
              <img 
                src={book.coverImage} 
                alt={book.title}
                className="relative w-full max-w-md rounded-xl shadow-2xl"
              />
            </div>
          </div>

          {/* Book Details */}
          <div className="space-y-8">
            <div>
              <Badge className="mb-4">{book.author}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {book.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {book.description[language]}
              </p>
            </div>

            {/* Direct Purchase Coming Soon */}
            <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl p-8 border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {language === 'es' ? 'Compra Directa' : 'Buy Direct'}
                </h3>
                <Badge variant="secondary">
                  {language === 'es' ? 'Próximamente' : 'Coming Soon'}
                </Badge>
              </div>
              
              <p className="text-muted-foreground mb-6">
                {language === 'es' 
                  ? 'La compra directa estará disponible pronto. Déjanos tu email y recibe una muestra de regalo.'
                  : 'Direct checkout coming soon. Get notified and receive a bonus sample.'}
              </p>

              <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder={language === 'es' ? 'Tu email' : 'Your email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  {language === 'es' ? 'Avisarme' : 'Get notified'}
                </Button>
              </form>
            </div>

            {/* Amazon Option */}
            {getAmazonUrl() && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'es' 
                    ? 'También disponible en Amazon:' 
                    : 'Also available on Amazon:'}
                </p>
                
                {book.amazonHardcoverUrl && book.amazonSoftcoverUrl ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => window.open(book.amazonHardcoverUrl, '_blank', 'noopener,noreferrer')}
                      className="flex-1"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Amazon (Hardcover)
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => window.open(book.amazonSoftcoverUrl, '_blank', 'noopener,noreferrer')}
                      className="flex-1"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Amazon (Softcover)
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.open(getAmazonUrl(), '_blank', 'noopener,noreferrer')}
                    className="w-full sm:w-auto"
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

      {/* Footer */}
      <footer className="bg-muted py-8 px-4 text-center mt-20">
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} Juan C. Ribot Guzmán & Rosnelma García Amalbert
        </p>
      </footer>
    </div>
  );
};

export default BookProduct;