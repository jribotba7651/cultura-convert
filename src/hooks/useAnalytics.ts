import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const getSessionId = (): string => {
  const storageKey = 'analytics_session_id';
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
};

const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    return 'mobile';
  }
  if (/Tablet/i.test(ua)) {
    return 'tablet';
  }
  return 'desktop';
};

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const sessionId = getSessionId();
        const path = location.pathname;
        const userAgent = navigator.userAgent;
        const deviceType = getDeviceType();
        const referrer = document.referrer;

        await supabase.functions.invoke('track-pageview', {
          body: {
            path,
            sessionId,
            userAgent,
            deviceType,
            referrer,
          },
        });
      } catch (error) {
        // Silently fail - analytics should not break the app
        console.debug('Analytics tracking failed:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);
};
