-- Phase 1: Fix critical guest order access - implement proper token-based RLS policies

-- Drop the current insecure policies that allow blanket service role access
DROP POLICY IF EXISTS "Guest orders accessible with valid token" ON public.orders;
DROP POLICY IF EXISTS "Guest order items accessible with valid token" ON public.order_items;
DROP POLICY IF EXISTS "Service role can access all orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can access all order items" ON public.order_items;

-- Create secure RLS policies for orders
CREATE POLICY "Authenticated users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid()::text = user_id::text AND user_id IS NOT NULL);

CREATE POLICY "Anonymous orders accessible only via edge function verification" 
ON public.orders 
FOR SELECT 
USING (
  user_id IS NULL 
  AND current_setting('role') = 'service_role'
  AND current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- Create secure RLS policies for order items  
CREATE POLICY "Users can view order items for their own orders"
ON public.order_items 
FOR SELECT 
USING (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE auth.uid()::text = user_id::text AND user_id IS NOT NULL
  )
);

CREATE POLICY "Anonymous order items accessible only via edge function verification"
ON public.order_items 
FOR SELECT 
USING (
  current_setting('role') = 'service_role'
  AND current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  AND order_id IN (
    SELECT id FROM public.orders 
    WHERE user_id IS NULL
  )
);

-- Phase 2: Add order access logging for security monitoring
CREATE TABLE IF NOT EXISTS public.order_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  access_method TEXT NOT NULL, -- 'token', 'authenticated_user'
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on access logs
ALTER TABLE public.order_access_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can access logs (for security monitoring)
CREATE POLICY "Service role can access order access logs" 
ON public.order_access_logs 
FOR ALL 
USING (current_setting('role') = 'service_role');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_access_logs_order_id ON public.order_access_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_access_logs_created_at ON public.order_access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_order_access_logs_ip_address ON public.order_access_logs(ip_address);

-- Create function to log order access attempts
CREATE OR REPLACE FUNCTION public.log_order_access(
  p_order_id UUID,
  p_access_method TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT false,
  p_error_message TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.order_access_logs (
    order_id, 
    access_method, 
    ip_address, 
    user_agent, 
    success, 
    error_message
  ) VALUES (
    p_order_id, 
    p_access_method, 
    p_ip_address, 
    p_user_agent, 
    p_success, 
    p_error_message
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Phase 3: Add token rotation capability
ALTER TABLE public.order_access_tokens 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS replaced_by UUID NULL,
ADD COLUMN IF NOT EXISTS access_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE NULL;

-- Create function to rotate access tokens
CREATE OR REPLACE FUNCTION public.rotate_order_access_token(
  p_order_id UUID,
  p_old_token TEXT
)
RETURNS TEXT AS $$
DECLARE
  new_token TEXT;
  old_token_record RECORD;
BEGIN
  -- Generate new token
  new_token := encode(gen_random_bytes(32), 'base64');
  
  -- Verify old token exists and is valid
  SELECT * INTO old_token_record 
  FROM public.order_access_tokens 
  WHERE order_id = p_order_id 
    AND token = p_old_token 
    AND expires_at > now() 
    AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired token';
  END IF;
  
  -- Insert new token
  INSERT INTO public.order_access_tokens (
    order_id, 
    token, 
    expires_at
  ) VALUES (
    p_order_id, 
    new_token, 
    now() + interval '7 days'
  );
  
  -- Deactivate old token and link to new one
  UPDATE public.order_access_tokens 
  SET is_active = false,
      replaced_by = (
        SELECT id FROM public.order_access_tokens 
        WHERE order_id = p_order_id AND token = new_token
      )
  WHERE id = old_token_record.id;
  
  RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;