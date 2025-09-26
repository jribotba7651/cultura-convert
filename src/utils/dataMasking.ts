/**
 * Data masking utilities for protecting sensitive customer information
 */

/**
 * Mask email addresses for logging and display
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return '[INVALID_EMAIL]';
  
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  
  const visibleChars = Math.min(2, localPart.length - 2);
  const maskedLocal = localPart.substring(0, visibleChars) + 
                      '*'.repeat(localPart.length - visibleChars);
  
  return `${maskedLocal}@${domain}`;
};

/**
 * Mask phone numbers for logging and display
 */
export const maskPhone = (phone: string): string => {
  if (!phone) return '[NO_PHONE]';
  
  // Remove all non-numeric characters
  const numbersOnly = phone.replace(/\D/g, '');
  
  if (numbersOnly.length < 4) {
    return '*'.repeat(numbersOnly.length);
  }
  
  // Show last 4 digits only
  const lastFour = numbersOnly.slice(-4);
  const masked = '*'.repeat(numbersOnly.length - 4) + lastFour;
  
  return masked;
};

/**
 * Mask personal names for logging
 */
export const maskName = (name: string): string => {
  if (!name) return '[NO_NAME]';
  
  const words = name.trim().split(/\s+/);
  return words.map(word => {
    if (word.length <= 1) return word;
    return word[0] + '*'.repeat(word.length - 1);
  }).join(' ');
};

/**
 * Mask address information
 */
export const maskAddress = (address: any): any => {
  if (!address || typeof address !== 'object') return '[MASKED_ADDRESS]';
  
  return {
    street: address.street ? `${address.street.substring(0, 3)}***` : undefined,
    city: address.city || '[CITY]',
    state: address.state || '[STATE]',
    postal_code: address.postal_code ? `***${address.postal_code.slice(-2)}` : undefined,
    country: address.country || '[COUNTRY]'
  };
};

/**
 * Comprehensive order data masking for logging
 */
export const maskOrderData = (order: any): any => {
  if (!order) return order;
  
  return {
    ...order,
    customer_email: order.customer_email ? maskEmail(order.customer_email) : undefined,
    customer_name: order.customer_name ? maskName(order.customer_name) : undefined,
    customer_phone: order.customer_phone ? maskPhone(order.customer_phone) : undefined,
    shipping_address: order.shipping_address ? maskAddress(order.shipping_address) : undefined,
    billing_address: order.billing_address ? maskAddress(order.billing_address) : undefined,
    // Keep non-sensitive data as-is
    id: order.id,
    status: order.status,
    total_amount_cents: order.total_amount_cents,
    created_at: order.created_at,
    updated_at: order.updated_at
  };
};

/**
 * Safe console logging with automatic data masking
 */
export const safeLog = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, data ? maskSensitiveData(data) : '');
    }
  },
  
  error: (message: string, error?: any) => {
    console.error(message, error ? maskSensitiveData(error) : '');
  },
  
  warn: (message: string, data?: any) => {
    console.warn(message, data ? maskSensitiveData(data) : '');
  }
};

/**
 * Automatically detect and mask sensitive data in objects
 */
const maskSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['email', 'phone', 'name', 'address', 'customer_email', 'customer_name', 'customer_phone'];
  const masked = { ...data };
  
  for (const [key, value] of Object.entries(masked)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      if (key.toLowerCase().includes('email')) {
        masked[key] = typeof value === 'string' ? maskEmail(value) : value;
      } else if (key.toLowerCase().includes('phone')) {
        masked[key] = typeof value === 'string' ? maskPhone(value) : value;
      } else if (key.toLowerCase().includes('name')) {
        masked[key] = typeof value === 'string' ? maskName(value) : value;
      } else if (key.toLowerCase().includes('address')) {
        masked[key] = maskAddress(value);
      }
    }
  }
  
  return masked;
};

/**
 * Create a safe error response that doesn't expose sensitive data
 */
export const createSafeErrorResponse = (error: any, userMessage?: string): any => {
  const safeError = {
    message: userMessage || 'An error occurred while processing your request',
    timestamp: new Date().toISOString(),
    // Don't include sensitive data in error responses
  };
  
  // Log the full error details safely (masked)
  safeLog.error('Application error occurred', error);
  
  return safeError;
};
