-- Drop existing RLS policies that need to be replaced
DROP POLICY IF EXISTS "Anonymous orders accessible only via edge function verification" ON public.orders;
DROP POLICY IF EXISTS "Anonymous order items accessible only via edge function verific" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view order items for their own orders" ON public.order_items;

-- Create security definer function to validate order access tokens
CREATE OR REPLACE FUNCTION public.validate_order_access_token(p_order_id uuid, p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if there's a valid, active, non-expired token for this specific order
  RETURN EXISTS (
    SELECT 1 FROM public.order_access_tokens 
    WHERE order_id = p_order_id 
    AND token = p_token 
    AND expires_at > now()
    AND is_active = true
  );
END;
$$;

-- Create improved RLS policies for orders table
CREATE POLICY "Guest orders accessible only with valid token"
ON public.orders
FOR SELECT
USING (
  (user_id IS NULL AND current_setting('role'::text) = 'service_role'::text) AND
  (
    -- Validate access token from request context
    public.validate_order_access_token(
      id, 
      COALESCE(
        current_setting('request.headers', true)::json->>'x-access-token',
        current_setting('app.order_access_token', true)
      )
    )
  )
);

CREATE POLICY "Authenticated users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid()::text = user_id::text AND user_id IS NOT NULL);

CREATE POLICY "Users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);

-- Create improved RLS policies for order_items table
CREATE POLICY "Guest order items accessible only with valid token"
ON public.order_items
FOR SELECT
USING (
  order_id IN (
    SELECT o.id FROM public.orders o
    WHERE o.user_id IS NULL 
    AND current_setting('role'::text) = 'service_role'::text
    AND public.validate_order_access_token(
      o.id,
      COALESCE(
        current_setting('request.headers', true)::json->>'x-access-token',
        current_setting('app.order_access_token', true)
      )
    )
  )
);

CREATE POLICY "Users can view order items for their own orders"
ON public.order_items
FOR SELECT
USING (
  order_id IN (
    SELECT o.id FROM public.orders o
    WHERE auth.uid()::text = o.user_id::text AND o.user_id IS NOT NULL
  )
);

-- Add function to set order access token in session for edge functions
CREATE OR REPLACE FUNCTION public.set_order_access_context(p_order_id uuid, p_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validate token first
  IF NOT public.validate_order_access_token(p_order_id, p_token) THEN
    RAISE EXCEPTION 'Invalid or expired access token';
  END IF;
  
  -- Set context for the session
  PERFORM set_config('app.order_access_token', p_token, true);
  PERFORM set_config('app.current_order_id', p_order_id::text, true);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.validate_order_access_token(uuid, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_order_access_context(uuid, text) TO anon, authenticated, service_role;