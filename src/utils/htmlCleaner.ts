/**
 * Utility functions for cleaning HTML content from product descriptions
 */

/**
 * Removes HTML tags and decodes HTML entities from text
 */
export const cleanHTML = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  // Remove HTML tags
  let cleaned = html.replace(/<[^>]*>/g, '');
  
  // Decode common HTML entities
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#39;': "'",
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—'
  };
  
  Object.entries(entities).forEach(([entity, replacement]) => {
    cleaned = cleaned.replace(new RegExp(entity, 'g'), replacement);
  });
  
  // Remove extra whitespace and normalize
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

/**
 * Truncates text to specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  
  const cleaned = cleanHTML(text);
  
  if (cleaned.length <= maxLength) return cleaned;
  
  return cleaned.substring(0, maxLength).trim() + '...';
};

/**
 * Extracts the first meaningful paragraph from HTML content
 */
export const extractFirstParagraph = (html: string): string => {
  if (!html) return '';
  
  // Try to find content within p tags first
  const pMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
  if (pMatch && pMatch[1]) {
    return cleanHTML(pMatch[1]);
  }
  
  // Fallback to cleaning the entire content
  return cleanHTML(html);
};