#!/usr/bin/env node

/**
 * Test Database Connection and Update Profile Images
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testAndUpdateImages() {
  console.log('🔍 Testing database connection and updating profile images...');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Environment check:');
  console.log(`- Supabase URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`- Service Key: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);

  if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Missing Supabase credentials in .env.local');
    console.log('\nPlease update your .env.local file with:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection
    console.log('\n🔗 Testing database connection...');
    const { data, error } = await supabase
      .from('nominees')
      .select('id, type, firstname, lastname, company_name')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }

    console.log('✅ Database connection successful');
    console.log(`Found ${data.length} nominee(s) in database`);

    // Check current image status
    console.log('\n📊 Checking current image status...');
    
    const { data: personStats } = await supabase
      .from('nominees')
      .select('id, headshot_url')
      .eq('type', 'person');

    const { data: companyStats } = await supabase
      .from('nominees')
      .select('id, logo_url')
      .eq('type', 'company');

    const personsWithImages = personStats?.filter(p => p.headshot_url && p.headshot_url.trim() !== '').length || 0;
    const companiesWithLogos = companyStats?.filter(c => c.logo_url && c.logo_url.trim() !== '').length || 0;

    console.log(`- Person nominees: ${personStats?.length || 0} total, ${personsWithImages} with images`);
    console.log(`- Company nominees: ${companyStats?.length || 0} total, ${companiesWithLogos} with logos`);

    // Sample updates (just a few to test)
    console.log('\n🖼️  Updating sample profile images...');

    const sampleUpdates = [
      {
        email: 'rnair@eteaminc.com',
        name: 'Ranjit Nair',
        image: 'https://media.licdn.com/dms/image/v2/D4E03AQHzClKhhF8Zxg/profile-displayphoto-shrink_400_400/B4EZimjCj6GcAk-/0/1755140864736?e=1762992000&v=beta&t=fg15C-1qWKk1XyI_Ox-NcDX6oW2jXXSM9U6WDBfMGUI'
      },
      {
        email: 'justin.christian@bcforward.com',
        name: 'Justin Christian',
        image: 'https://media.licdn.com/dms/image/v2/C4E03AQHry6wHEX2ZFw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1543945656128?e=1762992000&v=beta&t=8PZZCe8Fv_DBCM_F-M3H3wWRH4bVdwwc6fodxFcw6fw'
      },
      {
        email: 'aholahan@idr-inc.com',
        name: 'Ashley Holahan',
        image: 'https://media.licdn.com/dms/image/v2/D4E03AQELw88pkji_ow/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1713527926306?e=1762992000&v=beta&t=L9zBJYAB3TdB_AAZKrvdOniHP3G2i-1GFeerh_HHW3Y'
      }
    ];

    let updateCount = 0;

    for (const update of sampleUpdates) {
      try {
        const { data: nominees, error: findError } = await supabase
          .from('nominees')
          .select('id, firstname, lastname, person_email')
          .eq('type', 'person')
          .eq('person_email', update.email);

        if (findError) {
          console.log(`❌ Error finding ${update.name}: ${findError.message}`);
          continue;
        }

        if (!nominees || nominees.length === 0) {
          console.log(`⚠️  No nominee found for ${update.name} (${update.email})`);
          continue;
        }

        const nominee = nominees[0];
        
        const { error: updateError } = await supabase
          .from('nominees')
          .update({ 
            headshot_url: update.image,
            updated_at: new Date().toISOString()
          })
          .eq('id', nominee.id);

        if (updateError) {
          console.log(`❌ Error updating ${update.name}: ${updateError.message}`);
          continue;
        }

        console.log(`✅ Updated ${update.name}`);
        updateCount++;

      } catch (error) {
        console.log(`❌ Unexpected error for ${update.name}: ${error.message}`);
      }
    }

    // Sample company logo updates
    console.log('\n🏢 Updating sample company logos...');

    const companyUpdates = [
      {
        name: 'eTeam',
        logo: 'https://media.licdn.com/dms/image/v2/D560BAQHIX6ke6qNgVg/company-logo_200_200/company-logo_200_200/0/1719820690492/eteam_logo?e=1762992000&v=beta&t=Gz1TvU_57WOiI0C3XgDcMSPR5bBJkoWEdA-wgBYmPNM'
      },
      {
        name: 'BCforward',
        logo: 'https://media.licdn.com/dms/image/v2/D560BAQF-58cvJAABug/company-logo_200_200/company-logo_200_200/0/1708016840492/bcforward_logo?e=1762992000&v=beta&t=Dbfg3ag4cG-0drIIBqYnAs2_oTrK7unSktDM1FvcUK8'
      }
    ];

    for (const update of companyUpdates) {
      try {
        const { data: companies, error: findError } = await supabase
          .from('nominees')
          .select('id, company_name')
          .eq('type', 'company')
          .ilike('company_name', `%${update.name}%`);

        if (findError) {
          console.log(`❌ Error finding company ${update.name}: ${findError.message}`);
          continue;
        }

        if (!companies || companies.length === 0) {
          console.log(`⚠️  No company found for ${update.name}`);
          continue;
        }

        for (const company of companies) {
          const { error: updateError } = await supabase
            .from('nominees')
            .update({ 
              logo_url: update.logo,
              updated_at: new Date().toISOString()
            })
            .eq('id', company.id);

          if (updateError) {
            console.log(`❌ Error updating company ${company.company_name}: ${updateError.message}`);
            continue;
          }

          console.log(`✅ Updated company logo for ${company.company_name}`);
          updateCount++;
        }

      } catch (error) {
        console.log(`❌ Unexpected error for company ${update.name}: ${error.message}`);
      }
    }

    console.log(`\n📊 Update Summary: ${updateCount} images updated`);

    // Verify updates
    console.log('\n🔍 Verifying updates...');
    
    const { data: updatedPersons } = await supabase
      .from('nominees')
      .select('firstname, lastname, headshot_url')
      .eq('type', 'person')
      .not('headshot_url', 'is', null)
      .neq('headshot_url', '')
      .limit(5);

    const { data: updatedCompanies } = await supabase
      .from('nominees')
      .select('company_name, logo_url')
      .eq('type', 'company')
      .not('logo_url', 'is', null)
      .neq('logo_url', '')
      .limit(5);

    console.log('\nSample updated nominees:');
    updatedPersons?.forEach(person => {
      console.log(`  👤 ${person.firstname} ${person.lastname}: ✅ Has image`);
    });

    updatedCompanies?.forEach(company => {
      console.log(`  🏢 ${company.company_name}: ✅ Has logo`);
    });

    console.log('\n🎉 Profile image update test completed!');
    console.log('\n💡 To update all images, run the SQL script: UPDATE_LEADER_PROFILE_IMAGES.sql');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testAndUpdateImages().catch(console.error);
}

module.exports = { testAndUpdateImages };