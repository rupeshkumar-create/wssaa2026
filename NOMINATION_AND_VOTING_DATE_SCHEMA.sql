-- Enhanced Nomination and Voting Date Control Schema
-- Adds voting date control to the existing system_settings table

-- Add voting date control settings
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES 
  ('voting_enabled', 'false', 'Controls whether voting is currently enabled'),
  ('voting_start_date', '', 'Date when voting will open (ISO format)'),
  ('voting_end_date', '', 'Date when voting will close (ISO format)'),
  ('voting_closed_message', 'Voting will open soon. Please check back later.', 'Message shown when voting is closed')
ON CONFLICT (setting_key) DO NOTHING;

-- Update existing nomination settings if needed
UPDATE public.system_settings 
SET description = 'Controls whether nominations are open or closed'
WHERE setting_key = 'nominations_enabled';

UPDATE public.system_settings 
SET description = 'Message shown when nominations are closed'
WHERE setting_key = 'nominations_close_message';

-- Verify the settings exist
SELECT setting_key, setting_value, description 
FROM public.system_settings 
WHERE setting_key IN (
  'nominations_enabled', 
  'nominations_close_message',
  'voting_enabled',
  'voting_start_date', 
  'voting_end_date',
  'voting_closed_message'
)
ORDER BY setting_key;