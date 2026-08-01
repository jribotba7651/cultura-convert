-- 1. Normalize book cover image paths to public/book-covers (served correctly in production)
UPDATE public.products SET images = ARRAY['/book-covers/cartas-de-newark-cover.jpg']
  WHERE id IN ('f704387c-08c6-4177-a8a3-ff35018eacd9','cf374f84-a61b-425b-8003-60ebf506a780');

UPDATE public.products SET images = ARRAY['/book-covers/raices-en-tierra-ajena-cover.jpg']
  WHERE id IN ('2eb33c81-0056-4907-aea7-584b22fdfe2d','8c41ab87-8d33-44bb-a590-b422093ec555');

UPDATE public.products SET images = ARRAY['/book-covers/jibara-en-la-luna-cover.jpg']
  WHERE id IN ('bcff5050-24b2-4006-afc3-6686b025b6c1','e928cd74-3ecf-4478-bd80-acde162f99f2');

UPDATE public.products SET images = ARRAY['/book-covers/sal-en-la-sangre-cover.jpg']
  WHERE id = 'cba9c05d-a98d-4268-b8a0-6fb479bf8f36';

UPDATE public.products SET images = ARRAY['/book-covers/sofia-marie-paloma-cover.jpg']
  WHERE id = '1f3f37bb-0cef-4f96-9048-805293675cac';

-- 2. Deduplicate "Las Siete Guardianas del Mar": keep the oldest row, drop unreferenced duplicates
WITH ranked AS (
  SELECT id, row_number() OVER (ORDER BY created_at ASC) AS rn
  FROM public.products
  WHERE title->>'es' = 'Las Siete Guardianas del Mar'
)
DELETE FROM public.products p
USING ranked r
WHERE p.id = r.id
  AND r.rn > 1
  AND NOT EXISTS (SELECT 1 FROM public.order_items oi WHERE oi.product_id = p.id);

-- 3. Give the surviving Guardianas row its cover image
UPDATE public.products
SET images = ARRAY['/book-covers/las-siete-guardianas-del-mar-cover.jpg']
WHERE title->>'es' = 'Las Siete Guardianas del Mar';