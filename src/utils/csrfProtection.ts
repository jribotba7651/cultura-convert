/**
 * CSRF protection utilities for form security
 */

import React from 'react';
import { generateSecureToken } from './security';

class CSRFManager {
  private tokens: Map<string, { token: string; expires: number }> = new Map();
  private readonly TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

  /**
   * Generate a new CSRF token for a form
   */
  generateToken(formId: string): string {
    const token = generateSecureToken(32);
    const expires = Date.now() + this.TOKEN_EXPIRY;
    
    this.tokens.set(formId, { token, expires });
    
    // Clean up expired tokens
    this.cleanupExpiredTokens();
    
    return token;
  }

  /**
   * Validate a CSRF token
   */
  validateToken(formId: string, providedToken: string): boolean {
    const stored = this.tokens.get(formId);
    
    if (!stored) {
      return false;
    }

    // Check if token is expired
    if (Date.now() > stored.expires) {
      this.tokens.delete(formId);
      return false;
    }

    // Validate token (timing-safe comparison)
    const isValid = this.secureCompare(stored.token, providedToken);
    
    // One-time use: remove token after validation
    if (isValid) {
      this.tokens.delete(formId);
    }
    
    return isValid;
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [formId, tokenData] of this.tokens.entries()) {
      if (now > tokenData.expires) {
        this.tokens.delete(formId);
      }
    }
  }

  /**
   * Secure string comparison to prevent timing attacks
   */
  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  /**
   * Clear all tokens (useful for logout)
   */
  clearAllTokens(): void {
    this.tokens.clear();
  }
}

// Export singleton instance
export const csrfManager = new CSRFManager();

/**
 * React hook for CSRF protection in forms
 */
export const useCSRFProtection = (formId: string) => {
  const generateToken = () => csrfManager.generateToken(formId);
  const validateToken = (token: string) => csrfManager.validateToken(formId, token);
  
  return { generateToken, validateToken };
};

/**
 * Higher-order component to add CSRF protection to forms
 */
export const withCSRFProtection = <T extends object>(
  Component: React.ComponentType<T>
) => {
  return (props: T & { formId: string }) => {
    const { formId, ...restProps } = props;
    const { generateToken, validateToken } = useCSRFProtection(formId);
    
    return React.createElement(Component, {
      ...(restProps as T),
      csrfToken: generateToken(),
      validateCSRF: validateToken
    });
  };
};