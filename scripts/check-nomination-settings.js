#!/usr/bin/env node

/**
 * Check nomination settings in the database
 */

const { createClient } = require('@supabase/supabase-js');

async function checkNominationSettings() {
  console.log('🔍 Checking nomination settings...\n');
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Check if app_settings table exists
    console.log('1️⃣ Checking if app_settings table exists...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'app_settings');
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
      return;
    }
    
    if (!tables || tables.length === 0) {
      console.log('❌ app_settings table does not exist');
      console.log('\n🔧 Creating app_settings table...');
      
      // Create the table
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS app_settings (
            id SERIAL PRIMARY KEY,
            setting_key VARCHAR(255) UNIQUE NOT NULL,
            setting_value TEXT,
            boolean_value BOOLEAN,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Insert default settings
          INSERT INTO app_settings (setting_key, boolean_value) 
          VALUES ('nominations_enabled', false)
          ON CONFLICT (setting_key) DO NOTHING;
          
          INSERT INTO app_settings (setting_key, setting_value) 
          VALUES ('nominations_close_message', 'Thank you for your interest! Nominations are now closed.')
          ON CONFLICT (setting_key) DO NOTHING;
        `
      });
      
      if (createError) {
        console.error('❌ Error creating table:', createError);
        return;
      }
      
      console.log('✅ app_settings table created successfully');
    } else {
      console.log('✅ app_settings table exists');
    }
    
    // Check current settings
    console.log('\n2️⃣ Checking current settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('app_settings')
      .select('*');
    
    if (settingsError) {
      console.error('❌ Error fetching settings:', settingsError);
      return;
    }
    
    console.log('📋 Current settings:');
    settings.forEach(setting => {
      const value = setting.boolean_value !== null ? setting.boolean_value : setting.setting_value;
      console.log(`   ${setting.setting_key}: ${value}`);
    });
    
    // Check specific nomination settings
    const nominationsEnabled = settings.find(s => s.setting_key === 'nominations_enabled');
    const closeMessage = settings.find(s => s.setting_key === 'nominations_close_message');
    
    console.log('\n📊 Nomination Status:');
    console.log(`   Enabled: ${nominationsEnabled ? nominationsEnabled.boolean_value : 'NOT SET'}`);
    console.log(`   Message: ${closeMessage ? closeMessage.setting_value : 'NOT SET'}`);
    
    if (!nominationsEnabled) {
      console.log('\n🔧 Setting nominations to disabled...');
      const { error: insertError } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'nominations_enabled',
          boolean_value: false
        });
      
      if (insertError) {
        console.error('❌ Error setting nominations_enabled:', insertError);
      } else {
        console.log('✅ Nominations disabled successfully');
      }
    }
    
    if (!closeMessage) {
      console.log('\n🔧 Setting close message...');
      const { error: insertError } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'nominations_close_message',
          setting_value: 'Thank you for your interest! Nominations are now closed.'
        });
      
      if (insertError) {
        console.error('❌ Error setting close message:', insertError);
      } else {
        console.log('✅ Close message set successfully');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkNominationSettings();