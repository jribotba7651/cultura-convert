-- Add new columns to email_queue for structured payloads
ALTER TABLE public.email_queue
ADD COLUMN IF NOT EXISTS recipient_email text,
ADD COLUMN IF NOT EXISTS subject text,
ADD COLUMN IF NOT EXISTS payload jsonb,
ADD COLUMN IF NOT EXISTS provider text DEFAULT 'resend',
ADD COLUMN IF NOT EXISTS attempts integer DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.email_queue.recipient_email IS 'Email address of the recipient';
COMMENT ON COLUMN public.email_queue.subject IS 'Email subject line';
COMMENT ON COLUMN public.email_queue.payload IS 'Structured JSON payload for email content';
COMMENT ON COLUMN public.email_queue.provider IS 'Email provider (default: resend)';
COMMENT ON COLUMN public.email_queue.attempts IS 'Number of send attempts';
COMMENT ON COLUMN public.email_queue.error_message IS 'Error message from last failed attempt';