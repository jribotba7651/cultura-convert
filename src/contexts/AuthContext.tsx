import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { sessionSecurity } from '@/utils/sessionSecurity';
import { authLimiter } from '@/utils/rateLimiter';
import { logFailedLogin, logSessionTimeout, securityMonitor } from '@/utils/securityMonitoring';
import { safeLog } from '@/utils/dataMasking';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  isSessionValid: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    try {
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) return;
          
          // Handle session events securely
          if (session?.user) {
            // Initialize session security for new sessions
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              sessionSecurity.initializeSession(session.user.id);
              safeLog.info('User session started', { userId: session.user.id });
            }
          } else if (event === 'SIGNED_OUT') {
            // Clean up session security
            if (user?.id) {
              logSessionTimeout(user.id, 'user_signout');
            }
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      // Check for existing session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error.message);
        } else if (process.env.NODE_ENV === 'development') {
          console.log('Initial session loaded');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch((error) => {
        if (!mounted) return;
        console.error('Error in getSession:', error.message);
        setLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error in AuthProvider useEffect:', error);
      if (mounted) setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string) => {
    // Enhanced input validation
    if (!email || !email.includes('@') || email.length > 255) {
      return { error: { message: 'Invalid email format' } };
    }
    
    if (!password || password.length < 8 || password.length > 128) {
      return { error: { message: 'Password must be between 8-128 characters' } };
    }
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Rate limiting check
    const rateLimitKey = `signin_${email.toLowerCase()}`;
    if (!authLimiter.isAllowed(rateLimitKey)) {
      const timeUntilReset = Math.ceil(authLimiter.getTimeUntilReset(rateLimitKey) / 1000 / 60);
      return { error: { message: `Too many attempts. Try again in ${timeUntilReset} minutes.` } };
    }

    // Enhanced input validation
    if (!email || !email.includes('@') || email.length > 255) {
      return { error: { message: 'Invalid email format' } };
    }
    
    if (!password || password.length < 1 || password.length > 128) {
      return { error: { message: 'Invalid password' } };
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    // Log failed attempts for security monitoring
    if (error) {
      logFailedLogin(undefined, email);
      safeLog.error('Sign-in failed', { email });
    }

    return { error };
  };

  const signOut = async () => {
    // Clean up session security before signing out
    if (user?.id) {
      await sessionSecurity.endSession(user.id);
    }
    
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const isSessionValid = (): boolean => {
    if (!user?.id) return false;
    return sessionSecurity.isSessionValid(user.id);
  };

  // Set up session timeout listener
  useEffect(() => {
    const handleSessionTimeout = (event: Event) => {
      const customEvent = event as CustomEvent;
      safeLog.warn('Session timeout detected', { 
        userId: customEvent.detail?.userId,
        reason: customEvent.detail?.reason 
      });
      // The session will be automatically cleared by the security manager
    };

    window.addEventListener('sessionTimeout', handleSessionTimeout);
    return () => {
      window.removeEventListener('sessionTimeout', handleSessionTimeout);
    };
  }, []);

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isSessionValid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};