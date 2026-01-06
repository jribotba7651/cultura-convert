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
  
  // Decode common HTML entities including Spanish characters
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#39;': "'",
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—',
    '&aacute;': 'á',
    '&eacute;': 'é',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú',
    '&ntilde;': 'ñ',
    '&Aacute;': 'Á',
    '&Eacute;': 'É',
    '&Iacute;': 'Í',
    '&Oacute;': 'Ó',
    '&Uacute;': 'Ú',
    '&Ntilde;': 'Ñ',
    '&uuml;': 'ü',
    '&Uuml;': 'Ü',
    '&iquest;': '¿',
    '&iexcl;': '¡',
    '&deg;': '°',
    '&hellip;': '...',
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&rdquo;': '"',
    '&ldquo;': '"',
    '&trade;': '™',
    '&copy;': '©',
    '&reg;': '®'
  };
  
  Object.entries(entities).forEach(([entity, replacement]) => {
    cleaned = cleaned.replace(new RegExp(entity, 'g'), replacement);
  });
  
  // Remove extra whitespace and normalize
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

/**
 * Cleans markdown syntax from text (for excerpts/previews)
 */
export const cleanMarkdown = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  let cleaned = text;
  
  // Remove various markdown link patterns
  // Pattern: [](url) - empty links with content in parentheses
  cleaned = cleaned.replace(/\[\s*\]\s*\([^)]*\)/g, '');
  
  // Pattern: [text](url) - links with text, keep the text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  
  // Remove any leftover brackets from malformed links
  cleaned = cleaned.replace(/\[\s*\]/g, '');
  
  // Remove bold/italic markers
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
  
  // Remove headers
  cleaned = cleaned.replace(/^#+\s*/gm, '');
  
  // Remove raw URLs that might be left over (including truncated ones ending with ...)
  cleaned = cleaned.replace(/https?:\/\/[^\s)]*\.{3}?/g, '');
  cleaned = cleaned.replace(/https?:\/\/[^\s)]+/g, '');
  
  // Remove leftover parentheses with only whitespace or empty
  cleaned = cleaned.replace(/\(\s*\)/g, '');
  
  // Remove single orphan opening/closing parentheses at start of text
  cleaned = cleaned.replace(/^\s*\(\s*$/gm, '');
  cleaned = cleaned.replace(/^\s*\)\s*$/gm, '');
  cleaned = cleaned.replace(/^\s*\(\s+/g, '');
  
  // Clean HTML tags if any
  cleaned = cleanHTML(cleaned);
  
  // Clean up multiple spaces and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Remove leading/trailing orphan parentheses
  cleaned = cleaned.replace(/^\s*\(?\s*$/, '').replace(/^\(\s*/, '').replace(/\s*\)$/, '');
  
  return cleaned.trim();
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
    const cleaned = cleanHTML(pMatch[1]);
    return cleaned.length > 20 ? cleaned : cleanHTML(html);
  }
  
  // Try to get first sentence/line if no paragraphs
  const cleaned = cleanHTML(html);
  const sentences = cleaned.split(/[.!?]\s+/);
  if (sentences.length > 1 && sentences[0].length > 20) {
    return sentences[0] + '.';
  }
  
  // Return cleaned content up to first line break or 200 chars
  const firstLine = cleaned.split('\n')[0];
  if (firstLine.length > 200) {
    return firstLine.substring(0, 197) + '...';
  }
  
  return firstLine || cleaned;
};

/**
 * Filters and limits product variants to reasonable combinations
 */
export const filterVariants = (variants: any[], productTitle: string): any[] => {
  if (!variants || variants.length === 0) return [];
  
  // Filter to only enabled and available variants
  const availableVariants = variants.filter(v => 
    (v.is_available !== false && v.available !== false) && 
    (v.is_enabled !== false && v.enabled !== false)
  );
  
  // If it's clothing, limit size/color combinations
  if (productTitle.toLowerCase().includes('shirt') || 
      productTitle.toLowerCase().includes('hoodie') || 
      productTitle.toLowerCase().includes('t-shirt')) {
    
    // Group by size first, then limit colors per size
    const sizeGroups: { [key: string]: any[] } = {};
    
    availableVariants.forEach(variant => {
      const sizeMatch = variant.title?.match(/\b(XS|S|M|L|XL|XXL|XXXL|2XL|3XL)\b/i);
      const size = sizeMatch ? sizeMatch[0] : 'One Size';
      
      if (!sizeGroups[size]) {
        sizeGroups[size] = [];
      }
      sizeGroups[size].push(variant);
    });
    
    // Limit to max 6 colors per size, prioritize basic colors
    const basicColors = ['black', 'white', 'navy', 'gray', 'red', 'blue'];
    const limitedVariants: any[] = [];
    
    Object.entries(sizeGroups).forEach(([size, variants]) => {
      // Sort by basic colors first, then by price
      const sorted = variants.sort((a, b) => {
        const aBasic = basicColors.some(color => 
          a.title?.toLowerCase().includes(color)
        ) ? 0 : 1;
        const bBasic = basicColors.some(color => 
          b.title?.toLowerCase().includes(color)
        ) ? 0 : 1;
        
        if (aBasic !== bBasic) return aBasic - bBasic;
        return (a.price || 0) - (b.price || 0);
      });
      
      limitedVariants.push(...sorted.slice(0, 6));
    });
    
    return limitedVariants.slice(0, 20); // Max 20 total variants
  }
  
  // For coffee and other products, limit to 10 variants
  return availableVariants.slice(0, 10);
};