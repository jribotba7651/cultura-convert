CREATE OR REPLACE VIEW public.products_public
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
  created_at,
  updated_at
FROM public.products;

GRANT SELECT ON public.products_public TO anon, authenticated;
GRANT ALL ON public.products_public TO service_role;