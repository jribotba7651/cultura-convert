-- Finding: orders_guest_current_setting_role_check
-- Restrict guest order token policies to the service_role only, and remove the
-- client-controllable request-header token path (edge functions use
-- set_order_access_context(), which sets app.order_access_token).
DROP POLICY IF EXISTS "Guest orders accessible only with valid token" ON public.orders;
CREATE POLICY "Guest orders accessible only with valid token"
ON public.orders
FOR SELECT
TO service_role
USING (
  user_id IS NULL
  AND public.validate_order_access_token(
    id,
    current_setting('app.order_access_token', true)
  )
);

DROP POLICY IF EXISTS "Guest order items accessible only with valid token" ON public.order_items;
CREATE POLICY "Guest order items accessible only with valid token"
ON public.order_items
FOR SELECT
TO service_role
USING (
  order_id IN (
    SELECT o.id
    FROM public.orders o
    WHERE o.user_id IS NULL
      AND public.validate_order_access_token(
        o.id,
        current_setting('app.order_access_token', true)
      )
  )
);

-- Keep service-role management policy scoped to service_role only.
DROP POLICY IF EXISTS "Service role can manage order items" ON public.order_items;
CREATE POLICY "Service role can manage order items"
ON public.order_items
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Finding: sample_downloads_header_token_bypass
-- Split the policy: admins read via authenticated role; token lookups are
-- server-side only (service_role), no client-supplied header trust.
DROP POLICY IF EXISTS "Can read own record by token" ON public.sample_downloads;

CREATE POLICY "Admins can read sample downloads"
ON public.sample_downloads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can read sample downloads"
ON public.sample_downloads
FOR SELECT
TO service_role
USING (true);

-- Ensure anon/authenticated cannot read the token table directly.
REVOKE SELECT ON public.sample_downloads FROM anon;
GRANT SELECT ON public.sample_downloads TO authenticated;
GRANT ALL ON public.sample_downloads TO service_role;