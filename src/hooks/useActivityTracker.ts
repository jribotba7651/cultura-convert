/**
 * Hook for tracking user activity and maintaining session security
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { sessionSecurityHelpers } from '@/utils/sessionSecurity';

export const useActivityTracker = () => {
  const { user, isSessionValid } = useAuth();
  
  // Get helpers once, they don't change
  const { trackActivity, checkSessionValidity } = useMemo(() => sessionSecurityHelpers, []);

  // Track various user activities
  const trackUserActivity = useCallback(() => {
    if (user?.id) {
      trackActivity(user.id);
    }
  }, [user?.id, trackActivity]);

  // Set up activity tracking for mouse movements, clicks, and keyboard events
  useEffect(() => {
    if (!user?.id) return;

    let activityTimeout: NodeJS.Timeout;
    
    const handleActivity = () => {
      // Debounce activity tracking to avoid excessive calls
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        trackUserActivity();
      }, 5000); // Track activity every 5 seconds max
    };

    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Check session validity periodically
    const sessionCheckInterval = setInterval(() => {
      if (user?.id && !checkSessionValidity(user.id)) {
        console.warn('Session invalid, user will be signed out');
      }
    }, 60000); // Check every minute

    return () => {
      clearTimeout(activityTimeout);
      clearInterval(sessionCheckInterval);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user?.id, trackUserActivity, checkSessionValidity]);

  // Verify session is still valid
  const verifySession = useCallback(() => {
    if (!user?.id) return false;
    return isSessionValid();
  }, [user?.id, isSessionValid]);

  return {
    trackActivity: trackUserActivity,
    verifySession
  };
};