-- Add nomination_source field to track admin vs public nominations
-- This allows us to show "Added by Admin" in the admin panel

-- Add the column to nominations table
ALTER TABLE nominations 
ADD COLUMN IF NOT EXISTS nomination_source TEXT DEFAULT 'public' CHECK (nomination_source IN ('public', 'admin'));

-- Update existing nominations to have 'public' source
UPDATE nominations 
SET nomination_source = 'public' 
WHERE nomination_source IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_nominations_source ON nominations(nomination_source);

-- Update the admin_nominations view to include nomination_source
DROP VIEW IF EXISTS admin_nominations;

CREATE VIEW admin_nominations AS
SELECT 
  -- Nomination data
  n.id as nomination_id,
  n.state,
  n.votes,
  n.additional_votes,
  n.created_at,
  n.updated_at,
  n.approved_at,
  n.approved_by,
  n.admin_notes,
  n.rejection_reason,
  n.category_group_id,
  n.subcategory_id,
  n.nomination_source,
  
  -- Nominee data
  ne.id as nominee_id,
  ne.type as nominee_type,
  ne.firstname as nominee_firstname,
  ne.lastname as nominee_lastname,
  ne.jobtitle as nominee_jobtitle,
  ne.person_email as nominee_person_email,
  ne.person_linkedin as nominee_person_linkedin,
  ne.person_phone as nominee_person_phone,
  ne.person_company as nominee_person_company,
  ne.person_country as nominee_person_country,
  ne.headshot_url as nominee_headshot_url,
  ne.why_me as nominee_why_me,
  ne.company_name as nominee_company_name,
  ne.company_website as nominee_company_website,
  ne.company_linkedin as nominee_company_linkedin,
  ne.company_phone as nominee_company_phone,
  ne.company_country as nominee_company_country,
  ne.company_size as nominee_company_size,
  ne.company_industry as nominee_company_industry,
  ne.logo_url as nominee_logo_url,
  ne.why_us as nominee_why_us,
  ne.live_url as nominee_live_url,
  ne.bio as nominee_bio,
  ne.achievements as nominee_achievements,
  
  -- Computed nominee display fields
  CASE 
    WHEN ne.type = 'person' THEN CONCAT(COALESCE(ne.firstname, ''), ' ', COALESCE(ne.lastname, ''))
    ELSE ne.company_name
  END as nominee_display_name,
  
  CASE 
    WHEN ne.type = 'person' THEN ne.headshot_url
    ELSE ne.logo_url
  END as nominee_image_url,
  
  -- Nominator data
  nr.id as nominator_id,
  nr.email as nominator_email,
  nr.firstname as nominator_firstname,
  nr.lastname as nominator_lastname,
  nr.linkedin as nominator_linkedin,
  nr.company as nominator_company,
  nr.job_title as nominator_job_title,
  nr.phone as nominator_phone,
  nr.country as nominator_country
  
FROM nominations n
JOIN nominees ne ON n.nominee_id = ne.id
JOIN nominators nr ON n.nominator_id = nr.id;

-- Grant access to the view
GRANT SELECT ON admin_nominations TO authenticated;
GRANT SELECT ON admin_nominations TO anon;