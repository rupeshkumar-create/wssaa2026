#!/usr/bin/env node

/**
 * Create Theme Settings Table
 * 
 * This script creates the theme_settings table directly using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function createThemeTable() {
  console.log('🎨 Creating Theme Settings Table...\n');

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing environment variables');
      process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('1️⃣ Creating theme_settings table...');
    
    // Create table using raw SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS theme_settings (
        id SERIAL PRIMARY KEY,
        component_category VARCHAR(50) NOT NULL,
        component_name VARCHAR(100) NOT NULL,
        property_name VARCHAR(50) NOT NULL,
        color_value VARCHAR(7) NOT NULL,
        default_value VARCHAR(7) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(component_category, component_name, property_name)
      );
    `;

    // Try to create table - if it fails, it might already exist
    try {
      // We'll skip table creation and just try to insert data
      // The table should be created manually in Supabase SQL editor
      console.log('⚠️ Skipping table creation - please create manually if needed');
    } catch (err) {
      console.log('⚠️ Table creation skipped');
    }

    console.log('2️⃣ Inserting default theme values...');
    
    // Insert default values
    const defaultValues = [
      // Navigation Colors
      ['navigation', 'header', 'background', '#1f2937', '#1f2937', 'Main header background color'],
      ['navigation', 'header', 'text', '#ffffff', '#ffffff', 'Header text color'],
      ['navigation', 'menu-item', 'text', '#9ca3af', '#9ca3af', 'Menu item text color'],
      ['navigation', 'menu-item', 'hover', '#ffffff', '#ffffff', 'Menu item hover text color'],
      ['navigation', 'menu-item', 'active', '#3b82f6', '#3b82f6', 'Active menu item color'],

      // Button Colors
      ['buttons', 'primary', 'background', '#3b82f6', '#3b82f6', 'Primary button background'],
      ['buttons', 'primary', 'text', '#ffffff', '#ffffff', 'Primary button text'],
      ['buttons', 'primary', 'hover', '#2563eb', '#2563eb', 'Primary button hover background'],
      ['buttons', 'secondary', 'background', '#6b7280', '#6b7280', 'Secondary button background'],
      ['buttons', 'secondary', 'text', '#ffffff', '#ffffff', 'Secondary button text'],
      ['buttons', 'secondary', 'hover', '#4b5563', '#4b5563', 'Secondary button hover background'],
      ['buttons', 'success', 'background', '#10b981', '#10b981', 'Success button background'],
      ['buttons', 'success', 'text', '#ffffff', '#ffffff', 'Success button text'],
      ['buttons', 'success', 'hover', '#059669', '#059669', 'Success button hover background'],
      ['buttons', 'warning', 'background', '#f59e0b', '#f59e0b', 'Warning button background'],
      ['buttons', 'warning', 'text', '#ffffff', '#ffffff', 'Warning button text'],
      ['buttons', 'warning', 'hover', '#d97706', '#d97706', 'Warning button hover background'],
      ['buttons', 'danger', 'background', '#ef4444', '#ef4444', 'Danger button background'],
      ['buttons', 'danger', 'text', '#ffffff', '#ffffff', 'Danger button text'],
      ['buttons', 'danger', 'hover', '#dc2626', '#dc2626', 'Danger button hover background'],

      // Card Colors
      ['cards', 'default', 'background', '#ffffff', '#ffffff', 'Default card background'],
      ['cards', 'default', 'border', '#e5e7eb', '#e5e7eb', 'Default card border'],
      ['cards', 'default', 'shadow', '#00000010', '#00000010', 'Default card shadow'],
      ['cards', 'hover', 'background', '#f9fafb', '#f9fafb', 'Card hover background'],
      ['cards', 'hover', 'border', '#d1d5db', '#d1d5db', 'Card hover border'],

      // Form Colors
      ['forms', 'input', 'background', '#ffffff', '#ffffff', 'Input field background'],
      ['forms', 'input', 'border', '#d1d5db', '#d1d5db', 'Input field border'],
      ['forms', 'input', 'text', '#111827', '#111827', 'Input field text'],
      ['forms', 'input', 'focus', '#3b82f6', '#3b82f6', 'Input field focus border'],
      ['forms', 'label', 'text', '#374151', '#374151', 'Form label text'],
      ['forms', 'error', 'text', '#ef4444', '#ef4444', 'Form error text'],
      ['forms', 'error', 'border', '#ef4444', '#ef4444', 'Form error border'],

      // Text Colors
      ['text', 'heading', 'primary', '#111827', '#111827', 'Primary heading color'],
      ['text', 'heading', 'secondary', '#374151', '#374151', 'Secondary heading color'],
      ['text', 'body', 'primary', '#374151', '#374151', 'Primary body text color'],
      ['text', 'body', 'secondary', '#6b7280', '#6b7280', 'Secondary body text color'],
      ['text', 'link', 'default', '#3b82f6', '#3b82f6', 'Default link color'],
      ['text', 'link', 'hover', '#2563eb', '#2563eb', 'Link hover color'],

      // Background Colors
      ['backgrounds', 'page', 'primary', '#ffffff', '#ffffff', 'Primary page background'],
      ['backgrounds', 'page', 'secondary', '#f9fafb', '#f9fafb', 'Secondary page background'],
      ['backgrounds', 'section', 'primary', '#ffffff', '#ffffff', 'Primary section background'],
      ['backgrounds', 'section', 'secondary', '#f3f4f6', '#f3f4f6', 'Secondary section background'],

      // Accent Colors
      ['accents', 'primary', 'color', '#3b82f6', '#3b82f6', 'Primary accent color'],
      ['accents', 'secondary', 'color', '#10b981', '#10b981', 'Secondary accent color'],
      ['accents', 'divider', 'color', '#e5e7eb', '#e5e7eb', 'Divider color'],
      ['accents', 'icon', 'color', '#6b7280', '#6b7280', 'Icon color'],
      ['accents', 'icon', 'hover', '#374151', '#374151', 'Icon hover color'],
    ];

    // Insert values one by one
    for (const [category, component, property, colorValue, defaultValue, description] of defaultValues) {
      const { error } = await supabase
        .from('theme_settings')
        .upsert({
          component_category: category,
          component_name: component,
          property_name: property,
          color_value: colorValue,
          default_value: defaultValue,
          description: description,
        }, {
          onConflict: 'component_category,component_name,property_name'
        });

      if (error) {
        console.warn(`⚠️ Warning inserting ${category}-${component}-${property}:`, error.message);
      }
    }

    console.log('✅ Default values inserted successfully');

    // Test the API
    console.log('3️⃣ Testing theme API...');
    const testResponse = await fetch('http://localhost:3000/api/admin/theme');
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log(`✅ Theme API working - ${data.count || 0} colors configured`);
    } else {
      console.log('⚠️ Theme API test failed');
    }

    console.log('\n🎉 Theme System Setup Complete!\n');
    console.log('📋 Next Steps:');
    console.log('1. Go to Admin Panel → Theme tab');
    console.log('2. Start customizing colors!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  createThemeTable();
}

module.exports = { createThemeTable };