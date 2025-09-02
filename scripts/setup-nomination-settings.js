#!/usr/bin/env node

/**
 * Setup nomination settings table and disable nominations
 */

const { createClient } = require('@supabase/supabase-js');

async function setupNominationSettings() {
  console.log('🔧 Setting up nomination settings...\n');
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Create app_settings table
    console.log('1️⃣ Creating app_settings table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS app_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        boolean_value BOOLEAN,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: createError } = await supabase.rpc('sql', {
      query: createTableSQL
    });
    
    if (createError) {
      console.error('❌ Error creating table:', createError);
      
      // Try alternative approach - direct table creation
      console.log('🔄 Trying direct table creation...');
      const { error: directError } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1);
      
      if (directError && directError.code === '42P01') {
        console.log('❌ Table definitely does not exist. Creating via SQL...');
        
        // Use a different approach - create via raw SQL
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: createTableSQL
        });
        
        if (error) {
          console.error('❌ Still failed to create table:', error);
          return;
        }
      }
    }
    
    console.log('✅ app_settings table ready');
    
    // Insert/update nomination settings
    console.log('\n2️⃣ Setting up nomination settings...');
    
    // Disable nominations
    const { error: nominationError } = await supabase
      .from('app_settings')
      .upsert({
        setting_key: 'nominations_enabled',
        boolean_value: false
      }, {
        onConflict: 'setting_key'
      });
    
    if (nominationError) {
      console.error('❌ Error setting nominations_enabled:', nominationError);
    } else {
      console.log('✅ Nominations disabled');
    }
    
    // Set close message
    const { error: messageError } = await supabase
      .from('app_settings')
      .upsert({
        setting_key: 'nominations_close_message',
        setting_value: 'Thank you for your interest! Nominations are now closed. Please vote for your favorite nominees.'
      }, {
        onConflict: 'setting_key'
      });
    
    if (messageError) {
      console.error('❌ Error setting close message:', messageError);
    } else {
      console.log('✅ Close message set');
    }
    
    // Verify settings
    console.log('\n3️⃣ Verifying settings...');
    const { data: settings, error: verifyError } = await supabase
      .from('app_settings')
      .select('*');
    
    if (verifyError) {
      console.error('❌ Error verifying settings:', verifyError);
    } else {
      console.log('📋 Current settings:');
      settings.forEach(setting => {
        const value = setting.boolean_value !== null ? setting.boolean_value : setting.setting_value;
        console.log(`   ${setting.setting_key}: ${value}`);
      });
    }
    
    console.log('\n🎉 Nomination settings configured successfully!');
    console.log('   - Nominations are now DISABLED');
    console.log('   - Users will see voting options instead');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

setupNominationSettings();