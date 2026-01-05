-- Fix sample_downloads table: restrict SELECT to only matching download_token
DROP POLICY IF EXISTS "Can read by token" ON public.sample_downloads;

CREATE POLICY "Can read own record by token" 
ON public.sample_downloads 
FOR SELECT 
USING (
  download_token = current_setting('request.headers', true)::json->>'x-download-token'
  OR has_role(auth.uid(), 'admin'::app_role)
);