-- Create table for secure order access tokens
CREATE TABLE public.order_access_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.order_access_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for order access tokens (only accessible via token verification)
CREATE POLICY "Order access tokens are only accessible for verification" 
ON public.order_access_tokens 
FOR SELECT 
USING (expires_at > now());

-- Update the orders RLS policies to remove the security vulnerability
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create new secure policies for orders
CREATE POLICY "Users can view their own authenticated orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid()::text = user_id::text AND user_id IS NOT NULL);

-- Create policy for anonymous order access via token (will be checked in application logic)
CREATE POLICY "Service role can access all orders" 
ON public.orders 
FOR SELECT 
USING (current_setting('role') = 'service_role');

-- Update order_items policies to be more secure
DROP POLICY IF EXISTS "Users can view order items for their orders" ON public.order_items;

CREATE POLICY "Users can view order items for their authenticated orders" 
ON public.order_items 
FOR SELECT 
USING (order_id IN (
  SELECT orders.id
  FROM orders
  WHERE auth.uid()::text = orders.user_id::text AND orders.user_id IS NOT NULL
));

CREATE POLICY "Service role can access all order items" 
ON public.order_items 
FOR SELECT 
USING (current_setting('role') = 'service_role');

-- Add index for better performance
CREATE INDEX idx_order_access_tokens_token ON public.order_access_tokens(token);
CREATE INDEX idx_order_access_tokens_order_id ON public.order_access_tokens(order_id);
CREATE INDEX idx_order_access_tokens_expires_at ON public.order_access_tokens(expires_at);