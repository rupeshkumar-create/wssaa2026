#!/usr/bin/env node

/**
 * Test Supabase Connection and Verify Updated Images
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseAndImages() {
  console.log('🔍 Testing Supabase connection and verifying updated images...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    console.log('❌ Supabase credentials not properly configured');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection and get nominees with images
    console.log('\n📊 Checking nominees with images...');
    
    const { data: personNominees, error: personError } = await supabase
      .from('nominees')
      .select('id, firstname, lastname, person_email, headshot_url, jobtitle, person_company')
      .eq('type', 'person')
      .not('headshot_url', 'is', null)
      .neq('headshot_url', '');

    if (personError) {
      console.error('❌ Error fetching person nominees:', personError.message);
      return;
    }

    console.log(`✅ Found ${personNominees.length} person nominees with images:`);
    personNominees.forEach((person, index) => {
      console.log(`  ${index + 1}. ${person.firstname} ${person.lastname} (${person.person_company || 'No company'})`);
      console.log(`     📧 ${person.person_email || 'No email'}`);
      console.log(`     🖼️  ${person.headshot_url ? 'Has image' : 'No image'}`);
      console.log('');
    });

    // Check company nominees
    const { data: companyNominees, error: companyError } = await supabase
      .from('nominees')
      .select('id, company_name, logo_url, company_industry')
      .eq('type', 'company')
      .not('logo_url', 'is', null)
      .neq('logo_url', '');

    if (companyError) {
      console.error('❌ Error fetching company nominees:', companyError.message);
      return;
    }

    console.log(`✅ Found ${companyNominees.length} company nominees with logos:`);
    companyNominees.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.company_name}`);
      console.log(`     🏢 ${company.company_industry || 'No industry'}`);
      console.log(`     🖼️  ${company.logo_url ? 'Has logo' : 'No logo'}`);
      console.log('');
    });

    // Test the public view
    console.log('🌐 Testing public nominees view...');
    
    const { data: publicNominees, error: publicError } = await supabase
      .from('public_nominees')
      .select('*')
      .not('image_url', 'is', null)
      .neq('image_url', '')
      .limit(10);

    if (publicError) {
      console.log('⚠️  Public nominees view error:', publicError.message);
    } else {
      console.log(`✅ Public view: ${publicNominees.length} nominees with images visible`);
      
      publicNominees.slice(0, 5).forEach((nominee, index) => {
        console.log(`  ${index + 1}. ${nominee.display_name} - ${nominee.type}`);
      });
    }

    // Test specific leaders we updated
    console.log('\n🎯 Verifying specific updated leaders...');
    
    const testEmails = [
      'rnair@eteaminc.com',
      'justin.christian@bcforward.com',
      'aholahan@idr-inc.com',
      'namrata.anand@talentburst.com',
      'michelled@travelnursesinc.com'
    ];

    for (const email of testEmails) {
      const { data: nominee, error } = await supabase
        .from('nominees')
        .select('firstname, lastname, headshot_url, person_company')
        .eq('person_email', email)
        .single();

      if (error) {
        console.log(`❌ ${email}: Not found`);
      } else {
        const hasImage = nominee.headshot_url && nominee.headshot_url.trim() !== '';
        console.log(`${hasImage ? '✅' : '❌'} ${nominee.firstname} ${nominee.lastname} (${nominee.person_company}): ${hasImage ? 'Has image' : 'No image'}`);
      }
    }

    console.log('\n🎉 Verification completed!');
    console.log('\n🌐 Test the application:');
    console.log('  • Home: http://localhost:3000');
    console.log('  • Nominees: http://localhost:3000/nominees');
    console.log('  • Directory: http://localhost:3000/directory');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testSupabaseAndImages().catch(console.error);
}

module.exports = { testSupabaseAndImages };