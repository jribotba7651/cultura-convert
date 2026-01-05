-- Add jsonb column for rich text content in Spanish
ALTER TABLE public.blog_posts 
ADD COLUMN content_json_es jsonb;