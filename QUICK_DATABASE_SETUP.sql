-- Quick Database Setup for Categories
-- Copy and paste this into your Supabase SQL Editor and run it

-- 1. Create category_groups table
CREATE TABLE IF NOT EXISTS public.category_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create subcategories table
CREATE TABLE IF NOT EXISTS public.subcategories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_group_id TEXT NOT NULL REFERENCES public.category_groups(id),
  nomination_type TEXT CHECK (nomination_type IN ('person', 'company', 'both')) DEFAULT 'both',
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.category_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies (allow public read access)
DROP POLICY IF EXISTS "Allow public read access to category_groups" ON public.category_groups;
CREATE POLICY "Allow public read access to category_groups" ON public.category_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to subcategories" ON public.subcategories;
CREATE POLICY "Allow public read access to subcategories" ON public.subcategories FOR SELECT USING (true);

-- 5. Insert category groups
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

-- 6. Insert subcategories
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

-- 7. Add nomination_source tracking to nominations table (if it exists)
DO $$ 
BEGIN
  -- Check if nominations table exists and add columns if needed
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'nominations') THEN
    -- Add nomination_source column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'nominations' AND column_name = 'nomination_source') THEN
      ALTER TABLE public.nominations ADD COLUMN nomination_source TEXT DEFAULT 'public' CHECK (nomination_source IN ('admin', 'public'));
      CREATE INDEX IF NOT EXISTS idx_nominations_source ON public.nominations(nomination_source);
    END IF;
    
    -- Add additional_votes column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'nominations' AND column_name = 'additional_votes') THEN
      ALTER TABLE public.nominations ADD COLUMN additional_votes INTEGER DEFAULT 0;
      CREATE INDEX IF NOT EXISTS idx_nominations_additional_votes ON public.nominations(additional_votes);
    END IF;
  END IF;
END $$;

-- 8. Verification query
SELECT 'Category Groups' as table_name, count(*) as count FROM public.category_groups
UNION ALL
SELECT 'Subcategories' as table_name, count(*) as count FROM public.subcategories;

-- Expected results: Category Groups: 6, Subcategories: 18