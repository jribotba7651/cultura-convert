-- Create book_waitlist table for waitlist signups
CREATE TABLE public.book_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'es')),
  book_slug TEXT NOT NULL,
  source_component TEXT NOT NULL CHECK (source_component IN ('hero', 'featured', 'grid', 'author', 'product', 'sample')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email, book_slug)
);

-- Enable RLS
ALTER TABLE public.book_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public waitlist)
CREATE POLICY "Anyone can join waitlist"
ON public.book_waitlist
FOR INSERT
WITH CHECK (true);

-- Admins can view all waitlist entries
CREATE POLICY "Admins can view waitlist"
ON public.book_waitlist
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create email_queue table for scheduled emails
CREATE TABLE public.email_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  waitlist_id UUID REFERENCES public.book_waitlist(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('welcome', 'followup')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can manage email queue
CREATE POLICY "Service role manages email queue"
ON public.email_queue
FOR ALL
USING (auth.role() = 'service_role');

-- Allow admins to view email queue
CREATE POLICY "Admins can view email queue"
ON public.email_queue
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create sample_downloads table to track sample chapter downloads
CREATE TABLE public.sample_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  book_slug TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'es')),
  download_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sample_downloads ENABLE ROW LEVEL SECURITY;

-- Allow inserts for sample requests
CREATE POLICY "Anyone can request sample"
ON public.sample_downloads
FOR INSERT
WITH CHECK (true);

-- Allow reading own sample download by token
CREATE POLICY "Can read by token"
ON public.sample_downloads
FOR SELECT
USING (true);

-- Create analytics_events table for custom events
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert events
CREATE POLICY "Anyone can track events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Admins can view events
CREATE POLICY "Admins can view events"
ON public.analytics_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for email queue processing
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_queue;