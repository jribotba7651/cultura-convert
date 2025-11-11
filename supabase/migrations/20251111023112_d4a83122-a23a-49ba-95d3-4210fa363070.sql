-- Create table for resource metadata
CREATE TABLE public.consulting_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_es TEXT NOT NULL,
  description_en TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  download_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on consulting_resources
ALTER TABLE public.consulting_resources ENABLE ROW LEVEL SECURITY;

-- Everyone can view published resources
CREATE POLICY "Anyone can view consulting resources"
ON public.consulting_resources FOR SELECT
USING (true);

-- Only admins can manage resources
CREATE POLICY "Admins can insert consulting resources"
ON public.consulting_resources FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update consulting resources"
ON public.consulting_resources FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete consulting resources"
ON public.consulting_resources FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger to update updated_at
CREATE TRIGGER update_consulting_resources_updated_at
BEFORE UPDATE ON public.consulting_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for faster queries
CREATE INDEX idx_consulting_resources_display_order ON public.consulting_resources(display_order);
CREATE INDEX idx_consulting_resources_featured ON public.consulting_resources(is_featured);