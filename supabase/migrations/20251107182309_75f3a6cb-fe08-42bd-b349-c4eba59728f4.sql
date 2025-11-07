-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_es TEXT,
  excerpt_en TEXT,
  content_es TEXT NOT NULL,
  content_en TEXT NOT NULL,
  category_es TEXT NOT NULL,
  category_en TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  images JSONB DEFAULT '[]',
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Blog posts are viewable by everyone"
  ON public.blog_posts
  FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can view all blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert blog posts"
  ON public.blog_posts
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog posts"
  ON public.blog_posts
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog posts"
  ON public.blog_posts
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true);

-- Storage policies for blog-images bucket
CREATE POLICY "Blog images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-images' AND
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update blog images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'blog-images' AND
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete blog images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'blog-images' AND
    has_role(auth.uid(), 'admin')
  );

-- Trigger to update updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for better performance
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published);
CREATE INDEX idx_blog_posts_date ON public.blog_posts(date DESC);
CREATE INDEX idx_blog_posts_author ON public.blog_posts(author_id);