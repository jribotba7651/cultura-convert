/**
 * Session security utilities for enhanced authentication security
 */

import { supabase } from '@/integrations/supabase/client';

interface SessionActivity {
  lastActivity: number;
  sessionStart: number;
  activityCount: number;
}

class SessionSecurityManager {
  private sessionData: Map<string, SessionActivity> = new Map();
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private inactivityTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize session tracking for a user
   */
  initializeSession(userId: string): void {
    const now = Date.now();
    this.sessionData.set(userId, {
      lastActivity: now,
      sessionStart: now,
      activityCount: 1
    });
    this.startInactivityTimer(userId);
  }

  /**
   * Update activity for a session
   */
  updateActivity(userId: string): void {
    const session = this.sessionData.get(userId);
    if (session) {
      session.lastActivity = Date.now();
      session.activityCount += 1;
      this.sessionData.set(userId, session);
      this.startInactivityTimer(userId);
    }
  }

  /**
   * Check if session is valid and not expired
   */
  isSessionValid(userId: string): boolean {
    const session = this.sessionData.get(userId);
    if (!session) return false;

    const now = Date.now();
    const timeSinceActivity = now - session.lastActivity;
    const sessionDuration = now - session.sessionStart;

    // Check inactivity timeout
    if (timeSinceActivity > this.INACTIVITY_TIMEOUT) {
      this.endSession(userId);
      return false;
    }

    // Check maximum session duration
    if (sessionDuration > this.MAX_SESSION_DURATION) {
      this.endSession(userId);
      return false;
    }

    return true;
  }

  /**
   * End a session and clean up
   */
  async endSession(userId: string): Promise<void> {
    this.sessionData.delete(userId);
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }

    // Sign out from Supabase
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during session cleanup:', error);
    }
  }

  /**
   * Get session info for monitoring
   */
  getSessionInfo(userId: string): SessionActivity | null {
    return this.sessionData.get(userId) || null;
  }

  /**
   * Start inactivity timer
   */
  private startInactivityTimer(userId: string): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    this.inactivityTimer = setTimeout(() => {
      if (!this.isSessionValid(userId)) {
        this.handleSessionTimeout(userId);
      }
    }, this.INACTIVITY_TIMEOUT);
  }

  /**
   * Handle session timeout
   */
  private async handleSessionTimeout(userId: string): Promise<void> {
    console.log('Session timeout detected for user:', userId);
    await this.endSession(userId);
    
    // Trigger a custom event for the app to handle
    window.dispatchEvent(new CustomEvent('sessionTimeout', {
      detail: { userId, reason: 'inactivity' }
    }));
  }
}

// Export singleton instance
export const sessionSecurity = new SessionSecurityManager();

/**
 * Helper functions for session security operations
 * Note: This is NOT a React hook - use these functions directly
 */
export const sessionSecurityHelpers = {
  trackActivity: (userId: string) => {
    sessionSecurity.updateActivity(userId);
  },

  checkSessionValidity: (userId: string): boolean => {
    return sessionSecurity.isSessionValid(userId);
  },

  endSession: async (userId: string): Promise<void> => {
    await sessionSecurity.endSession(userId);
  }
};

// Keep backward compatibility but mark as deprecated
/** @deprecated Use sessionSecurityHelpers instead */
export const useSessionSecurity = () => sessionSecurityHelpers;