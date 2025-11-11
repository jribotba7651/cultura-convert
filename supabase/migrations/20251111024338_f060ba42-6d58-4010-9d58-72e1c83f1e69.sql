-- Create consulting-resources storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('consulting-resources', 'consulting-resources', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access
CREATE POLICY "Public can view consulting resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'consulting-resources');

-- Create policy for authenticated users to upload
CREATE POLICY "Admins can upload consulting resources"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'consulting-resources' 
  AND auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'::app_role
  )
);

-- Create policy for admins to update
CREATE POLICY "Admins can update consulting resources"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'consulting-resources' 
  AND auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'::app_role
  )
);

-- Create policy for admins to delete
CREATE POLICY "Admins can delete consulting resources"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'consulting-resources' 
  AND auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'::app_role
  )
);