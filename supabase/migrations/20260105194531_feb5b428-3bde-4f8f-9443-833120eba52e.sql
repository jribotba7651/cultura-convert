-- Add unsubscribed_at field to book_waitlist table
ALTER TABLE public.book_waitlist
ADD COLUMN unsubscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient unsubscribe checks
CREATE INDEX idx_book_waitlist_unsubscribed ON public.book_waitlist(email) WHERE unsubscribed_at IS NOT NULL;