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

const UTM_STORAGE_KEY = 'jela_utm_v1';
const LANDING_REF_KEY = 'jela_landing_referrer_v1';
// Attribution window: UTM values expire after 30 days of inactivity.
const UTM_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
type UtmKey = (typeof UTM_KEYS)[number];
type UtmValues = Partial<Record<UtmKey, string>>;

type StoredUtm = { values: UtmValues; updatedAt: number };

const readStoredUtm = (): StoredUtm | null => {
  try {
    const raw = localStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUtm;
    if (!parsed || typeof parsed.updatedAt !== 'number' || !parsed.values) return null;
    // Expire after 30 days of inactivity — no stale campaign attribution.
    if (Date.now() - parsed.updatedAt > UTM_TTL_MS) {
      localStorage.removeItem(UTM_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

// Returns the UTM values for this pageview. A fresh campaign in the URL wins
// (latest campaign wins) and refreshes the 30-day inactivity window.
const resolveUtm = (search: string): UtmValues => {
  const params = new URLSearchParams(search);
  const fromUrl: UtmValues = {};
  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value && value.trim()) fromUrl[key] = value.trim().slice(0, 200);
  });

  try {
    if (Object.keys(fromUrl).length > 0) {
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify({ values: fromUrl, updatedAt: Date.now() }));
      return fromUrl;
    }
    const stored = readStoredUtm();
    if (stored) {
      // Touch the timestamp so an active visitor keeps their attribution.
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify({ values: stored.values, updatedAt: Date.now() }));
      return stored.values;
    }
  } catch {
    return fromUrl;
  }
  return {};
};

// The referrer of the first page of the session, kept separately.
const resolveLandingReferrer = (): string | null => {
  try {
    const existing = sessionStorage.getItem(LANDING_REF_KEY);
    if (existing !== null) return existing || null;
    const ref = document.referrer || '';
    sessionStorage.setItem(LANDING_REF_KEY, ref);
    return ref || null;
  } catch {
    return document.referrer || null;
  }
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

// Read the stored attribution (UTM + landing referrer) without touching the
// timestamps. Used at checkout to attribute a sale to its traffic source.
// Returns nulls when nothing is stored (organic/direct or expired window).
export type OrderAttribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landing_referrer: string | null;
};

export const getStoredAttribution = (): OrderAttribution => {
  const stored = readStoredUtm();
  const values = stored?.values ?? {};
  let landingReferrer: string | null = null;
  try {
    landingReferrer = sessionStorage.getItem(LANDING_REF_KEY) || null;
  } catch {
    landingReferrer = null;
  }
  return {
    utm_source: values.utm_source ?? null,
    utm_medium: values.utm_medium ?? null,
    utm_campaign: values.utm_campaign ?? null,
    utm_content: values.utm_content ?? null,
    utm_term: values.utm_term ?? null,
    landing_referrer: landingReferrer,
  };
};

const getDeviceTypeUnused = (): string => {
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
        const utm = resolveUtm(location.search);
        const landingReferrer = resolveLandingReferrer();

        await supabase.functions.invoke('track-pageview', {
          body: {
            path,
            sessionId,
            userAgent,
            deviceType,
            referrer,
            landingReferrer,
            ...utm,
          },
        });
      } catch (error) {
        // Silently fail - analytics should not break the app
        console.debug('Analytics tracking failed:', error);
      }
    };

    trackPageView();
  }, [location.pathname, location.search]);
};
