-- Create consulting_leads table for capturing lead information
CREATE TABLE public.consulting_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  company_size TEXT,
  industry TEXT,
  main_challenge TEXT,
  resource_downloaded TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_inquiries table for general consulting contact form
CREATE TABLE public.contact_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.consulting_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consulting_leads
CREATE POLICY "Service role can insert consulting leads"
ON public.consulting_leads
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Admins can view all consulting leads"
ON public.consulting_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update consulting leads"
ON public.consulting_leads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete consulting leads"
ON public.consulting_leads
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for contact_inquiries
CREATE POLICY "Service role can insert contact inquiries"
ON public.contact_inquiries
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Admins can view all contact inquiries"
ON public.contact_inquiries
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contact inquiries"
ON public.contact_inquiries
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates on consulting_leads
CREATE TRIGGER update_consulting_leads_updated_at
BEFORE UPDATE ON public.consulting_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_consulting_leads_email ON public.consulting_leads(email);
CREATE INDEX idx_consulting_leads_created_at ON public.consulting_leads(created_at DESC);
CREATE INDEX idx_contact_inquiries_created_at ON public.contact_inquiries(created_at DESC);