/**
 * Client-side rate limiting utility for forms and API calls
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitEntry {
  attempts: number;
  resetTime: number;
  blockedUntil?: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();

  constructor(private config: RateLimitConfig) {}

  /**
   * Check if an action is allowed for a given key
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(key);

    // If no entry exists, allow the action
    if (!entry) {
      this.attempts.set(key, {
        attempts: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }

    // Check if we're currently blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
      return false;
    }

    // Check if the window has expired
    if (now > entry.resetTime) {
      this.attempts.set(key, {
        attempts: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }

    // Check if we've exceeded the limit
    if (entry.attempts >= this.config.maxAttempts) {
      const blockDuration = this.config.blockDurationMs || this.config.windowMs;
      entry.blockedUntil = now + blockDuration;
      return false;
    }

    // Increment attempts and allow
    entry.attempts++;
    return true;
  }

  /**
   * Get remaining attempts for a key
   */
  getRemainingAttempts(key: string): number {
    const entry = this.attempts.get(key);
    if (!entry) return this.config.maxAttempts;
    
    const now = Date.now();
    if (now > entry.resetTime) return this.config.maxAttempts;
    
    return Math.max(0, this.config.maxAttempts - entry.attempts);
  }

  /**
   * Get time until reset for a key
   */
  getTimeUntilReset(key: string): number {
    const entry = this.attempts.get(key);
    if (!entry) return 0;
    
    const now = Date.now();
    if (entry.blockedUntil && entry.blockedUntil > now) {
      return entry.blockedUntil - now;
    }
    
    return Math.max(0, entry.resetTime - now);
  }

  /**
   * Clear attempts for a key
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetTime && (!entry.blockedUntil || now > entry.blockedUntil)) {
        this.attempts.delete(key);
      }
    }
  }
}

// Pre-configured rate limiters for common use cases
export const contactFormLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000 // 30 minutes block
});

export const authLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 60 * 60 * 1000 // 1 hour block
});

export { RateLimiter };