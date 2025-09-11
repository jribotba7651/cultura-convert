/**
 * Sanitiza una cadena de texto para prevenir ataques XSS
 */
export const sanitizeText = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/[<>'"]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        default: return char;
      }
    });
};

/**
 * Valida que una URL sea segura
 */
export const isValidURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:', 'mailto:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitiza parámetros de URL
 */
export const sanitizeURLParam = (param: string): string => {
  return encodeURIComponent(param);
};

/**
 * Valida datos de entrada básicos
 */
export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  name: (name: string): boolean => {
    return name.length >= 2 && name.length <= 100 && /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s-'\.]+$/.test(name);
  },
  
  message: (message: string): boolean => {
    return message.length >= 10 && message.length <= 1000;
  }
};