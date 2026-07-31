ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_count integer DEFAULT NULL;

COMMENT ON COLUMN public.products.stock_count IS 'Manual inventory count for seller-shipped products. NULL = not tracked (no enforcement in the purchase flow).';

DROP VIEW IF EXISTS public.products_public;

CREATE VIEW public.products_public
WITH (security_invoker = on) AS
SELECT
  id,
  printify_product_id,
  title,
  description,
  category_id,
  images,
  variants,
  tags,
  price_cents,
  compare_at_price_cents,
  is_active,
  stock_count,
  created_at,
  updated_at
FROM public.products;

GRANT SELECT ON public.products_public TO anon;
GRANT SELECT ON public.products_public TO authenticated;
GRANT ALL ON public.products_public TO service_role;

CREATE POLICY "Admins can update product stock"
ON public.products
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT UPDATE (stock_count) ON public.products TO authenticated;