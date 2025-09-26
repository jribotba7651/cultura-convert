-- Fix security issue with order_access_tokens table
-- Add comprehensive RLS policies to restrict all operations to service role only

-- First, ensure RLS is enabled (it should already be)
ALTER TABLE public.order_access_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policy to recreate with better naming
DROP POLICY IF EXISTS "Only service role can access order tokens for verification" ON public.order_access_tokens;

-- Create comprehensive policies that restrict ALL operations to service role only
CREATE POLICY "Service role only: SELECT order access tokens" 
ON public.order_access_tokens 
FOR SELECT 
USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role only: INSERT order access tokens" 
ON public.order_access_tokens 
FOR INSERT 
WITH CHECK (current_setting('role') = 'service_role');

CREATE POLICY "Service role only: UPDATE order access tokens" 
ON public.order_access_tokens 
FOR UPDATE 
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

CREATE POLICY "Service role only: DELETE order access tokens" 
ON public.order_access_tokens 
FOR DELETE 
USING (current_setting('role') = 'service_role');

-- Add additional security measures for the related tables
-- Ensure order_access_attempts and order_access_logs are also properly secured

-- For order_access_attempts - make sure only service role can manage these
ALTER TABLE public.order_access_attempts ENABLE ROW LEVEL SECURITY;

-- Update existing policy for order_access_attempts to be more specific
DROP POLICY IF EXISTS "Service role can manage access attempts" ON public.order_access_attempts;

CREATE POLICY "Service role only: ALL operations on access attempts" 
ON public.order_access_attempts 
FOR ALL 
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- For order_access_logs - make sure only service role can manage these
ALTER TABLE public.order_access_logs ENABLE ROW LEVEL SECURITY;

-- Update existing policy for order_access_logs to be more specific
DROP POLICY IF EXISTS "Service role can access order access logs" ON public.order_access_logs;

CREATE POLICY "Service role only: ALL operations on access logs" 
ON public.order_access_logs 
FOR ALL 
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');