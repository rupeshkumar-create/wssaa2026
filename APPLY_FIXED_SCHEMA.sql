-- Quick command to apply the fixed schema
-- Copy and paste this into your Supabase SQL editor

-- 1. Add voting control settings to system_settings
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES 
  ('voting_start_date', '', 'Date when voting opens (ISO format). Empty means voting is closed.'),
  ('voting_end_date', '', 'Date when voting closes (ISO format). Empty means no end date.'),
  ('nominations_enabled', 'true', 'Controls whether public nominations are open or closed'),
  ('admin_nominations_enabled', 'true', 'Controls whether admin can add nominations (always enabled)')
ON CONFLICT (setting_key) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = NOW();

-- 2. Drop existing admin_nominations view if it exists
DROP VIEW IF EXISTS public.admin_nominations CASCADE;

-- 3. Create admin_nominations table for admin-only nominations
CREATE TABLE IF NOT EXISTS public.admin_nominations_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('person', 'company')),
  subcategory_id TEXT NOT NULL,
  category_group_id TEXT NOT NULL,
  
  -- Person fields
  firstname TEXT,
  lastname TEXT,
  jobtitle TEXT,
  person_email TEXT,
  person_linkedin TEXT,
  person_phone TEXT,
  person_company TEXT,
  person_country TEXT,
  headshot_url TEXT,
  why_me TEXT,
  
  -- Company fields
  company_name TEXT,
  company_website TEXT,
  company_linkedin TEXT,
  company_email TEXT,
  company_phone TEXT,
  company_country TEXT,
  logo_url TEXT,
  why_us TEXT,
  
  -- Shared fields
  live_url TEXT,
  image_url TEXT,
  display_name TEXT,
  votes INTEGER DEFAULT 0,
  additional_votes INTEGER DEFAULT 0,
  
  -- Admin metadata
  created_by TEXT DEFAULT 'admin',
  admin_notes TEXT,
  state TEXT DEFAULT 'approved' CHECK (state IN ('approved', 'draft')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create function to auto-generate live URLs for admin nominations
CREATE OR REPLACE FUNCTION generate_admin_nomination_live_url()
RETURNS TRIGGER AS $$
DECLARE
  base_name TEXT;
  clean_name TEXT;
  counter INTEGER := 0;
  final_url TEXT;
BEGIN
  -- Get the base name for URL generation
  IF NEW.type = 'person' THEN
    base_name := COALESCE(NEW.firstname || '-' || NEW.lastname, 'nominee');
  ELSE
    base_name := COALESCE(NEW.company_name, 'company');
  END IF;
  
  -- Clean the name for URL
  clean_name := lower(regexp_replace(base_name, '[^a-zA-Z0-9\s-]', '', 'g'));
  clean_name := regexp_replace(clean_name, '\s+', '-', 'g');
  clean_name := regexp_replace(clean_name, '-+', '-', 'g');
  clean_name := trim(both '-' from clean_name);
  
  -- Ensure uniqueness by checking existing URLs
  final_url := clean_name;
  WHILE EXISTS (
    SELECT 1 FROM public.nominations WHERE live_url = final_url
    UNION
    SELECT 1 FROM public.admin_nominations_table WHERE live_url = final_url AND id != NEW.id
  ) LOOP
    counter := counter + 1;
    final_url := clean_name || '-' || counter;
  END LOOP;
  
  NEW.live_url := final_url;
  
  -- Set display name if not provided
  IF NEW.display_name IS NULL THEN
    IF NEW.type = 'person' THEN
      NEW.display_name := COALESCE(NEW.firstname || ' ' || NEW.lastname, 'Nominee');
    ELSE
      NEW.display_name := COALESCE(NEW.company_name, 'Company');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger for admin nominations
DROP TRIGGER IF EXISTS generate_admin_nomination_live_url_trigger ON public.admin_nominations_table;
CREATE TRIGGER generate_admin_nomination_live_url_trigger
  BEFORE INSERT OR UPDATE ON public.admin_nominations_table
  FOR EACH ROW
  EXECUTE FUNCTION generate_admin_nomination_live_url();

-- 6. Create updated timestamp trigger for admin nominations
CREATE OR REPLACE FUNCTION update_admin_nominations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_nominations_timestamp_trigger ON public.admin_nominations_table;
CREATE TRIGGER update_admin_nominations_timestamp_trigger
  BEFORE UPDATE ON public.admin_nominations_table
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_nominations_timestamp();

-- 7. Create admin_nominations view for backward compatibility
CREATE VIEW public.admin_nominations AS
SELECT * FROM public.admin_nominations_table;

-- 8. Create unified view for all nominees (regular + admin)
CREATE OR REPLACE VIEW public.all_nominees AS
SELECT 
  id,
  type,
  subcategory_id,
  category_group_id,
  firstname,
  lastname,
  jobtitle,
  person_email as email,
  person_linkedin as linkedin,
  person_phone as phone,
  person_company as company,
  person_country as country,
  headshot_url,
  why_me,
  company_name,
  company_website,
  company_linkedin,
  company_email,
  company_phone,
  company_country,
  logo_url,
  why_us,
  live_url,
  image_url,
  display_name,
  votes,
  additional_votes,
  (votes + COALESCE(additional_votes, 0)) as total_votes,
  state,
  created_at,
  updated_at,
  'regular' as source
FROM public.nominations
WHERE state = 'approved'

UNION ALL

SELECT 
  id,
  type,
  subcategory_id,
  category_group_id,
  firstname,
  lastname,
  jobtitle,
  person_email as email,
  person_linkedin as linkedin,
  person_phone as phone,
  person_company as company,
  person_country as country,
  headshot_url,
  why_me,
  company_name,
  company_website,
  company_linkedin,
  company_email,
  company_phone,
  company_country,
  logo_url,
  why_us,
  live_url,
  image_url,
  display_name,
  votes,
  additional_votes,
  (votes + COALESCE(additional_votes, 0)) as total_votes,
  state,
  created_at,
  updated_at,
  'admin' as source
FROM public.admin_nominations_table
WHERE state = 'approved';

-- 9. Grant permissions
GRANT SELECT ON public.admin_nominations_table TO authenticated;
GRANT SELECT ON public.admin_nominations_table TO anon;
GRANT ALL ON public.admin_nominations_table TO service_role;

GRANT SELECT ON public.admin_nominations TO authenticated;
GRANT SELECT ON public.admin_nominations TO anon;

GRANT SELECT ON public.all_nominees TO authenticated;
GRANT SELECT ON public.all_nominees TO anon;

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_nominations_table_type ON public.admin_nominations_table(type);
CREATE INDEX IF NOT EXISTS idx_admin_nominations_table_subcategory ON public.admin_nominations_table(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_admin_nominations_table_state ON public.admin_nominations_table(state);
CREATE INDEX IF NOT EXISTS idx_admin_nominations_table_live_url ON public.admin_nominations_table(live_url);
CREATE INDEX IF NOT EXISTS idx_admin_nominations_table_created_at ON public.admin_nominations_table(created_at);