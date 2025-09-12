#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function diagnoseFormSubmissionIssue() {
  console.log('🔍 Diagnosing Form Submission Issues...\n');

  // 1. Check environment variables
  console.log('1. Environment Variables Check:');
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'HUBSPOT_ACCESS_TOKEN',
    'LOOPS_API_KEY'
  ];

  const envStatus = {};
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    envStatus[envVar] = {
      exists: !!value,
      length: value ? value.length : 0,
      preview: value ? `${value.substring(0, 10)}...` : 'NOT SET'
    };
  });

  console.table(envStatus);

  // 2. Test Supabase connection
  console.log('\n2. Supabase Connection Test:');
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('nominations')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Supabase connection failed:', testError.message);
    } else {
      console.log('✅ Supabase connection successful');
    }

    // Check required tables exist
    const tables = ['nominations', 'nominees', 'nominators', 'subcategories', 'category_groups'];
    console.log('\n   Table existence check:');
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: exists`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`);
      }
    }

    // Check nomination settings
    console.log('\n   Nomination settings check:');
    try {
      const { data: systemSettings, error: systemError } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_key', 'nominations_enabled');

      if (systemError) {
        console.log('   ⚠️  system_settings table not found, checking settings table...');
        
        const { data: settings, error: settingsError } = await supabase
          .from('settings')
          .select('*');

        if (settingsError) {
          console.log('   ❌ No settings table found');
        } else {
          console.log('   ✅ settings table found:', settings);
        }
      } else {
        console.log('   ✅ system_settings found:', systemSettings);
      }
    } catch (err) {
      console.log('   ❌ Settings check failed:', err.message);
    }

  } catch (error) {
    console.error('❌ Supabase setup failed:', error.message);
  }

  // 3. Test API endpoint directly
  console.log('\n3. API Endpoint Test:');
  try {
    const testPayload = {
      type: 'person',
      categoryGroupId: 'staffing',
      subcategoryId: 'best-staffing-firm',
      nominator: {
        firstname: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        company: 'Test Company',
        jobTitle: 'Test Role',
        linkedin: '',
        phone: '',
        country: 'United States'
      },
      nominee: {
        firstname: 'Test',
        lastname: 'Nominee',
        email: 'nominee@example.com',
        jobtitle: 'Test Position',
        company: 'Test Company',
        linkedin: '',
        phone: '',
        country: 'United States',
        headshotUrl: 'https://example.com/headshot.jpg',
        whyMe: 'Test reason',
        liveUrl: 'https://example.com',
        bio: 'Test bio',
        achievements: 'Test achievements'
      },
      bypassNominationStatus: true // Admin bypass for testing
    };

    console.log('   Testing with payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch('http://localhost:3000/api/nomination/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log('   Response status:', response.status);
    console.log('   Response headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('   Response body:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ API endpoint working correctly');
    } else {
      console.log('❌ API endpoint returned error');
    }

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }

  // 4. Integration Status Summary
  console.log('\n4. Integration Status Summary:');
  console.log('   HubSpot Integration:', process.env.HUBSPOT_SYNC_ENABLED === 'true' ? '✅ Enabled' : '⚠️  Disabled');
  console.log('   Loops Integration:', process.env.LOOPS_SYNC_ENABLED === 'true' ? '✅ Enabled' : '⚠️  Disabled');
  console.log('   Email Notifications:', process.env.LOOPS_API_KEY ? '✅ Available' : '❌ Not configured');

  console.log('\n🔍 Diagnosis Complete!');
}

// Run diagnosis
diagnoseFormSubmissionIssue().catch(console.error);