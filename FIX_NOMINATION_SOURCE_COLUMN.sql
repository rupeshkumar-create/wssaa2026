-- Fix missing nomination_source column in nominations table
-- This column tracks whether a nomination came from 'public' or 'admin' sources

-- Add the missing nomination_source column
ALTER TABLE nominations 
ADD COLUMN IF NOT EXISTS nomination_source TEXT DEFAULT 'public' CHECK (nomination_source IN ('public', 'admin'));

-- Update existing records to have 'public' as default
UPDATE nominations 
SET nomination_source = 'public' 
WHERE nomination_source IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN nominations.nomination_source IS 'Source of the nomination: public (from website form) or admin (from admin panel)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'nominations' 
AND column_name = 'nomination_source';