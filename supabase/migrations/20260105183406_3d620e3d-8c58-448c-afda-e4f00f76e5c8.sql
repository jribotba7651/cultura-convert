-- Fix 1: Set search_path on generate_slug function
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  slug text;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  slug := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Remove leading/trailing hyphens
  slug := trim(both '-' from slug);
  -- Limit length
  slug := substring(slug from 1 for 100);
  RETURN slug;
END;
$$;

-- Fix 2: Add admin SELECT policy for order_items to ensure proper access control
CREATE POLICY "Admins can view all order items" 
ON public.order_items
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 3: Add explicit service_role policy for order_items management
CREATE POLICY "Service role can manage order items" 
ON public.order_items
FOR ALL
USING (current_setting('role'::text) = 'service_role'::text)
WITH CHECK (current_setting('role'::text) = 'service_role'::text);