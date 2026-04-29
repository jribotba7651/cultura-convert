-- Make consulting-resources bucket private
UPDATE storage.buckets SET public = false WHERE id = 'consulting-resources';

-- Drop the public download policy
DROP POLICY IF EXISTS "Public can download consulting resources by exact path" ON storage.objects;

-- Only service_role can read objects from this bucket (used by edge functions to generate signed URLs)
CREATE POLICY "Service role can read consulting resources"
ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'consulting-resources');
