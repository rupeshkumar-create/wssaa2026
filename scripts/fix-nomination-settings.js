#!/usr/bin/env node

/**
 * Fix nomination settings using the existing table structure
 */

const { createClient } = require('@supabase/supabase-js');

async function fixNominationSettings() {
  console.log('🔧 Fixing nomination settings...\n');
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Check current table structure
    console.log('1️⃣ Checking current app_settings structure...');
    const { data: settings, error: selectError } = await supabase
      .from('app_settings')
      .select('*')
      .limit(5);
    
    if (selectError) {
      console.error('❌ Error reading settings:', selectError);
      return;
    }
    
    console.log('📋 Current settings in table:');
    settings.forEach(setting => {
      console.log(`   ${setting.setting_key}: ${setting.setting_value}`);
    });
    
    // Check if nominations_enabled exists
    const nominationsEnabledSetting = settings.find(s => s.setting_key === 'nominations_enabled');
    
    if (nominationsEnabledSetting) {
      console.log('\n2️⃣ Updating existing nominations_enabled setting...');
      const { error: updateError } = await supabase
        .from('app_settings')
        .update({ setting_value: 'false' })
        .eq('setting_key', 'nominations_enabled');
      
      if (updateError) {
        console.error('❌ Error updating nominations_enabled:', updateError);
      } else {
        console.log('✅ Updated nominations_enabled to false');
      }
    } else {
      console.log('\n2️⃣ Creating nominations_enabled setting...');
      const { error: insertError } = await supabase
        .from('app_settings')
        .insert({
          setting_key: 'nominations_enabled',
          setting_value: 'false'
        });
      
      if (insertError) {
        console.error('❌ Error creating nominations_enabled:', insertError);
      } else {
        console.log('✅ Created nominations_enabled = false');
      }
    }
    
    // Check if close message exists
    const closeMessageSetting = settings.find(s => s.setting_key === 'nominations_close_message');
    
    if (closeMessageSetting) {
      console.log('\n3️⃣ Updating close message...');
      const { error: updateError } = await supabase
        .from('app_settings')
        .update({ 
          setting_value: 'Thank you for your interest! Nominations are now closed. Please vote for your favorite nominees.' 
        })
        .eq('setting_key', 'nominations_close_message');
      
      if (updateError) {
        console.error('❌ Error updating close message:', updateError);
      } else {
        console.log('✅ Updated close message');
      }
    } else {
      console.log('\n3️⃣ Creating close message...');
      const { error: insertError } = await supabase
        .from('app_settings')
        .insert({
          setting_key: 'nominations_close_message',
          setting_value: 'Thank you for your interest! Nominations are now closed. Please vote for your favorite nominees.'
        });
      
      if (insertError) {
        console.error('❌ Error creating close message:', insertError);
      } else {
        console.log('✅ Created close message');
      }
    }
    
    // Verify final settings
    console.log('\n4️⃣ Verifying final settings...');
    const { data: finalSettings, error: finalError } = await supabase
      .from('app_settings')
      .select('*')
      .in('setting_key', ['nominations_enabled', 'nominations_close_message']);
    
    if (finalError) {
      console.error('❌ Error verifying final settings:', finalError);
    } else {
      console.log('📋 Final nomination settings:');
      finalSettings.forEach(setting => {
        console.log(`   ${setting.setting_key}: ${setting.setting_value}`);
      });
    }
    
    console.log('\n🎉 Nomination settings fixed successfully!');
    console.log('   - Nominations should now be DISABLED');
    console.log('   - Test the API: curl https://wssaa2026.vercel.app/api/settings');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixNominationSettings();