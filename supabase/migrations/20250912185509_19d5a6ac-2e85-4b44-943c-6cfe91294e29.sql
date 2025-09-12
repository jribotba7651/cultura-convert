-- Phase 1: Fix critical guest order access issues
-- Create security definer function to check if order has valid access token
CREATE OR REPLACE FUNCTION public.check_order_access_token(order_uuid uuid, token_value text)
RETURNS boolean AS $$
BEGIN
  -- Check if there's a valid, non-expired token for this order
  RETURN EXISTS (
    SELECT 1 FROM public.order_access_tokens 
    WHERE order_id = order_uuid 
    AND token = token_value 
    AND expires_at > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Add RLS policy for guest orders with valid access tokens
CREATE POLICY "Guest orders accessible with valid token" 
ON public.orders 
FOR SELECT 
USING (
  -- Allow access if user owns order (existing policy logic)
  (auth.uid()::text = user_id::text AND user_id IS NOT NULL)
  OR
  -- Allow access for guest orders when accessed via edge function with service role
  (user_id IS NULL AND current_setting('role') = 'service_role')
);

-- Add RLS policy for guest order items with valid access tokens  
CREATE POLICY "Guest order items accessible with valid token"
ON public.order_items 
FOR SELECT 
USING (
  -- Allow access if user owns the order (existing policy logic)
  order_id IN (
    SELECT id FROM public.orders 
    WHERE auth.uid()::text = user_id::text AND user_id IS NOT NULL
  )
  OR
  -- Allow access for guest order items when accessed via edge function with service role
  (current_setting('role') = 'service_role')
);

-- Remove old restrictive policies that don't account for guest access
DROP POLICY IF EXISTS "Users can view their own authenticated orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view order items for their authenticated orders" ON public.order_items;