# Homepage Categories Setup Guide

## 🎯 Issue
The admin panel categories don't match the homepage categories. Need to update the database to use the exact categories shown on the homepage.

## 📋 Categories from Homepage

### **Role-Specific Excellence**
*Recognizing outstanding individual contributors*
- **Top Recruiter** (Person)
- **Top Executive Leader** (Person) 
- **Rising Star (Under 30)** (Person)
- **Top Staffing Influencer** (Person)
- **Best Sourcer** (Person)

### **Innovation & Technology**
*Leading the future of staffing technology*
- **Top AI-Driven Staffing Platform** (Company)
- **Top Digital Experience for Clients** (Company)

### **Culture & Impact**
*Making a positive difference in the industry*
- **Top Women-Led Staffing Firm** (Company)
- **Fastest Growing Staffing Firm** (Company)
- **Best Diversity & Inclusion Initiative** (Company)
- **Best Candidate Experience** (Company)

### **Growth & Performance**
*Excellence in operations and thought leadership*
- **Best Staffing Process at Scale** (Company)
- **Thought Leadership & Influence** (Person)
- **Best Recruitment Agency** (Company)
- **Best In-House Recruitment Team** (Company)

### **Geographic Excellence**
*Regional and global recognition*
- **Top Staffing Company - USA** (Company)
- **Top Staffing Company - Europe** (Company)
- **Top Global Recruiter** (Person)

### **Special Recognition**
*Unique contributions to the industry*
- **Special Recognition** (Both Person & Company)

## 🔧 Setup Steps

### Step 1: Update Database Schema
Run this SQL in your Supabase dashboard:

```sql
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
```

### Step 2: Test the Setup
After running the SQL, test the admin nomination system:

```bash
# Test the new categories
node scripts/test-homepage-categories-admin.js
```

### Step 3: Verify Admin Panel
1. Go to your admin panel: `http://localhost:3000/admin`
2. Click "Add New Nomination"
3. Verify you see all the homepage categories in the dropdown
4. Test submitting a nomination for "Top Recruiter"
5. Check that it appears in the "Nominations" tab

## 🎯 Expected Results

### Admin Nomination Form Will Show:
- **Role-Specific Excellence** group with 5 person categories
- **Innovation & Technology** group with 2 company categories  
- **Culture & Impact** group with 4 company categories
- **Growth & Performance** group with 4 mixed categories
- **Geographic Excellence** group with 3 mixed categories
- **Special Recognition** group with 1 flexible category

### Nominations Will:
- ✅ Submit successfully through admin panel
- ✅ Appear in the "Nominations" tab for approval
- ✅ Show correct category names and groups
- ✅ Support both person and company nominations as specified
- ✅ Work with the existing vote momentum system

## 🧪 Test Cases

### Test "Top Recruiter" Nomination:
- **Type**: Person
- **Category**: Role-Specific Excellence → Top Recruiter
- **Required Fields**: First Name, Last Name, Job Title, Email, Why Vote
- **Optional Fields**: Headshot (for admin nominations)

### Test "Top AI-Driven Staffing Platform" Nomination:
- **Type**: Company  
- **Category**: Innovation & Technology → Top AI-Driven Staffing Platform
- **Required Fields**: Company Name, Website, Why Vote
- **Optional Fields**: Logo (for admin nominations)

## 🚀 Benefits

1. **Consistency**: Admin panel matches homepage exactly
2. **User Experience**: Clear, organized category structure
3. **Flexibility**: Supports both person and company nominations
4. **Scalability**: Easy to add new categories in the future
5. **Professional**: Matches the award structure shown publicly

## ✅ Verification Checklist

- [ ] SQL schema updated in Supabase
- [ ] Admin panel shows new categories
- [ ] "Top Recruiter" nomination works
- [ ] Nominations appear in admin "Nominations" tab
- [ ] Categories API returns correct data
- [ ] Homepage categories match admin categories exactly

Run the test script to verify everything is working correctly!