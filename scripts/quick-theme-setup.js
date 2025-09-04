#!/usr/bin/env node

/**
 * Quick Theme Setup Script
 * 
 * This script provides instructions and tests the theme system
 */

const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function quickThemeSetup() {
  console.log('🎨 Quick Theme Setup Guide\n');

  console.log('📋 STEP 1: Run this SQL in your Supabase SQL Editor:');
  console.log('─'.repeat(60));
  console.log(`
-- Drop existing table if it has wrong column size
DROP TABLE IF EXISTS theme_settings;

-- Create theme_settings table with proper column sizes
CREATE TABLE theme_settings (
  id SERIAL PRIMARY KEY,
  component_category VARCHAR(50) NOT NULL,
  component_name VARCHAR(100) NOT NULL,
  property_name VARCHAR(50) NOT NULL,
  color_value VARCHAR(10) NOT NULL,
  default_value VARCHAR(10) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(component_category, component_name, property_name)
);

-- Insert sample data (just a few items to test)
INSERT INTO theme_settings (component_category, component_name, property_name, color_value, default_value, description) VALUES
('buttons', 'primary', 'background', '#3b82f6', '#3b82f6', 'Primary button background'),
('buttons', 'primary', 'text', '#ffffff', '#ffffff', 'Primary button text'),
('navigation', 'header', 'background', '#1f2937', '#1f2937', 'Header background'),
('branding', 'logo', 'header', '/logo.png', '/logo.png', 'Header logo URL');
`);
  console.log('─'.repeat(60));

  console.log('\n📋 STEP 2: Test the API');
  console.log('After running the SQL, test this URL:');
  console.log('http://localhost:3000/api/admin/theme');

  console.log('\n📋 STEP 3: Access Theme Panel');
  console.log('1. Go to: http://localhost:3000/admin');
  console.log('2. Login to admin panel');
  console.log('3. Click the "Theme" tab');

  console.log('\n🔧 Testing API now...');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/theme');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API working! Found ${data.count || 0} theme settings`);
      
      if (data.count > 0) {
        console.log('\n🎉 Theme system is ready!');
        console.log('You can now:');
        console.log('• Customize colors in Admin → Theme tab');
        console.log('• Upload logos in the Branding section');
        console.log('• See live preview of changes');
      } else {
        console.log('\n⚠️ No theme data found. Please run the SQL above.');
      }
    } else {
      console.log('⚠️ API not working. Make sure your dev server is running.');
    }
  } catch (error) {
    console.log('⚠️ Could not test API. Make sure your dev server is running.');
  }

  console.log('\n📚 For full setup, see: THEME_CUSTOMIZATION_SETUP_GUIDE.md');
}

// Run the setup
if (require.main === module) {
  quickThemeSetup();
}

module.exports = { quickThemeSetup };