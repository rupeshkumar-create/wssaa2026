-- Simple Voting Date Control Schema
-- Just one setting: voting start date

-- Add voting start date setting
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES 
  ('voting_start_date', '', 'Date when voting will open (ISO format)')
ON CONFLICT (setting_key) DO NOTHING;

-- Remove complex voting settings if they exist
DELETE FROM public.system_settings 
WHERE setting_key IN ('voting_enabled', 'voting_end_date', 'voting_closed_message');

-- Verify the setting exists
SELECT setting_key, setting_value, description 
FROM public.system_settings 
WHERE setting_key = 'voting_start_date';