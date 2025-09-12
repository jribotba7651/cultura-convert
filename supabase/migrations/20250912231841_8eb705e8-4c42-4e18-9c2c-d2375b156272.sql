-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Reduce guest order token expiration and add rotation capability
ALTER TABLE public.order_access_tokens 
ALTER COLUMN expires_at SET DEFAULT (now() + interval '48 hours');

-- Add rate limiting table for order access attempts
CREATE TABLE public.order_access_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  order_id UUID NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  first_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on access attempts
ALTER TABLE public.order_access_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can manage access attempts
CREATE POLICY "Service role can manage access attempts" 
ON public.order_access_attempts 
FOR ALL 
USING (current_setting('role') = 'service_role');

-- Function to check and update rate limiting
CREATE OR REPLACE FUNCTION public.check_order_access_rate_limit(p_ip_address INET, p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  attempt_record RECORD;
  max_attempts INTEGER := 3;
  block_duration INTERVAL := '1 hour';
BEGIN
  -- Clean up old attempts (older than 1 hour)
  DELETE FROM public.order_access_attempts 
  WHERE first_attempt_at < now() - block_duration;
  
  -- Check existing attempts for this IP and order
  SELECT * INTO attempt_record
  FROM public.order_access_attempts
  WHERE ip_address = p_ip_address AND order_id = p_order_id;
  
  -- If blocked, check if block period has expired
  IF attempt_record.blocked_until IS NOT NULL THEN
    IF attempt_record.blocked_until > now() THEN
      RETURN FALSE; -- Still blocked
    ELSE
      -- Block expired, reset attempts
      DELETE FROM public.order_access_attempts 
      WHERE ip_address = p_ip_address AND order_id = p_order_id;
      RETURN TRUE;
    END IF;
  END IF;
  
  -- If no record exists, allow access
  IF attempt_record IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- If under the limit, allow access
  IF attempt_record.attempt_count < max_attempts THEN
    RETURN TRUE;
  END IF;
  
  -- Over the limit, block access
  UPDATE public.order_access_attempts
  SET blocked_until = now() + block_duration
  WHERE ip_address = p_ip_address AND order_id = p_order_id;
  
  RETURN FALSE;
END;
$$;

-- Function to record access attempt
CREATE OR REPLACE FUNCTION public.record_order_access_attempt(p_ip_address INET, p_order_id UUID, p_success BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only record failed attempts for rate limiting
  IF NOT p_success THEN
    INSERT INTO public.order_access_attempts (ip_address, order_id)
    VALUES (p_ip_address, p_order_id)
    ON CONFLICT (ip_address, order_id) 
    DO UPDATE SET 
      attempt_count = order_access_attempts.attempt_count + 1,
      last_attempt_at = now();
  END IF;
END;
$$;