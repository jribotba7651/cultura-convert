import AuthorProfile from "@/components/AuthorProfile";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Book } from "@/types/Book";
import juanProfileImage from "@/assets/juan-c-ribot-profile.jpg";
import rosnelmaProfileImage from "@/assets/rosnelma-garcia-profile.jpg";

// Datos de ejemplo para los libros de Juan C. Ribot Guzmán
const juanBooks: Book[] = [
  {
    title: "Cartas de Newark",
    description: {
      es: "Una colección de cartas que capturan la experiencia puertorriqueña en Nueva Jersey, explorando temas de identidad, nostalgia y la diáspora.",
      en: "A collection of letters capturing the Puerto Rican experience in New Jersey, exploring themes of identity, nostalgia, and diaspora."
    },
    status: "published" as const,
    amazonUrl: "https://a.co/d/4dgdLk4",
  },
];

// Datos de ejemplo para los libros de Rosnelma García Amalbert
const rosnelmaBooks: Book[] = [
  {
    title: "Isabel y Sofía",
    description: {
      es: "Una tierna historia sobre la amistad entre dos niñas que explora los valores familiares y la importancia de los lazos humanos.",
      en: "A tender story about friendship between two girls exploring family values and the importance of human bonds."
    },
    status: "published" as const,
    amazonUrl: "https://a.co/d/23apCTx",
  },
  {
    title: "Las Aventuras de Luna y Avo",
    description: {
      es: "Un libro infantil lleno de aventuras que enseña a los niños sobre la valentía, la amistad y el poder de la imaginación.",
      en: "A children's book full of adventures teaching kids about courage, friendship, and the power of imagination."
    },
    status: "published" as const,
    amazonUrl: "https://a.co/d/aZnA5O7",
  },
  {
    title: "Eres una Estrella",
    description: {
      es: "Un libro inspirador que ayuda a los niños a descubrir su autoestima y a creer en sus propias capacidades y talentos únicos.",
      en: "An inspiring book helping children discover their self-esteem and believe in their own unique abilities and talents."
    },
    status: "published" as const,
    amazonUrl: "https://a.co/d/9C2DSkK",
  },
  {
    title: "Dios y yo somos amigos",
    description: {
      es: "Una hermosa exploración de la espiritualidad infantil que presenta conceptos de fe de manera accesible y reconfortante para los más pequeños.",
      en: "A beautiful exploration of children's spirituality presenting faith concepts in an accessible and comforting way for little ones."
    },
    status: "published" as const,
    amazonUrl: "https://a.co/d/73bZggx",
  },
];

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="hero relative py-24 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            {t('heroTitle')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Authors Section */}
      <section className="authors py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-12 text-foreground">{t('authorsTitle')}</h3>
          <div className="space-y-20">
            <AuthorProfile
              name="Juan C. Ribot Guzmán"
              bio={{
                es: "Escritor puertorriqueño conocido por sus obras que exploran la experiencia de la diáspora y la identidad cultural. Sus escritos capturan la esencia de la vida puertorriqueña tanto en la isla como en el continente.",
                en: "Puerto Rican writer known for his works exploring the diaspora experience and cultural identity. His writings capture the essence of Puerto Rican life both on the island and on the mainland."
              }}
              books={juanBooks}
              image={juanProfileImage}
            />
            <AuthorProfile
              name="Rosnelma García Amalbert"
              bio={{
                es: "Autora especializada en literatura infantil que ha dedicado su carrera a crear historias que inspiran y educan a los niños. Sus libros combinan entretenimiento con valores fundamentales.",
                en: "Author specialized in children's literature who has dedicated her career to creating stories that inspire and educate children. Her books combine entertainment with fundamental values."
              }}
              books={rosnelmaBooks}
              image={rosnelmaProfileImage}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 px-4 text-center">
        <p className="text-muted-foreground">
          {t('footerText')}
        </p>
      </footer>
    </div>
  );
};

export default Index;