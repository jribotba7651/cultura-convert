-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule send-cancellation-email to run every minute
-- NOTE: After running this migration, you must manually set the CRON_SECRET in Vault:
-- 
-- 1. Go to Supabase Dashboard > Settings > Vault
-- 2. Create a new secret named 'cron_secret' with your CRON_SECRET value
-- 3. OR run this SQL (replace YOUR_CRON_SECRET_VALUE):
--    INSERT INTO vault.secrets (name, secret) VALUES ('cron_secret', 'YOUR_CRON_SECRET_VALUE');
--
-- The cron job will read the secret from Vault at runtime.

SELECT cron.schedule(
  'send-cancellation-emails-every-minute',
  '* * * * *', -- every minute
  $$
  SELECT net.http_post(
    url := 'https://ifctpzrmqcpqtgwepvoq.supabase.co/functions/v1/send-cancellation-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Add comment for documentation
COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL - used for send-cancellation-email cron';
