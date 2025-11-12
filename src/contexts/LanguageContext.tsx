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
    services: "Servicios",
    store: "Tienda",
    projects: "Proyectos",
    siteTitle: "Jíbaro en la Luna",
    
    // Projects page
    projectsTitle: "Mis Proyectos Open Source",
    projectsSubtitle: "Herramientas y utilidades gratuitas que he desarrollado para la comunidad",
    chromeExtension: "Extensión de Chrome",
    desktopApp: "Aplicación de Escritorio",
    viewOnGitHub: "Ver en GitHub",
    download: "Descargar",
    install: "Instalar",
    stars: "estrellas",
    forks: "forks",
    lastUpdate: "Última actualización",
    techStack: "Tecnologías",
    loading: "Cargando...",
    errorLoading: "Error al cargar",
    
    // Blog
    blogDescription: "Reflexiones, historias y voces de la cultura jíbara que late en la distancia",
    
    // Footer
    footerText: "© 2024 Escritores Puertorriqueños. Todos los derechos reservados.",
    
    // Book status
    published: "Publicado",
    
    // Languages
    spanish: "Español",
    english: "English",
    
    // Auth
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    signOut: "Cerrar Sesión",
    myAccount: "Mi Cuenta",
    welcome: "Bienvenido",
    email: "Correo electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    createAccount: "Crear Cuenta",
    backToStore: "Volver a la tienda",
    welcomeMessage: "Inicia sesión o crea una cuenta para continuar",
    
    // Security messages
    tooManyAttempts: "Demasiados intentos fallidos. Intenta de nuevo más tarde.",
    invalidCredentials: "Credenciales inválidas",
    emailNotConfirmed: "Por favor confirma tu email antes de iniciar sesión",
    userAlreadyRegistered: "Este email ya está registrado",
    checkEmailConfirm: "Revisa tu email para confirmar tu cuenta",
    passwordsDontMatch: "Las contraseñas no coinciden",
    passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
    signedOut: "Sesión cerrada",
    signedOutSuccess: "Has cerrado sesión exitosamente",
    error: "Error",
    
    // Orders
    myOrders: "Mis Pedidos",
    manageBlog: "Gestionar Blog",
    manageResources: "Gestionar Recursos",
    manageNewsletter: "Gestionar Newsletter",
    manageOrders: "Gestionar Pedidos",
    dashboardAnalytics: "Dashboard Analytics",
    orderStatus: "Estado",
    orderDate: "Fecha",
    orderTotal: "Total",
    orderProducts: "Productos",
    noOrders: "No tienes pedidos aún",
    orderNumber: "Pedido",
    pending: "Pendiente",
    paid: "Pagado",
    processing: "Procesando",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
    failed: "Fallido"
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
    services: "Services",
    store: "Store",
    projects: "Projects",
    siteTitle: "Jíbaro en la Luna",
    
    // Projects page
    projectsTitle: "My Open Source Projects",
    projectsSubtitle: "Free tools and utilities I've developed for the community",
    chromeExtension: "Chrome Extension",
    desktopApp: "Desktop Application",
    viewOnGitHub: "View on GitHub",
    download: "Download",
    install: "Install",
    stars: "stars",
    forks: "forks",
    lastUpdate: "Last updated",
    techStack: "Tech Stack",
    loading: "Loading...",
    errorLoading: "Error loading",
    
    // Blog
    blogDescription: "Reflections, stories and voices of jíbaro culture that beats in the distance",
    
    // Footer
    footerText: "© 2024 Puerto Rican Writers. All rights reserved.",
    
    // Book status
    published: "Published",
    
    // Languages
    spanish: "Español",
    english: "English",
    
    // Auth
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    myAccount: "My Account",
    welcome: "Welcome",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    createAccount: "Create Account",
    backToStore: "Back to store",
    welcomeMessage: "Sign in or create an account to continue",
    
    // Security messages
    tooManyAttempts: "Too many failed attempts. Please try again later.",
    invalidCredentials: "Invalid credentials",
    emailNotConfirmed: "Please confirm your email before signing in",
    userAlreadyRegistered: "This email is already registered",
    checkEmailConfirm: "Check your email to confirm your account",
    passwordsDontMatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 6 characters",
    signedOut: "Signed out",
    signedOutSuccess: "You have been signed out successfully",
    error: "Error",
    
    // Orders
    myOrders: "My Orders",
    manageBlog: "Manage Blog",
    manageResources: "Manage Resources",
    manageNewsletter: "Manage Newsletter",
    manageOrders: "Manage Orders",
    dashboardAnalytics: "Analytics Dashboard",
    orderStatus: "Status",
    orderDate: "Date",
    orderTotal: "Total",
    orderProducts: "Products",
    noOrders: "You don't have any orders yet",
    orderNumber: "Order",
    pending: "Pending",
    paid: "Paid",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    failed: "Failed"
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // 1. Try to get from localStorage
    const saved = localStorage.getItem('preferred-language');
    if (saved === 'es' || saved === 'en') return saved;
    
    // 2. Detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('es')) return 'es';
    
    // 3. Default to Spanish
    return 'es';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('preferred-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['es']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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