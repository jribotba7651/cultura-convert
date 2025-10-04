import AuthorProfile from "@/components/AuthorProfile";
import Navigation from "@/components/Navigation";
import { ContactForm } from "@/components/ContactForm";
import { AdSenseAd } from "@/components/AdSenseAd";
import { useLanguage } from "@/contexts/LanguageContext";
import { Book } from "@/types/Book";
import juanProfileImage from "@/assets/juan-c-ribot-profile.jpg";
import rosnelmaProfileImage from "@/assets/rosnelma-garcia-profile.jpg";
import jibaraEnLaLunaCover from "@/assets/jibara-en-la-luna-cover.jpg";
import lasAventurasLunaAvoCover from "@/assets/las-aventuras-luna-avo-cover.jpg";
import sofiaMariePalomaCover from "@/assets/sofia-marie-paloma-cover.jpg";
import cartasDeNewarkCover from "@/assets/cartas-de-newark-cover.jpg";
import raicesEnTierraAjenaCover from "@/assets/raices-en-tierra-ajena-cover.jpg";

// Datos de ejemplo para los libros de Juan C. Ribot Guzmán
const juanBooks: Book[] = [
  {
    title: "Raíces En Tierra Ajena",
    description: {
      es: "Una historia poderosa sobre familia, supervivencia y esperanza en la América dividida de hoy. Los Ramírez sacrificaron todo por el sueño americano. Ahora viven con miedo diario en Kenner, Louisiana. Al otro lado de la calle viven los Davis. Familia blanca, republicana, con sus propios prejuicios y certezas. Dos mundos separados por más que una cerca de jardín. Pero cuando las amistades inesperadas florecen entre los hijos, todo cambia. Una novela sobre identidad, exilio y la fuerza transformadora del amor humano. Perfecta para lectores de Jeanine Cummins, Julia Alvarez y Reyna Grande.",
      en: "A powerful story about family, survival, and hope in today's divided America. The Ramírez family sacrificed everything for the American dream. Now they live in daily fear in Kenner, Louisiana. Across the street live the Davis family. White, Republican, with their own prejudices and certainties. Two worlds separated by more than a garden fence. But when unexpected friendships bloom between the children, everything changes. A novel about identity, exile, and the transformative power of human love. Perfect for readers of Jeanine Cummins, Julia Alvarez, and Reyna Grande."
    },
    status: "published" as const,
    amazonUrl: "https://a.co/d/d47VqsO",
    coverImage: raicesEnTierraAjenaCover,
  },
  {
    title: "Cartas de Newark",
    description: {
      es: "Una colección de cartas que capturan la experiencia puertorriqueña en Nueva Jersey, explorando temas de identidad, nostalgia y la diáspora.",
      en: "A collection of letters capturing the Puerto Rican experience in New Jersey, exploring themes of identity, nostalgia, and diaspora."
    },
    status: "published" as const,
    amazonUrl: "https://a.co/d/4dgdLk4",
    coverImage: cartasDeNewarkCover,
  },
];

// Datos de ejemplo para los libros de Rosnelma García Amalbert
const rosnelmaBooks: Book[] = [
  {
    title: "JÍBARA EN LA LUNA: Transformando Desafíos en Oportunidades: 22 Años de Liderazgo Consciente",
    description: {
      es: "¿Qué pasaría si una jíbara de Puerto Rico pudiera llegar a la luna sin perder su esencia? Una guía práctica y honesta para el liderazgo consciente con estrategias comprobadas para convertir desafíos en oportunidades, técnicas para navegar el bullying corporativo, y herramientas para usar la perspectiva bicultural como ventaja competitiva.",
      en: "What would happen if a jíbara from Puerto Rico could reach the moon without losing her essence? A practical and honest guide to conscious leadership with proven strategies to turn challenges into opportunities, techniques to navigate corporate bullying, and tools to use bicultural perspective as a competitive advantage."
    },
    status: "published" as const,
    amazonUrl: "https://a.co/d/23apCTx",
    coverImage: jibaraEnLaLunaCover,
  },
  {
    title: "Las Aventuras de Luna y Avo",
    description: {
      es: "Un libro infantil lleno de aventuras que enseña a los niños sobre la valentía, la amistad y el poder de la imaginación.",
      en: "A children's book full of adventures teaching kids about courage, friendship, and the power of imagination."
    },
    status: "published" as const,
    amazonUrl: "https://www.amazon.com/Las-aventuras-Luna-Avo-Spanish-ebook/dp/B0DYYV2NKH/ref=sr_1_4?dib=eyJ2IjoiMSJ9.ZuSe3DmdBrrx2NzXq2GjkF7apVCj913zvdaNPNuFRoZxqHNqYv4b6rQHjfIeM6cWMLjgH0rYnBa8c6Xim3hKSs56oXNi6J2FDDpUqgGwHfA.zENM8fRa48HJpgzlsuNHa-8cNVEzan_SURD_m9-5myA&dib_tag=se&qid=1757705499&refinements=p_27%3ARosnelma+Garcia&s=digital-text&sr=1-4&text=Rosnelma+Garcia",
    coverImage: lasAventurasLunaAvoCover,
  },
  {
    title: "Sofía Marie, 'Sofí Mary' o Paloma",
    description: {
      es: "Sofía Marie, también conocida como 'Sofí Mary,' es mucho más que una estudiante universitaria de primer año. Es el resultado de una infancia marcada por una madre brillante pero obsesivamente controladora, que combinaba tecnología de punta con rituales antiguos para vigilar cada uno de sus pasos. Ambientada en Puerto Rico y cargada de profundidad emocional, suspenso y tensiones propias del paso a la adultez, esta novela explora la delgada línea entre la protección y el control, el legado y la rebelión, la verdad y la identidad.",
      en: "Sofía Marie, also known as 'Sofí Mary,' is much more than a college freshman. She is the result of a childhood marked by a brilliant but obsessively controlling mother, who combined cutting-edge technology with ancient rituals to monitor her every step. Set in Puerto Rico and loaded with emotional depth, suspense, and coming-of-age tensions, this novel explores the thin line between protection and control, legacy and rebellion, truth and identity."
    },
    status: "published" as const,
    amazonUrl: "https://www.amazon.com/dp/B0FB82RBP6?ref=cm_sw_r_ffobk_cp_ud_dp_79GCRX5MZ21X75R7H553&ref_=cm_sw_r_ffobk_cp_ud_dp_79GCRX5MZ21X75R7H553&social_share=cm_sw_r_ffobk_cp_ud_dp_79GCRX5MZ21X75R7H553&bestFormat=true",
    coverImage: sofiaMariePalomaCover,
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

      {/* Ad after hero */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AdSenseAd adSlot="1234567890" adFormat="auto" className="my-4" />
      </div>

      {/* Authors Section */}
      <section className="authors py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-12 text-foreground">{t('authorsTitle')}</h3>
          <div className="space-y-20">
            <AuthorProfile
              name="Rosnelma García Amalbert"
              bio={{
                es: "Autora especializada en literatura infantil que ha dedicado su carrera a crear historias que inspiran y educan a los niños. Sus libros combinan entretenimiento con valores fundamentales.",
                en: "Author specialized in children's literature who has dedicated her career to creating stories that inspire and educate children. Her books combine entertainment with fundamental values."
              }}
              books={rosnelmaBooks}
              image={rosnelmaProfileImage}
            />
            
            {/* Ad between authors */}
            <div className="py-4">
              <AdSenseAd adSlot="2345678901" adFormat="horizontal" className="my-4" />
            </div>
            
            <AuthorProfile
              name="Juan C. Ribot Guzmán"
              bio={{
                es: "Escritor puertorriqueño conocido por sus obras que exploran la experiencia de la diáspora y la identidad cultural. Sus escritos capturan la esencia de la vida puertorriqueña tanto en la isla como en el continente.",
                en: "Puerto Rican writer known for his works exploring the diaspora experience and cultural identity. His writings capture the essence of Puerto Rican life both on the island and on the mainland."
              }}
              books={juanBooks}
              image={juanProfileImage}
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-section" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold mb-4 text-foreground">
                {t('language') === 'es' ? 'Contáctanos' : 'Contact Us'}
              </h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('language') === 'es' 
                  ? 'Nos encantaría escuchar de ti. Envíanos un mensaje y te responderemos pronto.' 
                  : 'We would love to hear from you. Send us a message and we\'ll respond soon.'}
              </p>
            </div>
            <ContactForm />
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