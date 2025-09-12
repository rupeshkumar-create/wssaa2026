-- Fixed Admin Nomination Schema - Corrected SQL syntax
-- Run this in your Supabase SQL Editor

-- Create category_groups table
CREATE TABLE IF NOT EXISTS category_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_group_id TEXT REFERENCES category_groups(id),
  nomination_type TEXT DEFAULT 'both' CHECK (nomination_type IN ('person', 'company', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table for nomination control
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  nominations_open BOOLEAN DEFAULT true,
  voting_open BOOLEAN DEFAULT true,
  nomination_deadline TIMESTAMP WITH TIME ZONE,
  voting_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (nominations_open, voting_open) 
VALUES (true, true)
ON CONFLICT (id) DO NOTHING;

-- Insert default category groups
INSERT INTO category_groups (id, name, description) VALUES 
('staffing', 'Staffing & Recruiting', 'Awards for staffing and recruiting professionals'),
('technology', 'Technology & Innovation', 'Awards for technology and innovation in staffing'),
('leadership', 'Leadership & Management', 'Awards for outstanding leadership'),
('diversity', 'Diversity & Inclusion', 'Awards for diversity and inclusion initiatives'),
('client-service', 'Client Service Excellence', 'Awards for exceptional client service')
ON CONFLICT (id) DO NOTHING;

-- Insert default subcategories
INSERT INTO subcategories (id, name, description, category_group_id, nomination_type) VALUES 
-- Staffing categories
('best-staffing-firm', 'Best Staffing Firm', 'Outstanding staffing and recruiting companies', 'staffing', 'company'),
('best-recruiter', 'Best Recruiter', 'Top performing recruiters', 'staffing', 'person'),
('best-staffing-leader', 'Best Staffing Leader', 'Outstanding leadership in staffing', 'staffing', 'person'),
('rising-star-recruiter', 'Rising Star Recruiter', 'Emerging talent in recruiting', 'staffing', 'person'),
('best-boutique-firm', 'Best Boutique Staffing Firm', 'Excellence in specialized staffing', 'staffing', 'company'),
-- Technology categories
('best-staffing-tech', 'Best Staffing Technology', 'Innovation in staffing technology', 'technology', 'company'),
('digital-transformation', 'Digital Transformation Leader', 'Leading digital change in staffing', 'technology', 'person'),
-- Leadership categories
('ceo-of-the-year', 'CEO of the Year', 'Outstanding CEO leadership', 'leadership', 'person'),
('executive-of-the-year', 'Executive of the Year', 'Exceptional executive performance', 'leadership', 'person'),
-- Diversity categories
('diversity-champion', 'Diversity & Inclusion Champion', 'Promoting diversity in staffing', 'diversity', 'person'),
('inclusive-workplace', 'Most Inclusive Workplace', 'Creating inclusive work environments', 'diversity', 'company'),
-- Client Service categories
('client-service-excellence', 'Client Service Excellence', 'Outstanding client relationships', 'client-service', 'company'),
('account-manager-of-year', 'Account Manager of the Year', 'Exceptional account management', 'client-service', 'person')
ON CONFLICT (id) DO NOTHING;

-- Add additional_votes column if it doesn't exist
ALTER TABLE nominations ADD COLUMN IF NOT EXISTS additional_votes INTEGER DEFAULT 0;

-- Add manual_votes column if it doesn't exist (for admin vote adjustments)
ALTER TABLE nominations ADD COLUMN IF NOT EXISTS manual_votes INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nominations_state ON nominations(state);
CREATE INDEX IF NOT EXISTS idx_nominations_subcategory ON nominations(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_nominations_votes ON nominations(votes DESC, additional_votes DESC);
CREATE INDEX IF NOT EXISTS idx_nominees_type ON nominees(type);
CREATE INDEX IF NOT EXISTS idx_nominees_email ON nominees(person_email, company_email);

-- Enable RLS (Row Level Security)
ALTER TABLE category_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to category_groups" ON category_groups;
DROP POLICY IF EXISTS "Allow public read access to subcategories" ON subcategories;
DROP POLICY IF EXISTS "Allow public read access to settings" ON settings;
DROP POLICY IF EXISTS "Allow admin write access to category_groups" ON category_groups;
DROP POLICY IF EXISTS "Allow admin write access to subcategories" ON subcategories;
DROP POLICY IF EXISTS "Allow admin write access to settings" ON settings;

-- Create policies for public read access
CREATE POLICY "Allow public read access to category_groups" ON category_groups FOR SELECT USING (true);
CREATE POLICY "Allow public read access to subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to settings" ON settings FOR SELECT USING (true);

-- Create policies for admin write access
CREATE POLICY "Allow admin write access to category_groups" ON category_groups FOR ALL USING (true);
CREATE POLICY "Allow admin write access to subcategories" ON subcategories FOR ALL USING (true);
CREATE POLICY "Allow admin write access to settings" ON settings FOR ALL USING (true);