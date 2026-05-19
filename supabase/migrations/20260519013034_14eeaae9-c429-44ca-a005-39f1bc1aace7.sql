
-- 1. PRODUCTS: strip sensitive cost data from variants and hide printify_data from public

-- Sanitize existing variants JSON: remove sensitive keys per element
UPDATE public.products
SET variants = (
  SELECT jsonb_agg(
    (v - 'cost' - 'sku' - 'is_default' - 'is_enabled' - 'grams' - 'quantity')
  )
  FROM jsonb_array_elements(variants) v
)
WHERE jsonb_typeof(variants) = 'array';

-- Revoke column-level SELECT on printify_data from anon and authenticated roles
REVOKE SELECT ON public.products FROM anon, authenticated;
GRANT SELECT (
  id, title, description, category_id, price_cents, compare_at_price_cents,
  images, variants, tags, is_active, printify_product_id, created_at, updated_at
) ON public.products TO anon, authenticated;

-- Admins keep full read via service role; add admin SELECT policy for full row access
DROP POLICY IF EXISTS "Admins can view all product data" ON public.products;
CREATE POLICY "Admins can view all product data"
ON public.products FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. ANALYTICS_EVENTS: restrict event names via CHECK constraint
ALTER TABLE public.analytics_events
  DROP CONSTRAINT IF EXISTS analytics_events_name_check;
ALTER TABLE public.analytics_events
  ADD CONSTRAINT analytics_events_name_check
  CHECK (event_name IN (
    'buy_direct_click','amazon_click','waitlist_submit',
    'sample_download','book_page_view'
  ));

-- Tighten INSERT policy to reuse the constraint + size cap on event_data
DROP POLICY IF EXISTS "Anyone can track events" ON public.analytics_events;
CREATE POLICY "Anyone can track allowed events"
ON public.analytics_events FOR INSERT
WITH CHECK (
  event_name IN (
    'buy_direct_click','amazon_click','waitlist_submit',
    'sample_download','book_page_view'
  )
  AND pg_column_size(event_data) < 8192
);

-- 3. SAMPLE_DOWNLOADS: add expiry
ALTER TABLE public.sample_downloads
  ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days');

DROP POLICY IF EXISTS "Can read own record by token" ON public.sample_downloads;
CREATE POLICY "Can read own record by token"
ON public.sample_downloads FOR SELECT
USING (
  (
    download_token = ((current_setting('request.headers'::text, true))::json ->> 'x-download-token'::text)
    AND expires_at > now()
  )
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 4. BOOK_WAITLIST: tighten insert with basic email validation
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.book_waitlist;
CREATE POLICY "Anyone can join waitlist"
ON public.book_waitlist FOR INSERT
WITH CHECK (
  email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(email) <= 254
  AND language IN ('es','en')
  AND length(book_slug) <= 100
  AND length(source_component) <= 100
);

-- 5. SAMPLE_DOWNLOADS insert tightening
DROP POLICY IF EXISTS "Anyone can request sample" ON public.sample_downloads;
CREATE POLICY "Anyone can request sample"
ON public.sample_downloads FOR INSERT
WITH CHECK (
  email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(email) <= 254
  AND language IN ('es','en')
  AND length(book_slug) <= 100
);

-- 6. Restrict EXECUTE on SECURITY DEFINER helper functions
REVOKE EXECUTE ON FUNCTION public.log_order_access(uuid,text,inet,text,boolean,text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.record_order_access_attempt(inet,uuid,boolean) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.rotate_order_access_token(uuid,text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.increment_token_access_count(uuid,text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.check_order_access_rate_limit(inet,uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_order_access_context(uuid,text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.check_order_access_token(uuid,text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.validate_order_access_token(uuid,text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.generate_slug(text) FROM anon, authenticated, public;
-- has_role must remain executable for RLS evaluation under authenticated/anon roles
