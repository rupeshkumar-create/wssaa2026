-- Theme Customization System Schema
-- This creates the database structure for storing custom color themes

-- Create theme_settings table
CREATE TABLE IF NOT EXISTS theme_settings (
  id SERIAL PRIMARY KEY,
  component_category VARCHAR(50) NOT NULL,
  component_name VARCHAR(100) NOT NULL,
  property_name VARCHAR(50) NOT NULL,
  color_value VARCHAR(7) NOT NULL, -- Hex color code
  default_value VARCHAR(7) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(component_category, component_name, property_name)
);

-- Insert default theme values
INSERT INTO theme_settings (component_category, component_name, property_name, color_value, default_value, description) VALUES
-- Navigation Colors
('navigation', 'header', 'background', '#1f2937', '#1f2937', 'Main header background color'),
('navigation', 'header', 'text', '#ffffff', '#ffffff', 'Header text color'),
('navigation', 'menu-item', 'text', '#9ca3af', '#9ca3af', 'Menu item text color'),
('navigation', 'menu-item', 'hover', '#ffffff', '#ffffff', 'Menu item hover text color'),
('navigation', 'menu-item', 'active', '#3b82f6', '#3b82f6', 'Active menu item color'),

-- Button Colors
('buttons', 'primary', 'background', '#3b82f6', '#3b82f6', 'Primary button background'),
('buttons', 'primary', 'text', '#ffffff', '#ffffff', 'Primary button text'),
('buttons', 'primary', 'hover', '#2563eb', '#2563eb', 'Primary button hover background'),
('buttons', 'secondary', 'background', '#6b7280', '#6b7280', 'Secondary button background'),
('buttons', 'secondary', 'text', '#ffffff', '#ffffff', 'Secondary button text'),
('buttons', 'secondary', 'hover', '#4b5563', '#4b5563', 'Secondary button hover background'),
('buttons', 'success', 'background', '#10b981', '#10b981', 'Success button background'),
('buttons', 'success', 'text', '#ffffff', '#ffffff', 'Success button text'),
('buttons', 'success', 'hover', '#059669', '#059669', 'Success button hover background'),
('buttons', 'warning', 'background', '#f59e0b', '#f59e0b', 'Warning button background'),
('buttons', 'warning', 'text', '#ffffff', '#ffffff', 'Warning button text'),
('buttons', 'warning', 'hover', '#d97706', '#d97706', 'Warning button hover background'),
('buttons', 'danger', 'background', '#ef4444', '#ef4444', 'Danger button background'),
('buttons', 'danger', 'text', '#ffffff', '#ffffff', 'Danger button text'),
('buttons', 'danger', 'hover', '#dc2626', '#dc2626', 'Danger button hover background'),

-- Card Colors
('cards', 'default', 'background', '#ffffff', '#ffffff', 'Default card background'),
('cards', 'default', 'border', '#e5e7eb', '#e5e7eb', 'Default card border'),
('cards', 'default', 'shadow', '#00000010', '#00000010', 'Default card shadow'),
('cards', 'hover', 'background', '#f9fafb', '#f9fafb', 'Card hover background'),
('cards', 'hover', 'border', '#d1d5db', '#d1d5db', 'Card hover border'),

-- Form Colors
('forms', 'input', 'background', '#ffffff', '#ffffff', 'Input field background'),
('forms', 'input', 'border', '#d1d5db', '#d1d5db', 'Input field border'),
('forms', 'input', 'text', '#111827', '#111827', 'Input field text'),
('forms', 'input', 'focus', '#3b82f6', '#3b82f6', 'Input field focus border'),
('forms', 'label', 'text', '#374151', '#374151', 'Form label text'),
('forms', 'error', 'text', '#ef4444', '#ef4444', 'Form error text'),
('forms', 'error', 'border', '#ef4444', '#ef4444', 'Form error border'),

-- Table Colors
('tables', 'header', 'background', '#f9fafb', '#f9fafb', 'Table header background'),
('tables', 'header', 'text', '#374151', '#374151', 'Table header text'),
('tables', 'row', 'background', '#ffffff', '#ffffff', 'Table row background'),
('tables', 'row', 'text', '#111827', '#111827', 'Table row text'),
('tables', 'row', 'hover', '#f3f4f6', '#f3f4f6', 'Table row hover background'),
('tables', 'row', 'border', '#e5e7eb', '#e5e7eb', 'Table row border'),

-- Modal Colors
('modals', 'overlay', 'background', '#00000080', '#00000080', 'Modal overlay background'),
('modals', 'content', 'background', '#ffffff', '#ffffff', 'Modal content background'),
('modals', 'content', 'border', '#e5e7eb', '#e5e7eb', 'Modal content border'),
('modals', 'header', 'background', '#f9fafb', '#f9fafb', 'Modal header background'),
('modals', 'header', 'text', '#111827', '#111827', 'Modal header text'),

-- Text Colors
('text', 'heading', 'primary', '#111827', '#111827', 'Primary heading color'),
('text', 'heading', 'secondary', '#374151', '#374151', 'Secondary heading color'),
('text', 'body', 'primary', '#374151', '#374151', 'Primary body text color'),
('text', 'body', 'secondary', '#6b7280', '#6b7280', 'Secondary body text color'),
('text', 'link', 'default', '#3b82f6', '#3b82f6', 'Default link color'),
('text', 'link', 'hover', '#2563eb', '#2563eb', 'Link hover color'),

-- Background Colors
('backgrounds', 'page', 'primary', '#ffffff', '#ffffff', 'Primary page background'),
('backgrounds', 'page', 'secondary', '#f9fafb', '#f9fafb', 'Secondary page background'),
('backgrounds', 'section', 'primary', '#ffffff', '#ffffff', 'Primary section background'),
('backgrounds', 'section', 'secondary', '#f3f4f6', '#f3f4f6', 'Secondary section background'),

-- Accent Colors
('accents', 'primary', 'color', '#3b82f6', '#3b82f6', 'Primary accent color'),
('accents', 'secondary', 'color', '#10b981', '#10b981', 'Secondary accent color'),
('accents', 'divider', 'color', '#e5e7eb', '#e5e7eb', 'Divider color'),
('accents', 'icon', 'color', '#6b7280', '#6b7280', 'Icon color'),
('accents', 'icon', 'hover', '#374151', '#374151', 'Icon hover color')

ON CONFLICT (component_category, component_name, property_name) DO NOTHING;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_theme_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_theme_settings_updated_at ON theme_settings;
CREATE TRIGGER update_theme_settings_updated_at
    BEFORE UPDATE ON theme_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_theme_settings_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_theme_settings_category ON theme_settings(component_category);
CREATE INDEX IF NOT EXISTS idx_theme_settings_component ON theme_settings(component_category, component_name);