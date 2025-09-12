-- Copy and paste this entire block into your Supabase SQL editor

-- 1. Add voting control settings
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES 
  ('voting_start_date', '', 'Date when voting opens (ISO format). Empty means voting is closed.'),
  ('voting_end_date', '', 'Date when voting closes (ISO format). Empty means no end date.'),
  ('nominations_enabled', 'true', 'Controls whether public nominations are open or closed'),
  ('admin_nominations_enabled', 'true', 'Controls whether admin can add nominations (always enabled)')
ON CONFLICT (setting_key) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = NOW();

-- 2. Create admin nominations table
CREATE TABLE IF NOT EXISTS public.admin_nominations_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomination_type TEXT NOT NULL CHECK (nomination_type IN ('person', 'company')),
  subcategory_id TEXT NOT NULL,
  category_group_id TEXT NOT NULL,
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
  company_name TEXT,
  company_website TEXT,
  company_linkedin TEXT,
  company_email TEXT,
  company_phone TEXT,
  company_country TEXT,
  logo_url TEXT,
  why_us TEXT,
  live_url TEXT UNIQUE,
  image_url TEXT,
  display_name TEXT,
  votes INTEGER DEFAULT 0,
  additional_votes INTEGER DEFAULT 0,
  created_by TEXT DEFAULT 'admin',
  admin_notes TEXT,
  state TEXT DEFAULT 'approved' CHECK (state IN ('approved', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create URL generation function
CREATE OR REPLACE FUNCTION generate_admin_nomination_live_url()
RETURNS TRIGGER AS $$
DECLARE
  base_name TEXT;
  clean_name TEXT;
  counter INTEGER := 0;
  final_url TEXT;
BEGIN
  IF NEW.nomination_type = 'person' THEN
    base_name := COALESCE(NEW.firstname || '-' || NEW.lastname, 'nominee');
  ELSE
    base_name := COALESCE(NEW.company_name, 'company');
  END IF;
  
  clean_name := lower(regexp_replace(base_name, '[^a-zA-Z0-9\s-]', '', 'g'));
  clean_name := regexp_replace(clean_name, '\s+', '-', 'g');
  clean_name := regexp_replace(clean_name, '-+', '-', 'g');
  clean_name := trim(both '-' from clean_name);
  
  final_url := clean_name;
  WHILE EXISTS (
    SELECT 1 FROM public.nominees WHERE live_url = final_url
    UNION
    SELECT 1 FROM public.admin_nominations_table WHERE live_url = final_url AND id != NEW.id
  ) LOOP
    counter := counter + 1;
    final_url := clean_name || '-' || counter;
  END LOOP;
  
  NEW.live_url := final_url;
  
  IF NEW.display_name IS NULL THEN
    IF NEW.nomination_type = 'person' THEN
      NEW.display_name := COALESCE(NEW.firstname || ' ' || NEW.lastname, 'Nominee');
    ELSE
      NEW.display_name := COALESCE(NEW.company_name, 'Company');
    END IF;
  END IF;
  
  IF NEW.nomination_type = 'person' THEN
    NEW.image_url := NEW.headshot_url;
  ELSE
    NEW.image_url := NEW.logo_url;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create triggers
DROP TRIGGER IF EXISTS generate_admin_nomination_live_url_trigger ON public.admin_nominations_table;
CREATE TRIGGER generate_admin_nomination_live_url_trigger
  BEFORE INSERT OR UPDATE ON public.admin_nominations_table
  FOR EACH ROW
  EXECUTE FUNCTION generate_admin_nomination_live_url();

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

-- 5. Grant permissions
GRANT SELECT ON public.admin_nominations_table TO authenticated;
GRANT SELECT ON public.admin_nominations_table TO anon;
GRANT ALL ON public.admin_nominations_table TO service_role;

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_nominations_table_type ON public.admin_nominations_table(nomination_type);
CREATE INDEX IF NOT EXISTS idx_admin_nominations_table_subcategory ON public.admin_nominations_table(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_admin_nominations_table_state ON public.admin_nominations_table(state);
CREATE INDEX IF NOT EXISTS idx_admin_nominations_table_live_url ON public.admin_nominations_table(live_url);
CREATE INDEX IF NOT EXISTS idx_admin_nominations_table_created_at ON public.admin_nominations_table(created_at);