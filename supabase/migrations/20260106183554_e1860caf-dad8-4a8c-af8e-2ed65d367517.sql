-- Add a column to track if order has manual fulfillment items
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS has_manual_fulfillment BOOLEAN NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.has_manual_fulfillment IS 'True if order contains at least one product with printify_product_id IS NULL (manual fulfillment required)';