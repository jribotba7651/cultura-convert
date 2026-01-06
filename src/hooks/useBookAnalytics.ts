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

interface TrackEventOptions {
  slug: string;
  language: 'en' | 'es';
  component: 'hero' | 'featured' | 'grid' | 'author' | 'product' | 'direct-checkout-section';
}

export const useBookAnalytics = () => {
  const trackBuyDirectClick = async ({ slug, language, component }: TrackEventOptions) => {
    try {
      await supabase.functions.invoke('track-analytics-event', {
        body: {
          eventName: 'buy_direct_click',
          eventData: { slug, language, component },
          sessionId: getSessionId(),
        },
      });
    } catch (error) {
      console.debug('Analytics tracking failed:', error);
    }
  };

  const trackAmazonClick = async ({ slug, language, component }: TrackEventOptions) => {
    try {
      await supabase.functions.invoke('track-analytics-event', {
        body: {
          eventName: 'amazon_click',
          eventData: { slug, language, component },
          sessionId: getSessionId(),
        },
      });
    } catch (error) {
      console.debug('Analytics tracking failed:', error);
    }
  };

  const trackWaitlistSubmit = async ({ slug, language }: { slug: string; language: 'en' | 'es' }) => {
    try {
      await supabase.functions.invoke('track-analytics-event', {
        body: {
          eventName: 'waitlist_submit',
          eventData: { slug, language },
          sessionId: getSessionId(),
        },
      });
    } catch (error) {
      console.debug('Analytics tracking failed:', error);
    }
  };

  const trackSampleDownload = async ({ slug, language }: { slug: string; language: 'en' | 'es' }) => {
    try {
      await supabase.functions.invoke('track-analytics-event', {
        body: {
          eventName: 'sample_download',
          eventData: { slug, language },
          sessionId: getSessionId(),
        },
      });
    } catch (error) {
      console.debug('Analytics tracking failed:', error);
    }
  };

  return {
    trackBuyDirectClick,
    trackAmazonClick,
    trackWaitlistSubmit,
    trackSampleDownload,
  };
};
