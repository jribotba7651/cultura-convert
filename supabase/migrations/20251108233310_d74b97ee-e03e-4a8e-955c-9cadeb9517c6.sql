-- Create newsletter_subscriptions table
CREATE TABLE public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  interests TEXT[] NOT NULL DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'es',
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on email
CREATE UNIQUE INDEX newsletter_subscriptions_email_idx ON public.newsletter_subscriptions(email);

-- Enable RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all newsletter subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Service role can insert subscriptions (from edge function)
CREATE POLICY "Service role can insert newsletter subscriptions"
ON public.newsletter_subscriptions
FOR INSERT
WITH CHECK (current_setting('role') = 'service_role');

-- Admins can update subscriptions (to unsubscribe users, etc.)
CREATE POLICY "Admins can update newsletter subscriptions"
ON public.newsletter_subscriptions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete subscriptions
CREATE POLICY "Admins can delete newsletter subscriptions"
ON public.newsletter_subscriptions
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_newsletter_subscriptions_updated_at
BEFORE UPDATE ON public.newsletter_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();