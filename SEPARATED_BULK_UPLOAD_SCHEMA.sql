-- Separated Bulk Upload System Schema
-- This creates tables for managing person and company bulk uploads separately

-- Create separated bulk upload batches table
CREATE TABLE IF NOT EXISTS separated_bulk_upload_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    upload_type TEXT NOT NULL CHECK (upload_type IN ('person', 'company')),
    total_rows INTEGER NOT NULL DEFAULT 0,
    processed_rows INTEGER NOT NULL DEFAULT 0,
    successful_rows INTEGER NOT NULL DEFAULT 0,
    failed_rows INTEGER NOT NULL DEFAULT 0,
    draft_rows INTEGER NOT NULL DEFAULT 0,
    approved_rows INTEGER NOT NULL DEFAULT 0,
    loops_synced_rows INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    uploaded_by TEXT NOT NULL DEFAULT 'admin',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    approval_completed_at TIMESTAMP WITH TIME ZONE,
    error_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create separated bulk upload errors table
CREATE TABLE IF NOT EXISTS separated_bulk_upload_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES separated_bulk_upload_batches(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    field_name TEXT,
    error_message TEXT NOT NULL,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_separated_bulk_upload_batches_status ON separated_bulk_upload_batches(status);
CREATE INDEX IF NOT EXISTS idx_separated_bulk_upload_batches_upload_type ON separated_bulk_upload_batches(upload_type);
CREATE INDEX IF NOT EXISTS idx_separated_bulk_upload_batches_uploaded_at ON separated_bulk_upload_batches(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_separated_bulk_upload_errors_batch_id ON separated_bulk_upload_errors(batch_id);
CREATE INDEX IF NOT EXISTS idx_separated_bulk_upload_errors_row_number ON separated_bulk_upload_errors(batch_id, row_number);

-- Add Loops sync fields to nominations table if they don't exist
ALTER TABLE nominations 
ADD COLUMN IF NOT EXISTS loops_contact_id TEXT,
ADD COLUMN IF NOT EXISTS loops_user_group TEXT,
ADD COLUMN IF NOT EXISTS loops_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS loops_sync_status TEXT DEFAULT 'pending' CHECK (loops_sync_status IN ('pending', 'synced', 'failed')),
ADD COLUMN IF NOT EXISTS loops_sync_error TEXT,
ADD COLUMN IF NOT EXISTS approved_by TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for Loops sync fields
CREATE INDEX IF NOT EXISTS idx_nominations_loops_sync_status ON nominations(loops_sync_status);
CREATE INDEX IF NOT EXISTS idx_nominations_loops_user_group ON nominations(loops_user_group);
CREATE INDEX IF NOT EXISTS idx_nominations_bulk_upload_batch_id ON nominations(bulk_upload_batch_id);

-- Create a view for draft nominations ready for approval
CREATE OR REPLACE VIEW draft_nominations_for_approval AS
SELECT 
    n.*,
    b.filename as batch_filename,
    b.upload_type as batch_upload_type,
    b.uploaded_at as batch_uploaded_at
FROM nominations n
LEFT JOIN separated_bulk_upload_batches b ON n.bulk_upload_batch_id = b.id
WHERE n.state = 'draft' 
AND n.upload_source = 'separated_bulk_upload'
ORDER BY n.uploaded_at DESC;

-- Create a view for Loops sync status
CREATE OR REPLACE VIEW loops_sync_status AS
SELECT 
    loops_user_group,
    loops_sync_status,
    COUNT(*) as count,
    MAX(loops_synced_at) as last_synced_at
FROM nominations 
WHERE loops_user_group IS NOT NULL
GROUP BY loops_user_group, loops_sync_status
ORDER BY loops_user_group, loops_sync_status;

-- Function to update batch statistics
CREATE OR REPLACE FUNCTION update_separated_batch_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update batch statistics when nominations are updated
    IF TG_OP = 'UPDATE' AND OLD.state != NEW.state THEN
        -- Update the batch with current counts
        UPDATE separated_bulk_upload_batches 
        SET 
            approved_rows = (
                SELECT COUNT(*) 
                FROM nominations 
                WHERE bulk_upload_batch_id = NEW.bulk_upload_batch_id 
                AND state = 'approved'
            ),
            loops_synced_rows = (
                SELECT COUNT(*) 
                FROM nominations 
                WHERE bulk_upload_batch_id = NEW.bulk_upload_batch_id 
                AND loops_sync_status = 'synced'
            ),
            updated_at = NOW()
        WHERE id = NEW.bulk_upload_batch_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for batch statistics updates
DROP TRIGGER IF EXISTS trigger_update_separated_batch_stats ON nominations;
CREATE TRIGGER trigger_update_separated_batch_stats
    AFTER UPDATE ON nominations
    FOR EACH ROW
    EXECUTE FUNCTION update_separated_batch_stats();

-- Insert sample Loops user groups configuration
INSERT INTO loops_user_groups (group_name, description, category_filter, type_filter) VALUES
('nominees-person-usa', 'Person nominees from USA region', 'usa,north-america', 'person'),
('nominees-person-europe', 'Person nominees from Europe region', 'europe', 'person'),
('nominees-person-global', 'Global person nominees', 'global', 'person'),
('nominees-person-general', 'General person nominees', NULL, 'person'),
('nominees-company-usa', 'Company nominees from USA region', 'usa,north-america', 'company'),
('nominees-company-europe', 'Company nominees from Europe region', 'europe', 'company'),
('nominees-company-global', 'Global company nominees', 'global', 'company'),
('nominees-company-general', 'General company nominees', NULL, 'company')
ON CONFLICT (group_name) DO UPDATE SET
    description = EXCLUDED.description,
    category_filter = EXCLUDED.category_filter,
    type_filter = EXCLUDED.type_filter,
    updated_at = NOW();

-- Create loops_user_groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS loops_user_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_name TEXT UNIQUE NOT NULL,
    description TEXT,
    category_filter TEXT, -- Comma-separated list of category keywords
    type_filter TEXT CHECK (type_filter IN ('person', 'company')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant necessary permissions
GRANT ALL ON separated_bulk_upload_batches TO authenticated;
GRANT ALL ON separated_bulk_upload_errors TO authenticated;
GRANT ALL ON loops_user_groups TO authenticated;
GRANT SELECT ON draft_nominations_for_approval TO authenticated;
GRANT SELECT ON loops_sync_status TO authenticated;

-- Add RLS policies
ALTER TABLE separated_bulk_upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE separated_bulk_upload_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE loops_user_groups ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage bulk uploads
CREATE POLICY "Allow authenticated users to manage separated bulk uploads" ON separated_bulk_upload_batches
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view separated bulk upload errors" ON separated_bulk_upload_errors
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view loops user groups" ON loops_user_groups
    FOR ALL USING (auth.role() = 'authenticated');

COMMENT ON TABLE separated_bulk_upload_batches IS 'Tracks separated bulk upload batches for person and company nominations';
COMMENT ON TABLE separated_bulk_upload_errors IS 'Stores validation errors from separated bulk uploads';
COMMENT ON TABLE loops_user_groups IS 'Configuration for Loops user group assignments based on nomination type and category';
COMMENT ON VIEW draft_nominations_for_approval IS 'View of draft nominations ready for manual approval';
COMMENT ON VIEW loops_sync_status IS 'Summary view of Loops synchronization status by user group';