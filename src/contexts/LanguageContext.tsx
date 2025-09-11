import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  es: {
    // Header
    title: "Escritores Puertorriqueños",
    heroTitle: "Descubre el talento literario de Puerto Rico",
    heroSubtitle: "Conoce a nuestros autores y sus obras que celebran la cultura puertorriqueña",
    
    // Authors section
    authorsTitle: "Nuestros Autores",
    
    // Author actions
    knowMore: "Conoce Más",
    contact: "Contacto",
    
    // Book actions
    buyOnAmazon: "Comprar en Amazon",
    preview: "Vista Previa",
    comingSoon: "Próximamente",
    
    // Additional info
    additionalInfo: "Información adicional del autor...",
    
    // Toast messages
    languageChanged: "Idioma cambiado",
    languageChangedDesc: "Idioma cambiado a",
    contactDevelopment: "Contacto en desarrollo",
    contactDevelopmentDesc: "La funcionalidad de contacto estará disponible pronto",
    buyingRedirect: "Redirigiendo a Amazon",
    buyingRedirectDesc: "Te estamos redirigiendo a Amazon para comprar",
    previewOpen: "Abriendo vista previa",
    previewOpenDesc: "Abriendo vista previa de",
    
    // Navigation
    home: "Inicio",
    blog: "Blog",
    siteTitle: "Jíbaro en la Luna",
    
    // Blog
    blogDescription: "Reflexiones, historias y voces de la cultura jíbara que late en la distancia",
    
    // Footer
    footerText: "© 2024 Escritores Puertorriqueños. Todos los derechos reservados.",
    
    // Book status
    published: "Publicado",
    
    // Languages
    spanish: "Español",
    english: "English"
  },
  en: {
    // Header
    title: "Puerto Rican Writers",
    heroTitle: "Discover Puerto Rico's Literary Talent",
    heroSubtitle: "Meet our authors and their works that celebrate Puerto Rican culture",
    
    // Authors section
    authorsTitle: "Our Authors",
    
    // Author actions
    knowMore: "Learn More",
    contact: "Contact",
    
    // Book actions
    buyOnAmazon: "Buy on Amazon",
    preview: "Preview",
    comingSoon: "Coming Soon",
    
    // Additional info
    additionalInfo: "Additional author information...",
    
    // Toast messages
    languageChanged: "Language changed",
    languageChangedDesc: "Language changed to",
    contactDevelopment: "Contact in development",
    contactDevelopmentDesc: "Contact functionality will be available soon",
    buyingRedirect: "Redirecting to Amazon",
    buyingRedirectDesc: "We're redirecting you to Amazon to purchase",
    previewOpen: "Opening preview",
    previewOpenDesc: "Opening preview for",
    
    // Navigation
    home: "Home",
    blog: "Blog",
    siteTitle: "Jíbaro en la Luna",
    
    // Blog
    blogDescription: "Reflections, stories and voices of jíbaro culture that beats in the distance",
    
    // Footer
    footerText: "© 2024 Puerto Rican Writers. All rights reserved.",
    
    // Book status
    published: "Published",
    
    // Languages
    spanish: "Español",
    english: "English"
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['es']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};