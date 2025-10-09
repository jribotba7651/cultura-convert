-- Create analytics page views table
CREATE TABLE public.analytics_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  path TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_agent TEXT,
  device_type TEXT,
  referrer TEXT
);

-- Create index for faster queries
CREATE INDEX idx_analytics_created_at ON public.analytics_page_views(created_at DESC);
CREATE INDEX idx_analytics_path ON public.analytics_page_views(path);
CREATE INDEX idx_analytics_session ON public.analytics_page_views(session_id);

-- Enable RLS
ALTER TABLE public.analytics_page_views ENABLE ROW LEVEL SECURITY;

-- Service role only policy (all operations will be done via edge functions)
CREATE POLICY "Service role only: ALL operations on analytics"
ON public.analytics_page_views
FOR ALL
USING (current_setting('role'::text) = 'service_role'::text)
WITH CHECK (current_setting('role'::text) = 'service_role'::text);