import AuthorProfile from "@/components/AuthorProfile";
import Navigation from "@/components/Navigation";
import { ContactForm } from "@/components/ContactForm";
import { AdSenseAd } from "@/components/AdSenseAd";
import { BooksHero } from "@/components/BooksHero";
import { BooksGrid } from "@/components/BooksGrid";
import { FeaturedBook } from "@/components/FeaturedBook";
import { NewsletterModal } from "@/components/NewsletterModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { Book } from "@/types/Book";
import juanProfileImage from "@/assets/juan-c-ribot-profile.jpg";
import rosnelmaProfileImage from "@/assets/rosnelma-garcia-profile.jpg";
import jibaraEnLaLunaCover from "@/assets/jibara-en-la-luna-cover.jpg";
import jibaraEnLaLunaEnglishCover from "@/assets/jibara-en-la-luna-english-cover.jpg";
import lasAventurasLunaAvoCover from "@/assets/las-aventuras-luna-avo-cover.jpg";
import sofiaMariePalomaCover from "@/assets/sofia-marie-paloma-cover.jpg";
import cartasDeNewarkCover from "@/assets/cartas-de-newark-cover.jpg";
import raicesEnTierraAjenaCover from "@/assets/raices-en-tierra-ajena-cover.jpg";
import nietosEnLaDiasporaCover from "@/assets/nietos-en-la-diaspora-cover.jpg";
import lasQueSiempreEstuvieronCover from "@/assets/las-que-siempre-estuvieron-cover.jpg";

// Datos de ejemplo para los libros de Juan C. Ribot Guzmán
const juanBooks: Book[] = [
  {
    title: "Las Que Siempre Estuvieron: Conversación Entre Dioses",
    slug: "las-que-siempre-estuvieron",
    description: {
      es: "Cinco figuras religiosas llegan a la cima del Monte Roraima: Jesús, Buda, Mahoma, Krishna y Quetzalcóatl. Por primera vez, los fundadores de las tradiciones espirituales más influyentes se encuentran cara a cara. Pero la conversación cambia cuando ellas llegan: María Magdalena, Khadija, Mahapajapati, Radha e Ixchel. Las mujeres que fueron borradas de las escrituras vienen con preguntas incómodas. Una novela sobre el diálogo entre tradiciones que han dividido a la humanidad y las voces femeninas que la historia silenció.",
      en: "Five religious figures arrive at the summit of Mount Roraima: Jesus, Buddha, Muhammad, Krishna, and Quetzalcoatl. For the first time, the founders of the world's most influential spiritual traditions meet face to face. But the conversation changes when they arrive: Mary Magdalene, Khadija, Mahapajapati, Radha, and Ixchel. The women who were erased from scriptures come with uncomfortable questions. A novel about dialogue between traditions that have divided humanity and the feminine voices that history silenced."
    },
    status: "published" as const,
    amazonHardcoverUrl: "https://a.co/d/hJpEIi0",
    amazonSoftcoverUrl: "https://a.co/d/dGGqrQO",
    coverImage: lasQueSiempreEstuvieronCover,
  },
  {
    title: "Raíces En Tierra Ajena",
    slug: "raices-en-tierra-ajena",
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
    slug: "cartas-de-newark",
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
    title: "Nietos en la Diáspora: Tres Generaciones, Una Historia",
    slug: "nietos-en-la-diaspora",
    description: {
      es: "¿Qué significa ser puertorriqueño cuando tu familia ha estado migrando por más de un siglo? A través de diálogos familiares auténticos que mezclan español e inglés, este libro explora 500 años de historia puertorriqueña desde los taínos hasta Bad Bunny, las políticas económicas que forzaron la Gran Migración, las contribuciones monumentales de los puertorriqueños en Estados Unidos, y cómo la próxima generación puede ser global sin perder sus raíces. Con más de 100 fuentes académicas, combina rigor histórico con narrativa emotiva basada en testimonios reales y la experiencia vivida de cuatro generaciones de puertorriqueños. Perfecto para familias puertorriqueñas navegando la experiencia diaspórica, jóvenes latinos buscando entender su identidad bicultural, educadores enseñando historia puertorriqueña, y cualquier persona interesada en temas de migración, identidad y cultura.",
      en: "What does it mean to be Puerto Rican when your family has been migrating for over a century? Through authentic family dialogues that blend Spanish and English, this book explores 500 years of Puerto Rican history from the Taínos to Bad Bunny, the economic policies that forced the Great Migration, the monumental contributions of Puerto Ricans in the United States, and how the next generation can be global without losing their roots. With over 100 academic sources, it combines historical rigor with emotional narrative based on real testimonies and the lived experience of four generations of Puerto Ricans. Perfect for Puerto Rican families navigating the diasporic experience, young Latinos seeking to understand their bicultural identity, educators teaching Puerto Rican history, and anyone interested in migration, identity, and culture."
    },
    status: "published" as const,
    amazonUrl: "https://a.co/d/31LLEzW",
    coverImage: nietosEnLaDiasporaCover,
  },
  {
    title: "JÍBARA EN LA LUNA: Transforming Challenges into Opportunities",
    slug: "jibara-en-la-luna-english",
    description: {
      es: "¿Qué pasaría si una jíbara de Puerto Rico pudiera alcanzar la luna sin perder su esencia? Rosnelma García comparte su extraordinario viaje de 22 años navegando Corporate America—desde una planta farmacéutica en Puerto Rico hasta oficinas ejecutivas en California. Una guía práctica y honesta para el liderazgo consciente con estrategias comprobadas, técnicas para navegar el bullying corporativo, y herramientas para integrar la maternidad con la ambición profesional. Perfecta para profesionales Latinas, madres trabajadoras y líderes que buscan autenticidad.",
      en: "What would happen if a jíbara from Puerto Rico could reach the moon without losing her essence? Rosnelma García shares her extraordinary 22-year journey navigating Corporate America—from a pharmaceutical plant in Puerto Rico to executive offices in California. A practical, honest guide to conscious leadership with proven strategies, techniques for navigating corporate bullying, and tools for integrating motherhood with professional ambition. Perfect for Latina professionals, working mothers, and leaders seeking authenticity."
    },
    status: "published" as const,
    amazonUrl: "https://a.co/d/7QKyJOu",
    coverImage: jibaraEnLaLunaEnglishCover,
  },
  {
    title: "JÍBARA EN LA LUNA: Transformando Desafíos en Oportunidades (Edición Español)",
    slug: "jibara-en-la-luna-espanol",
    description: {
      es: "¿Qué pasaría si una jíbara de Puerto Rico pudiera llegar a la luna sin perder su esencia? Una guía práctica y honesta para el liderazgo consciente con estrategias comprobadas para convertir desafíos en oportunidades, técnicas para navegar el bullying corporativo, y herramientas para usar la perspectiva bicultural como ventaja competitiva.",
      en: "What would happen if a jíbara from Puerto Rico could reach the moon without losing her essence? A practical and honest guide to conscious leadership with proven strategies to turn challenges into opportunities, techniques to navigate corporate bullying, and tools to use bicultural perspective as a competitive advantage. (Spanish Edition)"
    },
    status: "published" as const,
    amazonUrl: "https://a.co/d/23apCTx",
    coverImage: jibaraEnLaLunaCover,
  },
  {
    title: "Las Aventuras de Luna y Avo",
    slug: "las-aventuras-de-luna-y-avo",
    description: {
      es: "Un libro infantil lleno de aventuras que enseña a los niños sobre la valentía, la amistad y el poder de la imaginación.",
      en: "A children's book full of adventures teaching kids about courage, friendship, and the power of imagination."
    },
    status: "published" as const,
    amazonUrl: "https://www.amazon.com/Las-aventuras-Luna-Avo-Spanish-ebook/dp/B0DYYV2NKH",
    coverImage: lasAventurasLunaAvoCover,
  },
  {
    title: "Sofía Marie, 'Sofí Mary' o Paloma",
    slug: "sofia-marie-paloma",
    description: {
      es: "Sofía Marie, también conocida como 'Sofí Mary,' es mucho más que una estudiante universitaria de primer año. Es el resultado de una infancia marcada por una madre brillante pero obsesivamente controladora, que combinaba tecnología de punta con rituales antiguos para vigilar cada uno de sus pasos. Ambientada en Puerto Rico y cargada de profundidad emocional, suspenso y tensiones propias del paso a la adultez, esta novela explora la delgada línea entre la protección y el control, el legado y la rebelión, la verdad y la identidad.",
      en: "Sofía Marie, also known as 'Sofí Mary,' is much more than a college freshman. She is the result of a childhood marked by a brilliant but obsessively controlling mother, who combined cutting-edge technology with ancient rituals to monitor her every step. Set in Puerto Rico and loaded with emotional depth, suspense, and coming-of-age tensions, this novel explores the thin line between protection and control, legacy and rebellion, truth and identity."
    },
    status: "published" as const,
    amazonUrl: "https://www.amazon.com/dp/B0FB82RBP6",
    coverImage: sofiaMariePalomaCover,
  },
];

const Index = () => {
  const { t, language } = useLanguage();

  // Combine all books for the hero and grid
  const allBooks = [...rosnelmaBooks, ...juanBooks];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <NewsletterModal />

      {/* Hero Section with Featured Books Carousel */}
      <BooksHero books={allBooks} featured={[5, 0, 3]} />

      {/* Featured Bestseller */}
      <FeaturedBook 
        book={rosnelmaBooks[0]} 
        badge={language === 'es' ? '🆕 NUEVO - Primer Libro en Inglés' : '🆕 NEW - First Book in English'}
      />

      {/* All Books Grid */}
      <BooksGrid 
        books={allBooks}
        title={language === 'es' ? 'Todos Nuestros Libros' : 'All Our Books'}
      />

      {/* Ad before authors */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AdSenseAd adSlot="1234567890" adFormat="auto" className="my-4" />
      </div>

      {/* Authors Section - Now below books */}
      <section className="authors py-16 px-4 bg-muted/30">
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