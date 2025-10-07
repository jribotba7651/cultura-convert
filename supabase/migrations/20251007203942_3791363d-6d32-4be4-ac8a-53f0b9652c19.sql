-- Add UPDATE and DELETE policies to orders table to prevent unauthorized modifications

-- Only service role (for webhooks/backend) and admins can update orders
CREATE POLICY "Only service role and admins can update orders"
ON public.orders
FOR UPDATE
USING (
  current_setting('role'::text) = 'service_role'::text 
  OR public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  current_setting('role'::text) = 'service_role'::text 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can delete orders (service role generally shouldn't delete)
CREATE POLICY "Only admins can delete orders"
ON public.orders
FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);