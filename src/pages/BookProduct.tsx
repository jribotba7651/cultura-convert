import { useParams, useNavigate, Navigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Bell, Gift, ExternalLink, BookOpen, Users, Lightbulb, Quote, Download, ChevronRight, ShoppingCart, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBookAnalytics } from "@/hooks/useBookAnalytics";
import { Helmet } from "react-helmet";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types/Store";

// Mapping of book slugs to product IDs for direct purchase
// Only these 3 books have "Buy Direct" enabled
const DIRECT_PURCHASE_BOOKS: Record<string, string> = {
  "cartas-de-newark": "f704387c-08c6-4177-a8a3-ff35018eacd9",
  "raices-en-tierra-ajena": "2eb33c81-0056-4907-aea7-584b22fdfe2d",
  "jibara-en-la-luna-espanol": "bcff5050-24b2-4006-afc3-6686b025b6c1",
};

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
  promise: { es: string; en: string };
  benefits: { es: string[]; en: string[] };
  whoIsFor: { es: string[]; en: string[] };
  whatYoullLearn: { es: string[]; en: string[] };
  whatsInside: { es: string[]; en: string[] };
  authorNote: { es: string; en: string };
  testimonials: { text: { es: string; en: string }; author: string }[];
  faq: { q: { es: string; en: string }; a: { es: string; en: string } }[];
  relatedBooks: string[];
}

const booksData: Record<string, BookData> = {
  "las-que-siempre-estuvieron": {
    title: "Las Que Siempre Estuvieron: Conversación Entre Dioses",
    slug: "las-que-siempre-estuvieron",
    description: {
      es: "Cinco figuras religiosas llegan a la cima del Monte Roraima: Jesús, Buda, Mahoma, Krishna y Quetzalcóatl. Por primera vez, los fundadores de las tradiciones espirituales más influyentes se encuentran cara a cara.",
      en: "Five religious figures arrive at the summit of Mount Roraima: Jesus, Buddha, Muhammad, Krishna, and Quetzalcoatl. For the first time, the founders of the world's most influential spiritual traditions meet face to face."
    },
    coverImage: lasQueSiempreEstuvieronCover,
    amazonHardcoverUrl: "https://a.co/d/hJpEIi0",
    amazonSoftcoverUrl: "https://a.co/d/dGGqrQO",
    author: "Juan C. Ribot Guzmán",
    promise: {
      es: "Descubre las voces femeninas que la historia silenció.",
      en: "Discover the feminine voices that history silenced."
    },
    benefits: {
      es: ["Una nueva perspectiva sobre las tradiciones religiosas", "Diálogos que desafían lo que creías saber", "Las historias de mujeres poderosas finalmente contadas"],
      en: ["A fresh perspective on religious traditions", "Dialogues that challenge what you thought you knew", "Stories of powerful women finally told"]
    },
    whoIsFor: {
      es: ["Lectores que buscan espiritualidad sin dogmas", "Personas interesadas en el rol de las mujeres en la historia religiosa", "Amantes de la ficción literaria con profundidad filosófica"],
      en: ["Readers seeking spirituality without dogma", "People interested in women's role in religious history", "Lovers of literary fiction with philosophical depth"]
    },
    whatYoullLearn: {
      es: ["Cómo las tradiciones religiosas marginaron a las mujeres", "Las historias ocultas de María Magdalena, Khadija, y más", "Una visión de diálogo entre tradiciones que han dividido a la humanidad"],
      en: ["How religious traditions marginalized women", "The hidden stories of Mary Magdalene, Khadija, and more", "A vision of dialogue between traditions that have divided humanity"]
    },
    whatsInside: {
      es: ["Prólogo: La cumbre del Roraima", "Parte I: El encuentro de los fundadores", "Parte II: La llegada de ellas", "Parte III: Las preguntas incómodas", "Epílogo: Una nueva conversación"],
      en: ["Prologue: The summit of Roraima", "Part I: The meeting of the founders", "Part II: Their arrival", "Part III: The uncomfortable questions", "Epilogue: A new conversation"]
    },
    authorNote: {
      es: "Escribí esta novela porque las voces de estas mujeres merecían ser escuchadas. Durante años investigué cómo las tradiciones religiosas trataron a las mujeres que estuvieron junto a sus fundadores. Lo que descubrí me sorprendió y me indignó. Este libro es mi intento de darles el espacio que la historia les negó.",
      en: "I wrote this novel because these women's voices deserved to be heard. For years I researched how religious traditions treated the women who stood beside their founders. What I discovered surprised and outraged me. This book is my attempt to give them the space that history denied them."
    },
    testimonials: [
      { text: { es: "Una obra maestra que desafía todo lo que creía saber sobre espiritualidad.", en: "A masterpiece that challenges everything I thought I knew about spirituality." }, author: "Lector verificado" },
      { text: { es: "Finalmente, las mujeres tienen voz en esta conversación milenaria.", en: "Finally, women have a voice in this millennia-old conversation." }, author: "Crítico literario" }
    ],
    faq: [
      { q: { es: "¿Es este un libro anti-religioso?", en: "Is this an anti-religious book?" }, a: { es: "No. Es una invitación al diálogo y a considerar perspectivas que fueron silenciadas.", en: "No. It's an invitation to dialogue and to consider perspectives that were silenced." } },
      { q: { es: "¿Necesito conocimientos religiosos previos?", en: "Do I need prior religious knowledge?" }, a: { es: "No es necesario. El libro introduce a los personajes y sus contextos de forma accesible.", en: "Not necessary. The book introduces the characters and their contexts in an accessible way." } }
    ],
    relatedBooks: ["raices-en-tierra-ajena", "cartas-de-newark"]
  },
  "raices-en-tierra-ajena": {
    title: "Raíces En Tierra Ajena",
    slug: "raices-en-tierra-ajena",
    description: {
      es: "Una historia poderosa sobre familia, supervivencia y esperanza en la América dividida de hoy.",
      en: "A powerful story about family, survival, and hope in today's divided America."
    },
    coverImage: raicesEnTierraAjenaCover,
    amazonUrl: "https://a.co/d/d47VqsO",
    author: "Juan C. Ribot Guzmán",
    promise: {
      es: "Una novela que cambiará cómo ves a tus vecinos.",
      en: "A novel that will change how you see your neighbors."
    },
    benefits: {
      es: ["Comprenderás mejor la experiencia inmigrante", "Verás el poder transformador de las amistades inesperadas", "Una historia que humaniza lo que los noticieros simplifican"],
      en: ["You'll better understand the immigrant experience", "You'll see the transformative power of unexpected friendships", "A story that humanizes what the news oversimplifies"]
    },
    whoIsFor: {
      es: ["Familias que viven entre dos culturas", "Lectores que buscan historias que desafían prejuicios", "Cualquier persona interesada en la experiencia latina en EE.UU."],
      en: ["Families living between two cultures", "Readers seeking stories that challenge prejudices", "Anyone interested in the Latino experience in the U.S."]
    },
    whatYoullLearn: {
      es: ["Cómo el miedo divide comunidades", "El poder de la empatía infantil", "Que las fronteras más difíciles de cruzar están en nuestras mentes"],
      en: ["How fear divides communities", "The power of children's empathy", "That the hardest borders to cross are in our minds"]
    },
    whatsInside: {
      es: ["La vida de los Ramírez en Kenner, Louisiana", "Los prejuicios de la familia Davis", "El nacimiento de amistades prohibidas", "Un climax que lo cambia todo"],
      en: ["The Ramírez family's life in Kenner, Louisiana", "The Davis family's prejudices", "The birth of forbidden friendships", "A climax that changes everything"]
    },
    authorNote: {
      es: "Esta historia nació observando mi propio vecindario. Vi familias viviendo lado a lado sin conocerse realmente. Me pregunté: ¿qué pasaría si el miedo cediera ante la curiosidad de los niños?",
      en: "This story was born from observing my own neighborhood. I saw families living side by side without really knowing each other. I wondered: what would happen if fear gave way to children's curiosity?"
    },
    testimonials: [
      { text: { es: "Me hizo llorar y reflexionar sobre mis propios prejuicios.", en: "It made me cry and reflect on my own prejudices." }, author: "Lector de Louisiana" },
      { text: { es: "Una historia necesaria en estos tiempos.", en: "A necessary story in these times." }, author: "Club de lectura" }
    ],
    faq: [
      { q: { es: "¿Está basada en hechos reales?", en: "Is it based on real events?" }, a: { es: "Es ficción inspirada en experiencias reales de familias inmigrantes.", en: "It's fiction inspired by real experiences of immigrant families." } },
      { q: { es: "¿Es apropiada para adolescentes?", en: "Is it appropriate for teenagers?" }, a: { es: "Sí, es una excelente lectura para generar conversaciones familiares.", en: "Yes, it's an excellent read to generate family conversations." } }
    ],
    relatedBooks: ["nietos-en-la-diaspora", "cartas-de-newark"]
  },
  "cartas-de-newark": {
    title: "Cartas de Newark",
    slug: "cartas-de-newark",
    description: {
      es: "Una colección de cartas que capturan la experiencia puertorriqueña en Nueva Jersey.",
      en: "A collection of letters capturing the Puerto Rican experience in New Jersey."
    },
    coverImage: cartasDeNewarkCover,
    amazonUrl: "https://a.co/d/4dgdLk4",
    author: "Juan C. Ribot Guzmán",
    promise: {
      es: "Siente la nostalgia y el amor de la diáspora boricua.",
      en: "Feel the nostalgia and love of the Boricua diaspora."
    },
    benefits: {
      es: ["Conectarás con tus propias raíces", "Entenderás la experiencia de migración", "Cartas que se sienten como conversaciones con familia"],
      en: ["You'll connect with your own roots", "You'll understand the migration experience", "Letters that feel like conversations with family"]
    },
    whoIsFor: {
      es: ["Puertorriqueños en la diáspora", "Familias inmigrantes de cualquier origen", "Lectores de literatura epistolar"],
      en: ["Puerto Ricans in the diaspora", "Immigrant families from any background", "Readers of epistolary literature"]
    },
    whatYoullLearn: {
      es: ["La experiencia de criar hijos entre dos culturas", "Cómo mantener la identidad lejos de casa", "Las pequeñas victorias de la vida inmigrante"],
      en: ["The experience of raising children between two cultures", "How to maintain identity far from home", "The small victories of immigrant life"]
    },
    whatsInside: {
      es: ["Cartas de llegada", "Cartas de adaptación", "Cartas de nostalgia", "Cartas de esperanza"],
      en: ["Letters of arrival", "Letters of adaptation", "Letters of nostalgia", "Letters of hope"]
    },
    authorNote: {
      es: "Estas cartas son fragmentos de mi propia historia. Cada una captura un momento de añoranza, de esa sensación de no pertenecer completamente a ningún lugar pero pertenecer a todos.",
      en: "These letters are fragments of my own story. Each captures a moment of longing, that feeling of not fully belonging anywhere but belonging everywhere."
    },
    testimonials: [
      { text: { es: "Lloré leyendo porque sentí que hablaba de mi familia.", en: "I cried reading because I felt it was about my family." }, author: "Lectora de Newark" }
    ],
    faq: [
      { q: { es: "¿Son cartas reales?", en: "Are these real letters?" }, a: { es: "Son ficción basada en experiencias reales del autor y su familia.", en: "They're fiction based on the author's and his family's real experiences." } }
    ],
    relatedBooks: ["nietos-en-la-diaspora", "raices-en-tierra-ajena"]
  },
  "nietos-en-la-diaspora": {
    title: "Nietos en la Diáspora: Tres Generaciones, Una Historia",
    slug: "nietos-en-la-diaspora",
    description: {
      es: "¿Qué significa ser puertorriqueño cuando tu familia ha estado migrando por más de un siglo?",
      en: "What does it mean to be Puerto Rican when your family has been migrating for over a century?"
    },
    coverImage: nietosEnLaDiasporaCover,
    amazonUrl: "https://a.co/d/31LLEzW",
    author: "Rosnelma García Amalbert",
    promise: {
      es: "Descubre tu historia a través de tres generaciones.",
      en: "Discover your history through three generations."
    },
    benefits: {
      es: ["Conectarás con 500 años de historia boricua", "Diálogos familiares que resuenan", "Una guía para mantener raíces siendo global"],
      en: ["You'll connect with 500 years of Boricua history", "Family dialogues that resonate", "A guide to maintaining roots while being global"]
    },
    whoIsFor: {
      es: ["Familias puertorriqueñas en cualquier parte del mundo", "La tercera generación buscando identidad", "Educadores de historia latina"],
      en: ["Puerto Rican families anywhere in the world", "Third-generation seeking identity", "Latino history educators"]
    },
    whatYoullLearn: {
      es: ["Por qué tu familia migró", "Las contribuciones boricuas en EE.UU.", "Cómo ser global sin perder las raíces"],
      en: ["Why your family migrated", "Boricua contributions in the U.S.", "How to be global without losing your roots"]
    },
    whatsInside: {
      es: ["Diálogos entre abuelos y nietos", "Historia de los taínos a Bad Bunny", "La Gran Migración explicada", "Identidad en la tercera generación"],
      en: ["Dialogues between grandparents and grandchildren", "History from the Taínos to Bad Bunny", "The Great Migration explained", "Identity in the third generation"]
    },
    authorNote: {
      es: "Nuestros nietos nos hicieron preguntas que no sabíamos responder. ¿Por qué nos fuimos? ¿Qué significa ser boricua cuando nunca has vivido en la isla? Este libro nació de esas conversaciones.",
      en: "Our grandchildren asked us questions we didn't know how to answer. Why did we leave? What does it mean to be Boricua when you've never lived on the island? This book was born from those conversations."
    },
    testimonials: [
      { text: { es: "Le di este libro a mis hijos y ahora entienden por qué hablo español en casa.", en: "I gave this book to my children and now they understand why I speak Spanish at home." }, author: "Padre en Nueva York" }
    ],
    faq: [
      { q: { es: "¿Es solo para puertorriqueños?", en: "Is it only for Puerto Ricans?" }, a: { es: "Es para cualquier familia que haya migrado y quiera mantener su identidad.", en: "It's for any family that has migrated and wants to maintain their identity." } }
    ],
    relatedBooks: ["cartas-de-newark", "jibara-en-la-luna-espanol"]
  },
  "jibara-en-la-luna-english": {
    title: "JÍBARA EN LA LUNA: Transforming Challenges into Opportunities",
    slug: "jibara-en-la-luna-english",
    description: {
      es: "¿Qué pasaría si una jíbara de Puerto Rico pudiera alcanzar la luna sin perder su esencia?",
      en: "What would happen if a jíbara from Puerto Rico could reach the moon without losing her essence?"
    },
    coverImage: jibaraEnLaLunaEnglishCover,
    amazonUrl: "https://a.co/d/7QKyJOu",
    author: "Rosnelma García Amalbert",
    promise: {
      es: "Tu identidad es tu mayor fortaleza profesional.",
      en: "Your identity is your greatest professional strength."
    },
    benefits: {
      es: ["Estrategias probadas para Corporate America", "Cómo liderar sin perder tu esencia", "22 años de experiencia condensados"],
      en: ["Proven strategies for Corporate America", "How to lead without losing your essence", "22 years of experience condensed"]
    },
    whoIsFor: {
      es: ["Mujeres latinas en el mundo corporativo", "Profesionales que sienten que deben esconderse", "Líderes buscando autenticidad"],
      en: ["Latina women in the corporate world", "Professionals who feel they must hide", "Leaders seeking authenticity"]
    },
    whatYoullLearn: {
      es: ["Cómo navegar Corporate America", "Estrategias de liderazgo consciente", "Convertir desafíos en oportunidades"],
      en: ["How to navigate Corporate America", "Conscious leadership strategies", "Turning challenges into opportunities"]
    },
    whatsInside: {
      es: ["Mi viaje de Puerto Rico a California", "Lecciones de 22 años en farmacéuticas", "Framework de liderazgo jíbaro", "Ejercicios prácticos"],
      en: ["My journey from Puerto Rico to California", "Lessons from 22 years in pharmaceuticals", "Jíbara leadership framework", "Practical exercises"]
    },
    authorNote: {
      es: "Cuando llegué a Corporate America, pensé que tenía que cambiar quién era. Descubrí que mi identidad era mi mayor fortaleza. Este libro es para todas las mujeres que sienten que deben esconderse para pertenecer.",
      en: "When I arrived in Corporate America, I thought I had to change who I was. I discovered that my identity was my greatest strength. This book is for all women who feel they must hide to belong."
    },
    testimonials: [
      { text: { es: "Me dio el coraje para ser yo misma en las reuniones.", en: "It gave me the courage to be myself in meetings." }, author: "Ejecutiva farmacéutica" }
    ],
    faq: [
      { q: { es: "¿Es solo para mujeres?", en: "Is it only for women?" }, a: { es: "Aunque está escrito desde mi perspectiva como mujer, los principios aplican a cualquier profesional.", en: "While written from my perspective as a woman, the principles apply to any professional." } }
    ],
    relatedBooks: ["jibara-en-la-luna-espanol", "sofia-marie-paloma"]
  },
  "jibara-en-la-luna-espanol": {
    title: "JÍBARA EN LA LUNA: Transformando Desafíos en Oportunidades (Edición Español)",
    slug: "jibara-en-la-luna-espanol",
    description: {
      es: "¿Qué pasaría si una jíbara de Puerto Rico pudiera llegar a la luna sin perder su esencia?",
      en: "What would happen if a jíbara from Puerto Rico could reach the moon without losing her essence? (Spanish Edition)"
    },
    coverImage: jibaraEnLaLunaCover,
    amazonUrl: "https://a.co/d/23apCTx",
    author: "Rosnelma García Amalbert",
    promise: {
      es: "Tu identidad es tu mayor fortaleza profesional.",
      en: "Your identity is your greatest professional strength."
    },
    benefits: {
      es: ["Estrategias probadas para Corporate America", "Cómo liderar sin perder tu esencia", "22 años de experiencia condensados"],
      en: ["Proven strategies for Corporate America", "How to lead without losing your essence", "22 years of experience condensed"]
    },
    whoIsFor: {
      es: ["Mujeres latinas en el mundo corporativo", "Profesionales que sienten que deben esconderse", "Líderes buscando autenticidad"],
      en: ["Latina women in the corporate world", "Professionals who feel they must hide", "Leaders seeking authenticity"]
    },
    whatYoullLearn: {
      es: ["Cómo navegar Corporate America", "Estrategias de liderazgo consciente", "Convertir desafíos en oportunidades"],
      en: ["How to navigate Corporate America", "Conscious leadership strategies", "Turning challenges into opportunities"]
    },
    whatsInside: {
      es: ["Mi viaje de Puerto Rico a California", "Lecciones de 22 años en farmacéuticas", "Framework de liderazgo jíbaro", "Ejercicios prácticos"],
      en: ["My journey from Puerto Rico to California", "Lessons from 22 years in pharmaceuticals", "Jíbara leadership framework", "Practical exercises"]
    },
    authorNote: {
      es: "Cuando llegué a Corporate America, pensé que tenía que cambiar quién era. Descubrí que mi identidad era mi mayor fortaleza. Este libro es para todas las mujeres que sienten que deben esconderse para pertenecer.",
      en: "When I arrived in Corporate America, I thought I had to change who I was. I discovered that my identity was my greatest strength. This book is for all women who feel they must hide to belong."
    },
    testimonials: [
      { text: { es: "Me dio el coraje para ser yo misma en las reuniones.", en: "It gave me the courage to be myself in meetings." }, author: "Ejecutiva farmacéutica" }
    ],
    faq: [
      { q: { es: "¿Cuál es la diferencia con la versión en inglés?", en: "What's the difference from the English version?" }, a: { es: "El contenido es el mismo, solo cambia el idioma.", en: "The content is the same, only the language changes." } }
    ],
    relatedBooks: ["jibara-en-la-luna-english", "nietos-en-la-diaspora"]
  },
  "las-aventuras-de-luna-y-avo": {
    title: "Las Aventuras de Luna y Avo",
    slug: "las-aventuras-de-luna-y-avo",
    description: {
      es: "Un libro infantil lleno de aventuras que enseña a los niños sobre la valentía y la amistad.",
      en: "A children's book full of adventures teaching kids about courage and friendship."
    },
    coverImage: lasAventurasLunaAvoCover,
    amazonUrl: "https://www.amazon.com/Las-aventuras-Luna-Avo-Spanish-ebook/dp/B0DYYV2NKH",
    author: "Rosnelma García Amalbert",
    promise: {
      es: "La valentía se aprende con amigos al lado.",
      en: "Courage is learned with friends by your side."
    },
    benefits: {
      es: ["Enseña valentía a través de la aventura", "Personajes que los niños amarán", "Ilustraciones que capturan la imaginación"],
      en: ["Teaches courage through adventure", "Characters kids will love", "Illustrations that capture imagination"]
    },
    whoIsFor: {
      es: ["Niños de 4 a 8 años", "Padres que buscan libros con valores", "Educadores de preescolar y primaria"],
      en: ["Children ages 4-8", "Parents seeking books with values", "Preschool and elementary educators"]
    },
    whatYoullLearn: {
      es: ["Que la valentía no es no tener miedo", "El valor de la amistad", "Que la imaginación no tiene límites"],
      en: ["That courage isn't about not being afraid", "The value of friendship", "That imagination has no limits"]
    },
    whatsInside: {
      es: ["Las aventuras de Luna y su amigo Avo", "Ilustraciones a todo color", "Lecciones sobre valentía y amistad"],
      en: ["The adventures of Luna and her friend Avo", "Full-color illustrations", "Lessons on courage and friendship"]
    },
    authorNote: {
      es: "Luna y Avo nacieron de las historias que contaba a mis nietos antes de dormir. Quería crear personajes que les enseñaran que la valentía no es no tener miedo—es actuar a pesar del miedo.",
      en: "Luna and Avo were born from the stories I told my grandchildren before bed. I wanted to create characters that would teach them that courage isn't about not being afraid—it's about acting despite the fear."
    },
    testimonials: [
      { text: { es: "Mi hija pide que le lea Luna y Avo todas las noches.", en: "My daughter asks me to read Luna and Avo every night." }, author: "Mamá de Miami" }
    ],
    faq: [
      { q: { es: "¿Hay versión en inglés?", en: "Is there an English version?" }, a: { es: "Por ahora solo está disponible en español.", en: "For now it's only available in Spanish." } }
    ],
    relatedBooks: ["sofia-marie-paloma", "nietos-en-la-diaspora"]
  },
  "sofia-marie-paloma": {
    title: "Sofía Marie, 'Sofí Mary' o Paloma",
    slug: "sofia-marie-paloma",
    description: {
      es: "Sofía Marie es mucho más que una estudiante universitaria. Es el resultado de una infancia marcada por una madre brillante pero obsesivamente controladora.",
      en: "Sofía Marie is much more than a college freshman. She is the result of a childhood marked by a brilliant but obsessively controlling mother."
    },
    coverImage: sofiaMariePalomaCover,
    amazonUrl: "https://www.amazon.com/dp/B0FB82RBP6",
    author: "Rosnelma García Amalbert",
    promise: {
      es: "Descubre qué pasa cuando el amor se convierte en control.",
      en: "Discover what happens when love becomes control."
    },
    benefits: {
      es: ["Entenderás dinámicas familiares complejas", "Una protagonista memorable y real", "Una historia de liberación y autodescubrimiento"],
      en: ["You'll understand complex family dynamics", "A memorable and real protagonist", "A story of liberation and self-discovery"]
    },
    whoIsFor: {
      es: ["Jóvenes adultas buscando su identidad", "Padres reflexionando sobre sus métodos", "Lectores de drama familiar contemporáneo"],
      en: ["Young adults seeking their identity", "Parents reflecting on their methods", "Readers of contemporary family drama"]
    },
    whatYoullLearn: {
      es: ["Cómo el amor puede convertirse en control", "El camino hacia la libertad personal", "Que la identidad se construye, no se hereda"],
      en: ["How love can become control", "The path to personal freedom", "That identity is built, not inherited"]
    },
    whatsInside: {
      es: ["La infancia de Sofía bajo vigilancia", "Su llegada a la universidad", "El despertar de Paloma", "La confrontación final"],
      en: ["Sofía's childhood under surveillance", "Her arrival at college", "Paloma's awakening", "The final confrontation"]
    },
    authorNote: {
      es: "Sofía Marie representa a tantas jóvenes latinas que crecen entre dos culturas. Su madre representa el amor que se convierte en control cuando el miedo lo domina.",
      en: "Sofía Marie represents so many young Latinas who grow up between two cultures. Her mother represents love that becomes control when fear takes over."
    },
    testimonials: [
      { text: { es: "Me vi reflejada en Sofía. Esta historia necesitaba ser contada.", en: "I saw myself in Sofía. This story needed to be told." }, author: "Lectora universitaria" }
    ],
    faq: [
      { q: { es: "¿Es autobiográfica?", en: "Is it autobiographical?" }, a: { es: "Es ficción inspirada en patrones que he observado en muchas familias.", en: "It's fiction inspired by patterns I've observed in many families." } }
    ],
    relatedBooks: ["jibara-en-la-luna-english", "las-aventuras-de-luna-y-avo"]
  }
};

const BookProduct = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const { trackBuyDirectClick, trackAmazonClick, trackWaitlistSubmit, trackSampleDownload } = useBookAnalytics();
  const { addToCart } = useCart();
  
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [sampleEmail, setSampleEmail] = useState("");
  const [isWaitlistSubmitting, setIsWaitlistSubmitting] = useState(false);
  const [isSampleSubmitting, setIsSampleSubmitting] = useState(false);
  const [sampleToken, setSampleToken] = useState<string | null>(null);
  const [isBuyingDirect, setIsBuyingDirect] = useState(false);

  // Check if this book has direct purchase enabled
  const directPurchaseProductId = slug ? DIRECT_PURCHASE_BOOKS[slug] : null;
  const hasDirectPurchase = Boolean(directPurchaseProductId);

  const book = slug ? booksData[slug] : null;
  const isEnglishRoute = window.location.pathname.startsWith('/book/');

  // Check for sample token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('sample');
    if (token) {
      setSampleToken(token);
      trackSampleDownload({ slug: slug || '', language: language as 'en' | 'es' });
    }
  }, [slug, language, trackSampleDownload]);

  // Redirect /book/:slug to /libro/:slug
  if (isEnglishRoute && slug) {
    return <Navigate to={`/libro/${slug}`} replace />;
  }

  // Handle direct purchase for enabled books
  const handleBuyDirect = async () => {
    if (!directPurchaseProductId || !slug) return;
    
    setIsBuyingDirect(true);
    try {
      // Track analytics
      trackBuyDirectClick({ slug, language: language as 'en' | 'es', component: 'product' });
      
      // Fetch product from Supabase
      const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', directPurchaseProductId)
        .single();
      
      if (error || !productData) {
        throw new Error('Product not found');
      }
      
      // Transform Supabase product to match Product type
      const product: Product = {
        id: productData.id,
        title: productData.title as { es: string; en: string },
        description: productData.description as { es: string; en: string },
        price_cents: productData.price_cents,
        compare_at_price_cents: productData.compare_at_price_cents || undefined,
        images: productData.images || [],
        category_id: productData.category_id || '',
        tags: productData.tags || [],
        variants: productData.variants as any[] || undefined,
        is_active: productData.is_active || true,
        printify_product_id: productData.printify_product_id || undefined,
        printify_data: productData.printify_data,
        created_at: productData.created_at,
        updated_at: productData.updated_at,
      };
      
      // Add to cart (quantity 1, default variant)
      addToCart(product, 1, product.variants?.[0]?.id);
      
      // Navigate to checkout
      navigate('/checkout');
    } catch (error) {
      console.error('Buy direct failed:', error);
      toast({
        title: language === 'es' ? 'Error' : 'Error',
        description: language === 'es' 
          ? 'No pudimos procesar tu compra. Intenta de nuevo.' 
          : 'Could not process your purchase. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsBuyingDirect(false);
    }
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !slug || !book) return;

    setIsWaitlistSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('book-waitlist-signup', {
        body: {
          email: waitlistEmail,
          language,
          bookSlug: slug,
          sourceComponent: 'product',
          bookTitle: book.title,
        }
      });

      if (error) throw error;
      
      if (data?.alreadySubscribed) {
        toast({
          title: language === 'es' ? 'Ya estás en la lista' : "You're already on the list",
          description: language === 'es' 
            ? 'Te avisaremos cuando esté disponible.' 
            : "We'll notify you when it's available."
        });
      } else {
        trackWaitlistSubmit({ slug, language: language as 'en' | 'es' });
        toast({
          title: language === 'es' ? '¡Listo!' : 'Success!',
          description: language === 'es' 
            ? 'Revisa tu email para descargar la muestra.' 
            : 'Check your email to download the sample.'
        });
      }
      setWaitlistEmail("");
    } catch (error: any) {
      const errorData = error?.message ? JSON.parse(error.message) : {};
      if (errorData?.alreadySubscribed) {
        toast({
          title: language === 'es' ? 'Ya estás en la lista' : "You're already on the list",
          description: language === 'es' 
            ? 'Te avisaremos cuando esté disponible.' 
            : "We'll notify you when it's available."
        });
      } else {
        toast({
          title: language === 'es' ? 'Error' : 'Error',
          description: language === 'es' 
            ? 'No pudimos registrar tu email. Intenta de nuevo.' 
            : 'Could not register your email. Please try again.',
          variant: "destructive"
        });
      }
    } finally {
      setIsWaitlistSubmitting(false);
    }
  };

  const handleSampleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleEmail || !slug || !book) return;

    setIsSampleSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('book-waitlist-signup', {
        body: {
          email: sampleEmail,
          language,
          bookSlug: slug,
          sourceComponent: 'sample',
          bookTitle: book.title,
        }
      });

      if (error && !error.message?.includes('alreadySubscribed')) throw error;
      
      trackSampleDownload({ slug, language: language as 'en' | 'es' });
      toast({
        title: language === 'es' ? '¡Muestra enviada!' : 'Sample sent!',
        description: language === 'es' 
          ? 'Revisa tu email para descargar el capítulo.' 
          : 'Check your email to download the chapter.'
      });
      setSampleEmail("");
    } catch (error) {
      toast({
        title: language === 'es' ? 'Error' : 'Error',
        description: language === 'es' 
          ? 'No pudimos enviar la muestra. Intenta de nuevo.' 
          : 'Could not send the sample. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSampleSubmitting(false);
    }
  };

  const handleAmazonClick = (url: string, variant?: string) => {
    trackAmazonClick({ slug: slug || '', language: language as 'en' | 'es', component: 'product' });
    window.open(url, '_blank', 'noopener,noreferrer');
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

  const canonicalUrl = `https://ifctpzrmqcpqtgwepvoq.supabase.co/libro/${slug}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{book.title} | Juan C. Ribot & Rosnelma García</title>
        <meta name="description" content={book.description[language]} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={book.title} />
        <meta property="og:description" content={book.promise[language]} />
        <meta property="og:type" content="book" />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>
      
      <Navigation />
      
      {/* Hero Section - Above the Fold */}
      <section className="container mx-auto px-4 py-12 lg:py-20">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {language === 'es' ? 'Volver' : 'Back'}
        </Button>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto items-start">
          {/* Book Cover */}
          <div className="flex justify-center lg:sticky lg:top-24">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-60"></div>
              <img 
                src={book.coverImage} 
                alt={book.title}
                className="relative w-full max-w-md rounded-xl shadow-2xl"
              />
            </div>
          </div>

          {/* Hero Content */}
          <div className="space-y-8">
            <div>
              <Badge className="mb-4">{book.author}</Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                {book.title}
              </h1>
              <p className="text-xl text-primary font-medium mb-4">
                {book.promise[language]}
              </p>
              <ul className="space-y-3">
                {book.benefits[language].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Primary CTA - Buy Direct or Waitlist */}
            <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl p-6 lg:p-8 border border-border/50">
              {hasDirectPurchase ? (
                <>
                  {/* Direct Purchase Available */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {language === 'es' ? 'Comprar Directo' : 'Buy Direct'}
                    </h3>
                    <Badge variant="default" className="bg-green-600">
                      {language === 'es' ? 'Disponible' : 'Available'}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-6">
                    {language === 'es' 
                      ? 'Compra directamente y recibe tu libro firmado por el autor.'
                      : 'Buy directly and receive your book signed by the author.'}
                  </p>

                  <Button 
                    onClick={handleBuyDirect}
                    disabled={isBuyingDirect}
                    size="lg"
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                  >
                    {isBuyingDirect ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="mr-2 h-4 w-4" />
                    )}
                    {language === 'es' ? 'Comprar Ahora' : 'Buy Now'}
                  </Button>
                </>
              ) : (
                <>
                  {/* Waitlist for books without direct purchase */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Gift className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {language === 'es' ? 'Comprar Directo' : 'Buy Direct'}
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

                  <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder={language === 'es' ? 'Tu email' : 'Your email'}
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={isWaitlistSubmitting}
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      {language === 'es' ? 'Avisarme' : 'Get notified'}
                    </Button>
                  </form>
                </>
              )}
            </div>

            {/* Secondary CTA - Amazon */}
            {getAmazonUrl() && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'es' 
                    ? 'También disponible en:' 
                    : 'Also available on:'}
                </p>
                
                {book.amazonHardcoverUrl && book.amazonSoftcoverUrl ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleAmazonClick(book.amazonHardcoverUrl!, 'hardcover')}
                      className="flex-1"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Amazon (Hardcover)
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleAmazonClick(book.amazonSoftcoverUrl!, 'softcover')}
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
                    onClick={() => handleAmazonClick(getAmazonUrl()!)}
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
      </section>

      {/* Who This Book Is For */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <Users className="h-8 w-8 text-primary" />
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              {language === 'es' ? '¿Para quién es este libro?' : 'Who is this book for?'}
            </h2>
          </div>
          <ul className="grid md:grid-cols-2 gap-4">
            {book.whoIsFor[language].map((item, i) => (
              <li key={i} className="flex items-start gap-3 bg-background rounded-lg p-4 shadow-sm">
                <ChevronRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What You'll Learn/Feel */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <Lightbulb className="h-8 w-8 text-primary" />
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              {language === 'es' ? '¿Qué descubrirás?' : 'What will you discover?'}
            </h2>
          </div>
          <ul className="space-y-4">
            {book.whatYoullLearn[language].map((item, i) => (
              <li key={i} className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-card">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span className="text-foreground text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What's Inside */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="h-8 w-8 text-primary" />
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              {language === 'es' ? '¿Qué hay dentro?' : "What's inside?"}
            </h2>
          </div>
          <div className="bg-background rounded-xl p-6 lg:p-8 shadow-sm">
            <ul className="space-y-3">
              {book.whatsInside[language].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground">
                  <span className="text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Download Sample Chapter */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 lg:p-12">
            <Download className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              {language === 'es' ? 'Descarga un capítulo gratis' : 'Download a free chapter'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'es' 
                ? 'Ingresa tu email y te enviamos el primer capítulo.'
                : 'Enter your email and we\'ll send you the first chapter.'}
            </p>
            
            {sampleToken ? (
              <div className="bg-background rounded-lg p-6">
                <p className="text-primary font-medium mb-4">
                  {language === 'es' ? '¡Tu muestra está lista!' : 'Your sample is ready!'}
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Download className="mr-2 h-4 w-4" />
                  {language === 'es' ? 'Descargar PDF' : 'Download PDF'}
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  {language === 'es' 
                    ? '(El PDF estará disponible cuando lancemos la compra directa)'
                    : '(PDF will be available when we launch direct purchase)'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSampleRequest} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder={language === 'es' ? 'Tu email' : 'Your email'}
                  value={sampleEmail}
                  onChange={(e) => setSampleEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isSampleSubmitting}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {language === 'es' ? 'Enviar' : 'Send'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Author Note */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <Quote className="h-8 w-8 text-primary" />
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              {language === 'es' ? 'Nota del autor' : 'Author note'}
            </h2>
          </div>
          <blockquote className="text-lg lg:text-xl text-foreground leading-relaxed italic border-l-4 border-primary pl-6">
            "{book.authorNote[language]}"
          </blockquote>
          <p className="mt-6 text-muted-foreground font-medium">— {book.author}</p>
        </div>
      </section>

      {/* Testimonials */}
      {book.testimonials.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-8 text-center">
              {language === 'es' ? 'Lo que dicen los lectores' : 'What readers say'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {book.testimonials.map((testimonial, i) => (
                <div key={i} className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
                  <Quote className="h-6 w-6 text-primary/40 mb-4" />
                  <p className="text-foreground italic mb-4">"{testimonial.text[language]}"</p>
                  <p className="text-sm text-muted-foreground">— {testimonial.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {book.faq.length > 0 && (
        <section className="bg-muted/30 py-16 lg:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-8 text-center">
              {language === 'es' ? 'Preguntas frecuentes' : 'Frequently asked questions'}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {book.faq.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left text-foreground">
                    {item.q[language]}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.a[language]}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* Related Books */}
      {book.relatedBooks.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-8 text-center">
              {language === 'es' ? 'También te puede interesar' : 'You might also like'}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {book.relatedBooks.map((relatedSlug) => {
                const relatedBook = booksData[relatedSlug];
                if (!relatedBook) return null;
                return (
                  <Link 
                    key={relatedSlug} 
                    to={`/libro/${relatedSlug}`}
                    className="group block bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img 
                        src={relatedBook.coverImage} 
                        alt={relatedBook.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {relatedBook.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{relatedBook.author}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="bg-primary text-primary-foreground py-16 lg:py-24">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            {language === 'es' ? '¿Listo para comenzar?' : 'Ready to start?'}
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            {language === 'es' 
              ? 'Únete a la lista y sé el primero en saber cuando esté disponible la compra directa.'
              : 'Join the list and be the first to know when direct purchase is available.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => {
                trackBuyDirectClick({ slug: slug || '', language: language as 'en' | 'es', component: 'product' });
                document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Bell className="mr-2 h-4 w-4" />
              {language === 'es' ? 'Unirme a la lista' : 'Join the list'}
            </Button>
            {getAmazonUrl() && (
              <Button 
                size="lg" 
                variant="outline"
                className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => handleAmazonClick(getAmazonUrl()!)}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Amazon
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-8 px-4 text-center">
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} Juan C. Ribot Guzmán & Rosnelma García Amalbert
        </p>
      </footer>
    </div>
  );
};

export default BookProduct;
