INSERT INTO public.products (
  id, title, description, price_cents, images, category_id, tags, is_active, printify_product_id, printify_data, variants
) VALUES (
  gen_random_uuid(),
  '{"es": "Las Siete Guardianas del Mar", "en": "The Seven Guardians of the Sea"}'::jsonb,
  '{"es": "A los quince años, Isabela del Mar pensaba que las almejas mágicas de su abuela eran solo cuentos. Hasta que encontró una con forma de corazón. Y latía. Una novela de realismo mágico juvenil que combina herencia taína, familia puertorriqueña y una magia que no salva sin cobrar.", "en": "At fifteen, Isabela del Mar thought her grandmother''s magical clams were just stories. Until she found one shaped like a heart. And it was beating. A young adult magical realism novel blending Taíno heritage and Puerto Rican family. (Spanish Edition)"}'::jsonb,
  1499,
  ARRAY[]::text[],
  'f480e8fd-522e-4737-ad39-d6202b13e860'::uuid,
  ARRAY['libro', 'book', 'ficción', 'fiction', 'realismo mágico', 'taíno', 'juvenil'],
  true,
  NULL,
  NULL,
  '[{"id": "paperback", "title": "Paperback", "price": 1499, "sku": "LSGDM-PB-001", "available": true}]'::jsonb
);