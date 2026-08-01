ALTER TABLE public.analytics_page_views
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS landing_referrer text;

CREATE INDEX IF NOT EXISTS idx_analytics_page_views_utm_source
  ON public.analytics_page_views (utm_source)
  WHERE utm_source IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_page_views_utm_campaign
  ON public.analytics_page_views (utm_campaign)
  WHERE utm_campaign IS NOT NULL;