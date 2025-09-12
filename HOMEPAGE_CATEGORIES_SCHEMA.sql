-- Updated Schema with Exact Categories from Home Page
-- Run this in your Supabase SQL Editor

-- First, clear existing categories to avoid conflicts
DELETE FROM subcategories;
DELETE FROM category_groups;

-- Insert the exact category groups from home page
INSERT INTO category_groups (id, name, description) VALUES 
('role-specific-excellence', 'Role-Specific Excellence', 'Recognizing outstanding individual contributors'),
('innovation-technology', 'Innovation & Technology', 'Leading the future of staffing technology'),
('culture-impact', 'Culture & Impact', 'Making a positive difference in the industry'),
('growth-performance', 'Growth & Performance', 'Excellence in operations and thought leadership'),
('geographic-excellence', 'Geographic Excellence', 'Regional and global recognition'),
('special-recognition', 'Special Recognition', 'Unique contributions to the industry')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Insert the exact subcategories from home page
INSERT INTO subcategories (id, name, description, category_group_id, nomination_type) VALUES 
-- Role-Specific Excellence
('top-recruiter', 'Top Recruiter', 'Outstanding individual recruiter performance', 'role-specific-excellence', 'person'),
('top-executive-leader', 'Top Executive Leader', 'Exceptional leadership in staffing industry', 'role-specific-excellence', 'person'),
('rising-star-under-30', 'Rising Star (Under 30)', 'Emerging talent under 30 years old', 'role-specific-excellence', 'person'),
('top-staffing-influencer', 'Top Staffing Influencer', 'Leading voice and influence in staffing', 'role-specific-excellence', 'person'),
('best-sourcer', 'Best Sourcer', 'Excellence in talent sourcing', 'role-specific-excellence', 'person'),

-- Innovation & Technology
('top-ai-driven-staffing-platform', 'Top AI-Driven Staffing Platform', 'Leading AI technology in staffing', 'innovation-technology', 'company'),
('top-digital-experience-for-clients', 'Top Digital Experience for Clients', 'Best client digital experience', 'innovation-technology', 'company'),

-- Culture & Impact
('top-women-led-staffing-firm', 'Top Women-Led Staffing Firm', 'Excellence in women-led organizations', 'culture-impact', 'company'),
('fastest-growing-staffing-firm', 'Fastest Growing Staffing Firm', 'Rapid growth and expansion', 'culture-impact', 'company'),
('best-diversity-inclusion-initiative', 'Best Diversity & Inclusion Initiative', 'Outstanding D&I programs', 'culture-impact', 'company'),
('best-candidate-experience', 'Best Candidate Experience', 'Exceptional candidate journey', 'culture-impact', 'company'),

-- Growth & Performance
('best-staffing-process-at-scale', 'Best Staffing Process at Scale', 'Scalable staffing operations', 'growth-performance', 'company'),
('thought-leadership-influence', 'Thought Leadership & Influence', 'Industry thought leadership', 'growth-performance', 'person'),
('best-recruitment-agency', 'Best Recruitment Agency', 'Top performing recruitment agency', 'growth-performance', 'company'),
('best-in-house-recruitment-team', 'Best In-House Recruitment Team', 'Excellence in internal recruiting', 'growth-performance', 'company'),

-- Geographic Excellence
('top-staffing-company-usa', 'Top Staffing Company - USA', 'Leading staffing company in USA', 'geographic-excellence', 'company'),
('top-staffing-company-europe', 'Top Staffing Company - Europe', 'Leading staffing company in Europe', 'geographic-excellence', 'company'),
('top-global-recruiter', 'Top Global Recruiter', 'Excellence in global recruiting', 'geographic-excellence', 'person'),

-- Special Recognition
('special-recognition', 'Special Recognition', 'Unique contributions to the industry', 'special-recognition', 'both')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category_group_id = EXCLUDED.category_group_id,
  nomination_type = EXCLUDED.nomination_type;