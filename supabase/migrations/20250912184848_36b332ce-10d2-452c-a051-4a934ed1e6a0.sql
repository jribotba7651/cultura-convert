-- Fix critical security vulnerability in order_access_tokens table
-- Remove the current overly permissive RLS policy and replace with secure access

-- Drop the current insecure policy
DROP POLICY IF EXISTS "Order access tokens are only accessible for verification" ON public.order_access_tokens;

-- Create a secure policy that only allows service role access
-- This ensures only our edge functions can read tokens for verification
CREATE POLICY "Only service role can access order tokens for verification" 
ON public.order_access_tokens 
FOR SELECT 
USING (
  -- Only the service role (edge functions) can access these tokens
  current_setting('role') = 'service_role'
);

-- Ensure no other operations are allowed on tokens from client side
-- (INSERT/UPDATE/DELETE should only happen via service role in edge functions)