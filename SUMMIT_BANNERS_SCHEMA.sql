-- Summit Banners Table Schema
-- This table stores World Staffing Summit banner information for the homepage

-- Create the summit_banners table
CREATE TABLE IF NOT EXISTS summit_banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_summit_banners_is_active ON summit_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_summit_banners_created_at ON summit_banners(created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE summit_banners ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (only active banners)
CREATE POLICY "Public can view active summit banners" ON summit_banners
    FOR SELECT USING (is_active = true);

-- Policy for admin full access (you'll need to adjust this based on your admin authentication)
CREATE POLICY "Admin can manage all summit banners" ON summit_banners
    FOR ALL USING (true);

-- Add comments for documentation
COMMENT ON TABLE summit_banners IS 'Stores World Staffing Summit banner information displayed on the homepage';
COMMENT ON COLUMN summit_banners.id IS 'Unique identifier for the banner';
COMMENT ON COLUMN summit_banners.title IS 'Banner title displayed on the homepage';
COMMENT ON COLUMN summit_banners.description IS 'Banner description text';
COMMENT ON COLUMN summit_banners.image_url IS 'URL of the banner background image';
COMMENT ON COLUMN summit_banners.link_url IS 'URL to redirect when banner is clicked';
COMMENT ON COLUMN summit_banners.is_active IS 'Whether this banner is currently active (only one should be active at a time)';
COMMENT ON COLUMN summit_banners.created_at IS 'Timestamp when the banner was created';
COMMENT ON COLUMN summit_banners.updated_at IS 'Timestamp when the banner was last updated';

-- Insert a sample banner (optional)
INSERT INTO summit_banners (
    title,
    description,
    image_url,
    link_url,
    is_active
) VALUES (
    'World Staffing Summit 2026',
    'Join us for the premier global event bringing together staffing industry leaders, innovators, and professionals from around the world.',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://worldstaffingsummit.com',
    true
) ON CONFLICT DO NOTHING;

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_summit_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER trigger_update_summit_banners_updated_at
    BEFORE UPDATE ON summit_banners
    FOR EACH ROW
    EXECUTE FUNCTION update_summit_banners_updated_at();