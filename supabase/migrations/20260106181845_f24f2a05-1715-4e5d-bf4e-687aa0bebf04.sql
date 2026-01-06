-- Insert 3 books as manual (non-Printify) products
-- Using printify_product_id = NULL to distinguish from Printify items

INSERT INTO public.products (
  id,
  title,
  description,
  price_cents,
  images,
  category_id,
  tags,
  is_active,
  printify_product_id,
  printify_data,
  variants
) VALUES
-- 1) Cartas de Newark
(
  gen_random_uuid(),
  '{"es": "Cartas de Newark", "en": "Letters from Newark"}'::jsonb,
  '{"es": "Una colección de cartas que capturan la experiencia puertorriqueña en Nueva Jersey. Fragmentos de nostalgia, amor y la sensación de no pertenecer completamente a ningún lugar pero pertenecer a todos.", "en": "A collection of letters capturing the Puerto Rican experience in New Jersey. Fragments of nostalgia, love, and the feeling of not fully belonging anywhere but belonging everywhere."}'::jsonb,
  1499,
  ARRAY['/assets/cartas-de-newark-cover.jpg'],
  'f480e8fd-522e-4737-ad39-d6202b13e860'::uuid,
  ARRAY['libro', 'book', 'ficción', 'fiction', 'puertorriqueño', 'diaspora', 'epistolar'],
  true,
  NULL,
  NULL,
  '[{"id": "paperback", "title": "Paperback", "price": 1499, "sku": "CDN-PB-001", "available": true}]'::jsonb
),
-- 2) Raíces en Tierra Ajena
(
  gen_random_uuid(),
  '{"es": "Raíces en Tierra Ajena", "en": "Roots in Foreign Land"}'::jsonb,
  '{"es": "Una historia poderosa sobre familia, supervivencia y esperanza en la América dividida de hoy. Una novela que cambiará cómo ves a tus vecinos.", "en": "A powerful story about family, survival, and hope in today''s divided America. A novel that will change how you see your neighbors."}'::jsonb,
  1599,
  ARRAY['/assets/raices-en-tierra-ajena-cover.jpg'],
  'f480e8fd-522e-4737-ad39-d6202b13e860'::uuid,
  ARRAY['libro', 'book', 'ficción', 'fiction', 'inmigración', 'immigration', 'familia'],
  true,
  NULL,
  NULL,
  '[{"id": "paperback", "title": "Paperback", "price": 1599, "sku": "RETA-PB-001", "available": true}]'::jsonb
),
-- 3) Jíbara en la Luna (Spanish Edition)
(
  gen_random_uuid(),
  '{"es": "JÍBARA EN LA LUNA: Transformando Desafíos en Oportunidades (22 Años de Liderazgo Consciente)", "en": "JÍBARA EN LA LUNA: Transforming Challenges into Opportunities (22 Years of Conscious Leadership)"}'::jsonb,
  '{"es": "¿Qué pasaría si una jíbara de Puerto Rico pudiera alcanzar la luna sin perder su esencia? 22 años de experiencia en liderazgo corporativo condensados en estrategias prácticas.", "en": "What would happen if a jíbara from Puerto Rico could reach the moon without losing her essence? 22 years of corporate leadership experience condensed into practical strategies."}'::jsonb,
  1899,
  ARRAY['/assets/jibara-en-la-luna-cover.jpg'],
  'f480e8fd-522e-4737-ad39-d6202b13e860'::uuid,
  ARRAY['libro', 'book', 'liderazgo', 'leadership', 'desarrollo profesional', 'professional development', 'mujeres', 'women'],
  true,
  NULL,
  NULL,
  '[{"id": "paperback", "title": "Paperback", "price": 1899, "sku": "JELA-PB-001", "available": true}]'::jsonb
);