-- Add slug column to consulting_resources table
ALTER TABLE consulting_resources ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_consulting_resources_slug ON consulting_resources(slug);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title text) 
RETURNS text AS $$
DECLARE
  slug text;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  slug := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Remove leading/trailing hyphens
  slug := trim(both '-' from slug);
  -- Limit length
  slug := substring(slug from 1 for 100);
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Generate slugs for existing resources (using English title)
UPDATE consulting_resources 
SET slug = generate_slug(title_en)
WHERE slug IS NULL;

-- Make slug required for future inserts
ALTER TABLE consulting_resources ALTER COLUMN slug SET NOT NULL;