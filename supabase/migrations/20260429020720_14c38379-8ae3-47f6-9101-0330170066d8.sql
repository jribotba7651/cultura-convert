-- Remove public read access to consulting_resources (file paths were exposed)
DROP POLICY IF EXISTS "Anyone can view consulting resources" ON public.consulting_resources;

-- Admins can still view via existing admin policies; ensure service role can read for edge functions
CREATE POLICY "Service role can view consulting resources"
ON public.consulting_resources
FOR SELECT
USING (current_setting('role'::text) = 'service_role'::text);

CREATE POLICY "Admins can view consulting resources"
ON public.consulting_resources
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));