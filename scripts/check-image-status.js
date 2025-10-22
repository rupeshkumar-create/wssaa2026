#!/usr/bin/env node

/**
 * Check Image Status Script
 * Verifies current state of profile images and logos in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkImageStatus() {
  console.log('🔍 Checking current image status in database...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('\n⚠️  Supabase credentials not configured in .env.local');
    console.log('Please update your .env.local file with actual Supabase credentials to run this check.');
    console.log('\nAlternatively, you can run this SQL query directly in Supabase:');
    console.log(`
-- Check image status
SELECT 
  'Person nominees' as type,
  COUNT(*) as total,
  COUNT(CASE WHEN headshot_url IS NOT NULL AND headshot_url != '' THEN 1 END) as with_images,
  ROUND(COUNT(CASE WHEN headshot_url IS NOT NULL AND headshot_url != '' THEN 1 END) * 100.0 / COUNT(*), 1) as percentage
FROM public.nominees 
WHERE type = 'person'

UNION ALL

SELECT 
  'Company nominees' as type,
  COUNT(*) as total,
  COUNT(CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 END) as with_images,
  ROUND(COUNT(CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 END) * 100.0 / COUNT(*), 1) as percentage
FROM public.nominees 
WHERE type = 'company';
    `);
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('nominees')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }

    console.log('✅ Database connection successful\n');

    // Get person nominees statistics
    const { data: personNominees, error: personError } = await supabase
      .from('nominees')
      .select('id, firstname, lastname, person_email, headshot_url')
      .eq('type', 'person');

    if (personError) {
      console.error('❌ Error fetching person nominees:', personError.message);
      return;
    }

    // Get company nominees statistics
    const { data: companyNominees, error: companyError } = await supabase
      .from('nominees')
      .select('id, company_name, logo_url')
      .eq('type', 'company');

    if (companyError) {
      console.error('❌ Error fetching company nominees:', companyError.message);
      return;
    }

    // Analyze person nominees
    const totalPersons = personNominees.length;
    const personsWithImages = personNominees.filter(p => p.headshot_url && p.headshot_url.trim() !== '').length;
    const personPercentage = totalPersons > 0 ? ((personsWithImages / totalPersons) * 100).toFixed(1) : 0;

    // Analyze company nominees
    const totalCompanies = companyNominees.length;
    const companiesWithLogos = companyNominees.filter(c => c.logo_url && c.logo_url.trim() !== '').length;
    const companyPercentage = totalCompanies > 0 ? ((companiesWithLogos / totalCompanies) * 100).toFixed(1) : 0;

    // Display statistics
    console.log('📊 Image Status Summary:');
    console.log('┌─────────────────────┬───────┬─────────────┬────────────┐');
    console.log('│ Type                │ Total │ With Images │ Percentage │');
    console.log('├─────────────────────┼───────┼─────────────┼────────────┤');
    console.log(`│ Person nominees     │ ${totalPersons.toString().padStart(5)} │ ${personsWithImages.toString().padStart(11)} │ ${personPercentage.toString().padStart(9)}% │`);
    console.log(`│ Company nominees    │ ${totalCompanies.toString().padStart(5)} │ ${companiesWithLogos.toString().padStart(11)} │ ${companyPercentage.toString().padStart(9)}% │`);
    console.log('└─────────────────────┴───────┴─────────────┴────────────┘');

    // Show examples of nominees with images
    if (personsWithImages > 0) {
      console.log('\n👤 Sample person nominees with images:');
      const samplesWithImages = personNominees
        .filter(p => p.headshot_url && p.headshot_url.trim() !== '')
        .slice(0, 5);
      
      samplesWithImages.forEach(person => {
        console.log(`  ✅ ${person.firstname} ${person.lastname} (${person.person_email})`);
      });
    }

    if (companiesWithLogos > 0) {
      console.log('\n🏢 Sample company nominees with logos:');
      const companySamplesWithLogos = companyNominees
        .filter(c => c.logo_url && c.logo_url.trim() !== '')
        .slice(0, 5);
      
      companySamplesWithLogos.forEach(company => {
        console.log(`  ✅ ${company.company_name}`);
      });
    }

    // Show examples of nominees without images
    const personsWithoutImages = personNominees.filter(p => !p.headshot_url || p.headshot_url.trim() === '');
    const companiesWithoutLogos = companyNominees.filter(c => !c.logo_url || c.logo_url.trim() === '');

    if (personsWithoutImages.length > 0) {
      console.log('\n❌ Sample person nominees without images:');
      personsWithoutImages.slice(0, 5).forEach(person => {
        console.log(`  ⚠️  ${person.firstname} ${person.lastname} (${person.person_email || 'No email'})`);
      });
    }

    if (companiesWithoutLogos.length > 0) {
      console.log('\n❌ Sample company nominees without logos:');
      companiesWithoutLogos.slice(0, 5).forEach(company => {
        console.log(`  ⚠️  ${company.company_name}`);
      });
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (personsWithImages < totalPersons) {
      console.log(`  • Update ${totalPersons - personsWithImages} person nominee(s) missing profile images`);
    }
    if (companiesWithLogos < totalCompanies) {
      console.log(`  • Update ${totalCompanies - companiesWithLogos} company nominee(s) missing logos`);
    }
    if (personsWithImages === totalPersons && companiesWithLogos === totalCompanies) {
      console.log('  🎉 All nominees have images! Great job!');
    }

    console.log('\n📝 Next Steps:');
    console.log('  1. Run UPDATE_LEADER_PROFILE_IMAGES.sql in Supabase SQL Editor');
    console.log('  2. Or use: node scripts/update-leader-profile-images.js');
    console.log('  3. Verify images display correctly in the application');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the check
if (require.main === module) {
  checkImageStatus().catch(console.error);
}

module.exports = { checkImageStatus };