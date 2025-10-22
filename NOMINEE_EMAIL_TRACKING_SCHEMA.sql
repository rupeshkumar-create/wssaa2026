-- Nominee Email Tracking Schema
-- Add email tracking fields to nominations table and create email log table

-- Add email tracking fields to nominations table
ALTER TABLE nominations 
ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_sent_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS nomination_source TEXT DEFAULT 'public' CHECK (nomination_source IN ('public', 'admin'));

-- Create email log table for tracking all emails sent
CREATE TABLE IF NOT EXISTS nominee_email_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomination_id UUID REFERENCES nominations(id) ON DELETE CASCADE,
    email_address TEXT NOT NULL,
    transactional_id TEXT,
    email_type TEXT DEFAULT 'nominee_notification',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_nominee_email_log_nomination_id ON nominee_email_log(nomination_id);
CREATE INDEX IF NOT EXISTS idx_nominee_email_log_sent_at ON nominee_email_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_nominations_source ON nominations(nomination_source);

-- Update existing nominations to set source as 'public' if not set
UPDATE nominations 
SET nomination_source = 'public' 
WHERE nomination_source IS NULL;

-- Function to update email tracking when email is sent
CREATE OR REPLACE FUNCTION update_nomination_email_tracking()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the nominations table with last email sent info
    UPDATE nominations 
    SET 
        last_email_sent_at = NEW.sent_at,
        email_sent_count = COALESCE(email_sent_count, 0) + 1
    WHERE id = NEW.nomination_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update email tracking
DROP TRIGGER IF EXISTS trigger_update_email_tracking ON nominee_email_log;
CREATE TRIGGER trigger_update_email_tracking
    AFTER INSERT ON nominee_email_log
    FOR EACH ROW
    EXECUTE FUNCTION update_nomination_email_tracking();

-- Add RLS policies for email log table
ALTER TABLE nominee_email_log ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role can manage email logs" ON nominee_email_log
    FOR ALL USING (auth.role() = 'service_role');

-- Policy for authenticated users (read only)
CREATE POLICY "Authenticated users can read email logs" ON nominee_email_log
    FOR SELECT USING (auth.role() = 'authenticated');