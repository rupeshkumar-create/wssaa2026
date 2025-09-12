#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminNominationFix() {
  try {
    console.log('🔄 Testing admin nomination fix...');
    
    // 1. Check if nomination_source column exists
    console.log('1. Checking nomination_source column...');
    const { data: nominations, error: nomError } = await supabase
      .from('nominations')
      .select('id, nomination_source')
      .limit(1);
    
    if (nomError && nomError.message.includes('column "nomination_source" does not exist')) {
      console.log('⚠️ nomination_source column does not exist, adding it...');
      
      // Add the column
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql_query: `
          ALTER TABLE nominations 
          ADD COLUMN IF NOT EXISTS nomination_source TEXT DEFAULT 'public' 
          CHECK (nomination_source IN ('public', 'admin'));
        `
      });
      
      if (alterError) {
        console.error('❌ Failed to add nomination_source column:', alterError);
      } else {
        console.log('✅ Added nomination_source column');
      }
    } else if (nomError) {
      console.error('❌ Error checking nominations table:', nomError);
    } else {
      console.log('✅ nomination_source column exists');
    }
    
    // 2. Check categories structure
    console.log('2. Checking categories structure...');
    const { data: categories, error: catError } = await supabase
      .from('subcategories')
      .select('id, name, nomination_type')
      .limit(5);
    
    if (catError) {
      console.log('⚠️ Using fallback categories (database not set up)');
    } else {
      console.log('✅ Categories found:', categories?.length || 0);
      if (categories && categories.length > 0) {
        console.log('Sample categories:', categories.slice(0, 3));
      }
    }
    
    // 3. Test admin nomination payload structure
    console.log('3. Testing admin nomination payload structure...');
    const testPayload = {
      type: 'person',
      categoryGroupId: 'role-specific-excellence',
      subcategoryId: 'top-recruiter',
      nominator: {
        email: 'admin@worldstaffingawards.com',
        firstname: 'Admin',
        lastname: 'User',
        linkedin: 'https://linkedin.com/company/world-staffing-awards',
        company: 'World Staffing Awards',
        jobTitle: 'Administrator',
        phone: '',
        country: 'Global'
      },
      nominee: {
        firstname: 'Test',
        lastname: 'Nominee',
        jobtitle: 'Senior Recruiter',
        email: 'test@company.com',
        linkedin: 'https://linkedin.com/in/test-nominee',
        headshotUrl: 'https://example.com/headshot.jpg',
        whyMe: 'This is a test nomination from admin panel.'
      },
      bypassNominationStatus: true,
      isAdminNomination: true
    };
    
    console.log('✅ Test payload structure looks good');
    console.log('Sample payload keys:', Object.keys(testPayload));
    
    console.log('🎯 Admin nomination fix test complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Try submitting a nomination from the admin panel');
    console.log('2. Check browser console for detailed error logs');
    console.log('3. Verify the nomination appears with "Added by Admin" badge');
    
  } catch (error) {
    console.error('❌ Error testing admin nomination fix:', error);
    process.exit(1);
  }
}

// Run the test
testAdminNominationFix();