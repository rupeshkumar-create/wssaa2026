#!/usr/bin/env node

/**
 * Check if voting_start_date setting exists in database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkVotingSetting() {
  console.log('🔍 Checking voting_start_date setting in database\n');

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase environment variables not found');
      console.log('Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if system_settings table exists by trying to query it
    console.log('1️⃣ Checking if system_settings table exists...');
    const { data: testQuery, error: tablesError } = await supabase
      .from('system_settings')
      .select('setting_key')
      .limit(1);

    if (tablesError) {
      console.error('❌ system_settings table does not exist:', tablesError);
      console.log('You need to run the SQL schema first!');
      console.log('Run this SQL in Supabase:');
      console.log('INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES (\'voting_start_date\', \'\', \'Date when voting will open (ISO format)\') ON CONFLICT (setting_key) DO NOTHING;');
      return;
    }

    console.log('✅ system_settings table exists');

    // Check all settings
    console.log('\n2️⃣ Checking all settings in system_settings...');
    const { data: allSettings, error: allError } = await supabase
      .from('system_settings')
      .select('*');

    if (allError) {
      console.error('❌ Error fetching settings:', allError);
      return;
    }

    console.log('All settings in database:');
    allSettings.forEach(setting => {
      console.log(`  - ${setting.setting_key}: "${setting.setting_value}"`);
    });

    // Check specifically for voting_start_date
    console.log('\n3️⃣ Checking voting_start_date setting...');
    const { data: votingSetting, error: votingError } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', 'voting_start_date')
      .single();

    if (votingError) {
      console.error('❌ voting_start_date setting not found:', votingError);
      console.log('You need to run: INSERT INTO system_settings (setting_key, setting_value, description) VALUES (\'voting_start_date\', \'\', \'Date when voting will open\');');
      return;
    }

    console.log('✅ voting_start_date setting found:');
    console.log('  Value:', votingSetting.setting_value);
    console.log('  Description:', votingSetting.description);

    // Test the logic
    if (votingSetting.setting_value) {
      const now = new Date();
      const start = new Date(votingSetting.setting_value);
      
      console.log('\n4️⃣ Testing logic...');
      console.log('Current Time:', now.toISOString());
      console.log('Voting Start Time:', start.toISOString());
      console.log('Is Voting Open (now >= start):', now >= start);
      console.log('Should Show "Nominate Now" (now < start):', now < start);
    } else {
      console.log('\n⚠️ voting_start_date is empty - voting will be closed by default');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkVotingSetting();