-- Fix blog posts with HTML in titles
-- Based on original Blogspot URLs:
-- 2025-04: por-que-no-regreso-mi-isla-el-corazon
-- 2021-06: los-jibaros-y-sus-andanzas
-- 2020-07: jibaros-en-la-pandemia-2020
-- 2019-06: los-jibaros-y-la-nueva-luna

UPDATE blog_posts 
SET 
  title_es = '¿Por Qué No Regreso a Mi Isla? El Corazón de un Jíbaro en la Diáspora',
  title_en = 'Why Don''t I Return to My Island? The Heart of a Jíbaro in the Diaspora',
  slug = '2025-04-por-que-no-regreso-mi-isla'
WHERE id = '3abd39e8-bf33-4ccd-9a81-f9e00633b749';

UPDATE blog_posts 
SET 
  title_es = 'Los Jíbaros y Sus Andanzas',
  title_en = 'The Jíbaros and Their Adventures',
  slug = '2021-06-los-jibaros-y-sus-andanzas'
WHERE id = 'cbab532e-e978-4b41-9353-63883ff153b9';

UPDATE blog_posts 
SET 
  title_es = 'Jíbaros en la Pandemia 2020',
  title_en = 'Jíbaros in the 2020 Pandemic',
  slug = '2020-07-jibaros-en-la-pandemia'
WHERE id = '86d31055-09dd-4b2c-b948-15467cc76af3';

UPDATE blog_posts 
SET 
  title_es = 'Los Jíbaros y la Nueva Luna',
  title_en = 'The Jíbaros and the New Moon',
  slug = '2019-06-los-jibaros-y-la-nueva-luna'
WHERE id = '5f236bf0-eca0-49b6-b2b4-84be1a4918ec';

-- Fix other titles that need improvement
UPDATE blog_posts 
SET 
  title_es = 'Una Proteína - Vivimos',
  title_en = 'A Protein - We Live',
  slug = '2016-06-una-proteina'
WHERE id = '1c39fd22-dde6-4015-8a64-5069ccc034ec';

UPDATE blog_posts 
SET 
  title_es = 'Aprender es Vivir - Ricardo Arjona',
  title_en = 'Learning is Living - Ricardo Arjona',
  slug = '2016-05-aprender-es-vivir'
WHERE id = 'e15e0e80-0c54-4698-9f53-4c6bb244418c';

UPDATE blog_posts 
SET 
  title_es = 'La Jíbara TekJob - Trabajo',
  title_en = 'The Jíbara TekJob - Work',
  slug = '2016-05-jibara-tekjob'
WHERE id = '78ada294-f0b4-4263-93d9-bab569b454f2';

UPDATE blog_posts 
SET 
  title_es = 'Una Jíbara y la Moda - Juncos, Puerto Rico',
  title_en = 'A Jíbara and Fashion - Juncos, Puerto Rico',
  slug = '2016-04-una-jibara-y-la-moda'
WHERE id = '85c9b481-801a-4674-8a88-db33dd02fa1b';