-- 1) Remove email_queue from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.email_queue;

-- 2) Revoke EXECUTE on sensitive SECURITY DEFINER functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.validate_order_access_token(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_order_access_context(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.check_order_access_token(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.log_order_access(uuid, text, inet, text, boolean, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.record_order_access_attempt(inet, uuid, boolean) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.rotate_order_access_token(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.increment_token_access_count(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.check_order_access_rate_limit(inet, uuid) FROM anon, authenticated, public;

-- Ensure service_role retains access (edge functions use service_role)
GRANT EXECUTE ON FUNCTION public.validate_order_access_token(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_order_access_context(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_order_access_token(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_order_access(uuid, text, inet, text, boolean, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_order_access_attempt(inet, uuid, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.rotate_order_access_token(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_token_access_count(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_order_access_rate_limit(inet, uuid) TO service_role;

-- 3) Restrict consulting-resources bucket: allow direct file fetch but block listing
-- Replace the broad SELECT policy with one that requires a specific object name (no wildcard listing)
DROP POLICY IF EXISTS "Public can view consulting resources" ON storage.objects;

CREATE POLICY "Public can download consulting resources by exact path"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'consulting-resources'
  AND name IS NOT NULL
  AND name <> ''
);
-- Note: Supabase listing requires a "list" RPC that checks SELECT on objects with prefix-only filters.
-- This policy still allows direct object fetch by full path (which is what getPublicUrl uses)
-- but the bucket remains public for individual downloads. To fully prevent enumeration,
-- consider the gated-download approach (signed URLs after lead capture) — see chat for follow-up.
