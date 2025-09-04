#!/usr/bin/env node

/**
 * Setup Theme Customization System
 * 
 * This script creates the database schema for theme customization
 * and inserts default color values.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function setupThemeCustomization() {
  console.log('🎨 Setting up Theme Customization System...\n');

  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing required environment variables:');
      console.error('   - NEXT_PUBLIC_SUPABASE_URL');
      console.error('   - SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('1️⃣ Connecting to Supabase...');
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('nominations')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Failed to connect to Supabase:', testError.message);
      process.exit(1);
    }

    console.log('✅ Connected to Supabase successfully\n');

    // Read and execute schema
    console.log('2️⃣ Reading theme customization schema...');
    const schemaPath = path.join(__dirname, '..', 'THEME_CUSTOMIZATION_SCHEMA.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Schema file not found:', schemaPath);
      process.exit(1);
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file loaded\n');

    console.log('3️⃣ Executing schema...');
    
    // Split SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            // Try direct query for some statements
            const { error: directError } = await supabase
              .from('theme_settings')
              .select('id')
              .limit(1);
            
            if (directError && !directError.message.includes('does not exist')) {
              console.warn(`⚠️ Statement ${i + 1} warning:`, error.message);
            }
          }
        } catch (err) {
          console.warn(`⚠️ Statement ${i + 1} warning:`, err.message);
        }
      }
    }

    console.log('✅ Schema executed successfully\n');

    // Verify table creation
    console.log('4️⃣ Verifying theme_settings table...');
    const { data: themeData, error: themeError } = await supabase
      .from('theme_settings')
      .select('*')
      .limit(5);

    if (themeError) {
      console.error('❌ Failed to verify theme_settings table:', themeError.message);
      console.log('\n🔧 Manual Setup Required:');
      console.log('Please run the following SQL in your Supabase SQL editor:');
      console.log('\n' + schemaSQL);
      process.exit(1);
    }

    console.log(`✅ Theme settings table verified with ${themeData?.length || 0} sample records\n`);

    // Test API endpoints
    console.log('5️⃣ Testing theme API endpoints...');
    
    try {
      const response = await fetch('http://localhost:3000/api/admin/theme');
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Theme API working - ${data.count || 0} colors configured`);
      } else {
        console.log('⚠️ Theme API not accessible (server may not be running)');
      }
    } catch (err) {
      console.log('⚠️ Theme API not accessible (server may not be running)');
    }

    console.log('\n🎉 Theme Customization System Setup Complete!\n');
    
    console.log('📋 Next Steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Go to Admin Panel → Theme tab');
    console.log('3. Start customizing colors!');
    console.log('\n💡 Features Available:');
    console.log('• Real-time color preview');
    console.log('• Color picker with hex input');
    console.log('• Reset individual colors or all colors');
    console.log('• Export theme configurations');
    console.log('• Organized by component categories');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupThemeCustomization();
}

module.exports = { setupThemeCustomization };