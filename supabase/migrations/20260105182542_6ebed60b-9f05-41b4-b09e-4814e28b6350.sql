-- Fix 1: Restrict consulting_leads INSERT to service_role only
DROP POLICY IF EXISTS "Service role can insert consulting leads" ON public.consulting_leads;
CREATE POLICY "Service role can insert consulting leads" 
ON public.consulting_leads
FOR INSERT
WITH CHECK (current_setting('role'::text) = 'service_role'::text);

-- Fix 2: Restrict contact_inquiries INSERT to service_role only
DROP POLICY IF EXISTS "Service role can insert contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Service role can insert contact inquiries" 
ON public.contact_inquiries
FOR INSERT
WITH CHECK (current_setting('role'::text) = 'service_role'::text);

-- Fix 3: Add access_count column if not exists and update token validation
ALTER TABLE public.order_access_tokens 
ADD COLUMN IF NOT EXISTS access_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_accessed_at timestamptz;

-- Update validate_order_access_token to include access count limit
CREATE OR REPLACE FUNCTION public.validate_order_access_token(p_order_id uuid, p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.order_access_tokens 
    WHERE order_id = p_order_id 
    AND token = p_token 
    AND expires_at > now()
    AND is_active = true
    AND access_count < 50
  );
END;
$$;

-- Create function to increment access count on successful validation
CREATE OR REPLACE FUNCTION public.increment_token_access_count(p_order_id uuid, p_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.order_access_tokens 
  SET access_count = access_count + 1,
      last_accessed_at = now()
  WHERE order_id = p_order_id 
  AND token = p_token 
  AND is_active = true;
END;
$$;