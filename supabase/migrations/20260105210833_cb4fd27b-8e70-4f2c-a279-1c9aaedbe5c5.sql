-- Add jsonb column for rich text content in English
ALTER TABLE public.blog_posts 
ADD COLUMN content_json_en jsonb;