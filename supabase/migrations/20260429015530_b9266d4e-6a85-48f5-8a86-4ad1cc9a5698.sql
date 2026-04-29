CREATE POLICY "Admins can read consulting resources"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'consulting-resources'
  AND has_role(auth.uid(), 'admin'::app_role)
);
