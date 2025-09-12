# Admin Nomination System Setup Guide

## Issue Found
The admin nomination system is failing because the database is missing required tables:
- `category_groups` 
- `subcategories`
- `settings`

## Quick Fix Required

### Step 1: Run SQL in Supabase Dashboard

Please go to your Supabase dashboard → SQL Editor and run this SQL:

```sql
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

-- Create settings table
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
INSERT INTO settings (nominations_open, voting_open) VALUES (true, true)
ON CONFLICT DO NOTHING;

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
('best-staffing-firm', 'Best Staffing Firm', 'Outstanding staffing and recruiting companies', 'staffing', 'company'),
('best-recruiter', 'Best Recruiter', 'Top performing recruiters', 'staffing', 'person'),
('best-staffing-leader', 'Best Staffing Leader', 'Outstanding leadership in staffing', 'staffing', 'person'),
('rising-star-recruiter', 'Rising Star Recruiter', 'Emerging talent in recruiting', 'staffing', 'person'),
('best-boutique-firm', 'Best Boutique Staffing Firm', 'Excellence in specialized staffing', 'staffing', 'company'),
('best-staffing-tech', 'Best Staffing Technology', 'Innovation in staffing technology', 'technology', 'company'),
('digital-transformation', 'Digital Transformation Leader', 'Leading digital change in staffing', 'technology', 'person'),
('ceo-of-the-year', 'CEO of the Year', 'Outstanding CEO leadership', 'leadership', 'person'),
('executive-of-the-year', 'Executive of the Year', 'Exceptional executive performance', 'leadership', 'person'),
('diversity-champion', 'Diversity & Inclusion Champion', 'Promoting diversity in staffing', 'diversity', 'person'),
('inclusive-workplace', 'Most Inclusive Workplace', 'Creating inclusive work environments', 'diversity', 'company'),
('client-service-excellence', 'Client Service Excellence', 'Outstanding client relationships', 'client-service', 'company'),
('account-manager-of-year', 'Account Manager of the Year', 'Exceptional account management', 'client-service', 'person')
ON CONFLICT (id) DO NOTHING;

-- Add missing columns to nominations table
ALTER TABLE nominations ADD COLUMN IF NOT EXISTS additional_votes INTEGER DEFAULT 0;
ALTER TABLE nominations ADD COLUMN IF NOT EXISTS manual_votes INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE category_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY IF NOT EXISTS "Allow public read access to category_groups" ON category_groups FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access to subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read access to settings" ON settings FOR SELECT USING (true);
```

### Step 2: Test the Fix

After running the SQL, test the admin nomination system:

```bash
node scripts/test-direct-admin-nomination.js
```

## What This Fixes

1. **Admin Nomination Form**: Will now load categories properly
2. **Rupesh Kumar Nomination**: Can be submitted without validation errors
3. **Vote Momentum**: Added `additional_votes` and `manual_votes` columns
4. **Category System**: Full category management for awards

## Next Steps

Once the schema is set up, I'll implement:
1. Remove "Search Nominees" title from hero section
2. Fix vote momentum calculation (real votes + manual votes)
3. Create Advanced Analytics dashboard for admin
4. Test the Rupesh Kumar nomination

Let me know when you've run the SQL and I'll continue with the other fixes!