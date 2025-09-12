-- Add nomination source tracking to existing nominations table
-- Run this in Supabase SQL Editor

-- Add nomination_source column to track admin vs public nominations
ALTER TABLE public.nominations 
ADD COLUMN IF NOT EXISTS nomination_source TEXT DEFAULT 'public' CHECK (nomination_source IN ('admin', 'public'));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_nominations_source ON public.nominations(nomination_source);

-- Update existing nominations to have 'public' source (default)
UPDATE public.nominations 
SET nomination_source = 'public' 
WHERE nomination_source IS NULL;

-- Add additional_votes column if it doesn't exist (for manual vote adjustments)
ALTER TABLE public.nominations 
ADD COLUMN IF NOT EXISTS additional_votes INTEGER DEFAULT 0;

-- Create index for additional_votes
CREATE INDEX IF NOT EXISTS idx_nominations_additional_votes ON public.nominations(additional_votes);

-- Verification query
SELECT 
  nomination_source,
  COUNT(*) as count
FROM public.nominations 
GROUP BY nomination_source;

-- Show sample data
SELECT 
  id,
  state,
  nomination_source,
  votes,
  additional_votes,
  created_at
FROM public.nominations 
ORDER BY created_at DESC 
LIMIT 5;