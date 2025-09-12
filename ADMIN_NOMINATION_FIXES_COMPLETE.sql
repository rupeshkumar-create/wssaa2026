-- Admin Nomination Fixes - Complete Implementation
-- This script creates category tables and fixes admin nomination functionality

-- 1. Create category tables if they don't exist
CREATE TABLE IF NOT EXISTS public.category_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subcategories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_group_id TEXT NOT NULL REFERENCES public.category_groups(id),
  nomination_type TEXT CHECK (nomination_type IN ('person', 'company', 'both')) DEFAULT 'both',
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Insert category groups
INSERT INTO public.category_groups (id, name, description, display_order) VALUES
('role-specific-excellence', 'Role-Specific Excellence', 'Recognizing outstanding individual contributors', 1),
('innovation-technology', 'Innovation & Technology', 'Leading the future of staffing technology', 2),
('culture-impact', 'Culture & Impact', 'Making a positive difference in the industry', 3),
('growth-performance', 'Growth & Performance', 'Excellence in operations and thought leadership', 4),
('geographic-excellence', 'Geographic Excellence', 'Regional and global recognition', 5),
('special-recognition', 'Special Recognition', 'Unique contributions to the industry', 6)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- 3. Insert subcategories
INSERT INTO public.subcategories (id, name, category_group_id, nomination_type, display_order) VALUES
-- Role-Specific Excellence
('top-recruiter', 'Top Recruiter', 'role-specific-excellence', 'person', 1),
('top-executive-leader', 'Top Executive Leader', 'role-specific-excellence', 'person', 2),
('rising-star-under-30', 'Rising Star (Under 30)', 'role-specific-excellence', 'person', 3),
('top-staffing-influencer', 'Top Staffing Influencer', 'role-specific-excellence', 'person', 4),
('best-sourcer', 'Best Sourcer', 'role-specific-excellence', 'person', 5),

-- Innovation & Technology
('top-ai-driven-staffing-platform', 'Top AI-Driven Staffing Platform', 'innovation-technology', 'company', 1),
('top-digital-experience-for-clients', 'Top Digital Experience for Clients', 'innovation-technology', 'company', 2),

-- Culture & Impact
('top-women-led-staffing-firm', 'Top Women-Led Staffing Firm', 'culture-impact', 'company', 1),
('fastest-growing-staffing-firm', 'Fastest Growing Staffing Firm', 'culture-impact', 'company', 2),
('best-diversity-inclusion-initiative', 'Best Diversity & Inclusion Initiative', 'culture-impact', 'company', 3),
('best-candidate-experience', 'Best Candidate Experience', 'culture-impact', 'company', 4),

-- Growth & Performance
('best-staffing-process-at-scale', 'Best Staffing Process at Scale', 'growth-performance', 'company', 1),
('thought-leadership-and-influence', 'Thought Leadership & Influence', 'growth-performance', 'person', 2),
('best-recruitment-agency', 'Best Recruitment Agency', 'growth-performance', 'company', 3),
('best-in-house-recruitment-team', 'Best In-House Recruitment Team', 'growth-performance', 'company', 4),

-- Geographic Excellence
('top-staffing-company-usa', 'Top Staffing Company - USA', 'geographic-excellence', 'company', 1),
('top-staffing-company-europe', 'Top Staffing Company - Europe', 'geographic-excellence', 'company', 2),
('top-global-recruiter', 'Top Global Recruiter', 'geographic-excellence', 'person', 3),

-- Special Recognition
('special-recognition', 'Special Recognition', 'special-recognition', 'both', 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category_group_id = EXCLUDED.category_group_id,
  nomination_type = EXCLUDED.nomination_type,
  display_order = EXCLUDED.display_order;

-- 4. Create settings table for nomination control
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  nominations_open BOOLEAN NOT NULL DEFAULT true,
  voting_open BOOLEAN NOT NULL DEFAULT true,
  nomination_deadline TIMESTAMPTZ,
  voting_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.settings (id, nominations_open, voting_open) VALUES
('main', true, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Create admin_nominations table for draft nominations
CREATE TABLE IF NOT EXISTS public.admin_nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomination_type TEXT NOT NULL CHECK (nomination_type IN ('person', 'company')),
  subcategory_id TEXT NOT NULL REFERENCES public.subcategories(id),
  category_group_id TEXT NOT NULL REFERENCES public.category_groups(id),
  
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
  bio TEXT,
  achievements TEXT,
  
  -- Company fields
  company_name TEXT,
  company_website TEXT,
  company_linkedin TEXT,
  company_email TEXT,
  company_phone TEXT,
  company_country TEXT,
  company_size TEXT,
  company_industry TEXT,
  logo_url TEXT,
  why_us TEXT,
  
  -- Admin fields
  admin_notes TEXT,
  state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft', 'approved', 'rejected')),
  created_by TEXT DEFAULT 'admin',
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT admin_nomination_person_required CHECK (
    nomination_type != 'person' OR (firstname IS NOT NULL AND lastname IS NOT NULL AND person_email IS NOT NULL)
  ),
  CONSTRAINT admin_nomination_company_required CHECK (
    nomination_type != 'company' OR (company_name IS NOT NULL AND company_website IS NOT NULL)
  )
);

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_nominations_state ON public.admin_nominations(state);
CREATE INDEX IF NOT EXISTS idx_admin_nominations_subcategory ON public.admin_nominations(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_admin_nominations_created ON public.admin_nominations(created_at);

-- 7. Create Loops outbox table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.loops_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('nomination_submitted','nomination_approved','vote_cast','nominee_approved')),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','done','dead')),
  attempt_count INT NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loops_outbox_status_created ON public.loops_outbox(status, created_at);

-- 8. Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_admin_nominations ON public.admin_nominations;
CREATE TRIGGER set_updated_at_admin_nominations 
  BEFORE UPDATE ON public.admin_nominations
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_settings ON public.settings;
CREATE TRIGGER set_updated_at_settings 
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- 9. Enable RLS
ALTER TABLE public.category_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories
DROP POLICY IF EXISTS "Allow public read access to category_groups" ON public.category_groups;
CREATE POLICY "Allow public read access to category_groups" ON public.category_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to subcategories" ON public.subcategories;
CREATE POLICY "Allow public read access to subcategories" ON public.subcategories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to settings" ON public.settings;
CREATE POLICY "Allow public read access to settings" ON public.settings FOR SELECT USING (true);

-- Service role can do everything (admin operations)
DROP POLICY IF EXISTS "Service role can manage admin_nominations" ON public.admin_nominations;
CREATE POLICY "Service role can manage admin_nominations" ON public.admin_nominations FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role can manage settings" ON public.settings;
CREATE POLICY "Service role can manage settings" ON public.settings FOR ALL USING (true);

COMMENT ON TABLE public.category_groups IS 'Main category groups for organizing nominations';
COMMENT ON TABLE public.subcategories IS 'Specific award categories within groups';
COMMENT ON TABLE public.admin_nominations IS 'Draft nominations created by admin, pending approval';
COMMENT ON TABLE public.settings IS 'Global application settings for nomination and voting control';