#!/usr/bin/env node

/**
 * Update Local Profile Images
 * Updates profile images for leaders using the provided LinkedIn data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Sample of the leaders data you provided
const sampleLeadersData = [
  {
    "Company Name": "eTeam",
    "First Name": "Ranjit",
    "Last Name": "Nair",
    "Email Address": "rnair@eteaminc.com",
    "Profile Pic": "https://media.licdn.com/dms/image/v2/D4E03AQHzClKhhF8Zxg/profile-displayphoto-shrink_400_400/B4EZimjCj6GcAk-/0/1755140864736?e=1762992000&v=beta&t=fg15C-1qWKk1XyI_Ox-NcDX6oW2jXXSM9U6WDBfMGUI"
  },
  {
    "Company Name": "BCforward",
    "First Name": "Justin",
    "Last Name": "Christian",
    "Email Address": "justin.christian@bcforward.com",
    "Profile Pic": "https://media.licdn.com/dms/image/v2/C4E03AQHry6wHEX2ZFw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1543945656128?e=1762992000&v=beta&t=8PZZCe8Fv_DBCM_F-M3H3wWRH4bVdwwc6fodxFcw6fw"
  },
  {
    "Company Name": "IDR",
    "First Name": "Ashley",
    "Last Name": "Holahan",
    "Email Address": "aholahan@idr-inc.com",
    "Profile Pic": "https://media.licdn.com/dms/image/v2/D4E03AQELw88pkji_ow/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1713527926306?e=1762992000&v=beta&t=L9zBJYAB3TdB_AAZKrvdOniHP3G2i-1GFeerh_HHW3Y"
  },
  {
    "Company Name": "TalentBurst",
    "First Name": "Namrata",
    "Last Name": "Anand",
    "Email Address": "namrata.anand@talentburst.com",
    "Profile Pic": "https://media.licdn.com/dms/image/v2/D4E03AQGFel9C8R90UQ/profile-displayphoto-shrink_400_400/B4EZR02zXKGgAs-/0/1737127311196?e=1762992000&v=beta&t=nggVG1GRQuGQaCE4zUDxHx-J7NjJVso6FBlbJJmzPmQ"
  },
  {
    "Company Name": "Travel Nurses",
    "First Name": "Michelle",
    "Last Name": "Davis",
    "Email Address": "michelled@travelnursesinc.com",
    "Profile Pic": "https://media.licdn.com/dms/image/v2/C4E03AQFB2565Glpwuw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517714039673?e=1762992000&v=beta&t=JG0Ur72But7zFcEws_MeQ9Xq3iyDBkY1SWTnbYKb5WA"
  }
];

// Sample company logos
const sampleCompanyLogos = [
  {
    "Company Name": "eTeam",
    "Logo": "https://media.licdn.com/dms/image/v2/D560BAQHIX6ke6qNgVg/company-logo_200_200/company-logo_200_200/0/1719820690492/eteam_logo?e=1762992000&v=beta&t=Gz1TvU_57WOiI0C3XgDcMSPR5bBJkoWEdA-wgBYmPNM"
  },
  {
    "Company Name": "BCforward",
    "Logo": "https://media.licdn.com/dms/image/v2/D560BAQF-58cvJAABug/company-logo_200_200/company-logo_200_200/0/1708016840492/bcforward_logo?e=1762992000&v=beta&t=Dbfg3ag4cG-0drIIBqYnAs2_oTrK7unSktDM1FvcUK8"
  },
  {
    "Company Name": "TalentBurst",
    "Logo": "https://media.licdn.com/dms/image/v2/D560BAQH7m2F4U2QHgA/company-logo_200_200/company-logo_200_200/0/1708538368421/talentburst_logo?e=1762992000&v=beta&t=gO61e80yKB4xx3uRRXYfZ8_4snYIXS0D-0v9q6Ctyz8"
  }
];

async function updateLocalProfileImages() {
  console.log('🚀 Updating local profile images...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    console.log('⚠️  Supabase credentials not configured. Using local data updates...');
    await updateLocalDataFile();
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  let updateCount = 0;

  console.log('\n📸 Updating person nominee profile images...');

  // Update person nominees
  for (const leader of sampleLeadersData) {
    const email = leader['Email Address'];
    const profilePic = leader['Profile Pic'];
    const firstName = leader['First Name'];
    const lastName = leader['Last Name'];

    if (!email || !profilePic) {
      console.log(`⚠️  Skipping ${firstName} ${lastName} - missing data`);
      continue;
    }

    try {
      // Find nominee by email
      const { data: nominees, error: findError } = await supabase
        .from('nominees')
        .select('id, firstname, lastname, person_email, headshot_url')
        .eq('type', 'person')
        .eq('person_email', email);

      if (findError) {
        console.log(`❌ Error finding ${firstName} ${lastName}: ${findError.message}`);
        continue;
      }

      if (!nominees || nominees.length === 0) {
        // Try to create a new nominee
        console.log(`➕ Creating new nominee: ${firstName} ${lastName}`);
        
        const { error: createError } = await supabase
          .from('nominees')
          .insert({
            type: 'person',
            firstname: firstName,
            lastname: lastName,
            person_email: email,
            headshot_url: profilePic,
            jobtitle: 'Leader', // Default title
            person_company: leader['Company Name']
          });

        if (createError) {
          console.log(`❌ Error creating ${firstName} ${lastName}: ${createError.message}`);
        } else {
          console.log(`✅ Created ${firstName} ${lastName}`);
          updateCount++;
        }
        continue;
      }

      const nominee = nominees[0];
      
      // Update headshot URL
      const { error: updateError } = await supabase
        .from('nominees')
        .update({ 
          headshot_url: profilePic,
          updated_at: new Date().toISOString()
        })
        .eq('id', nominee.id);

      if (updateError) {
        console.log(`❌ Error updating ${firstName} ${lastName}: ${updateError.message}`);
        continue;
      }

      console.log(`✅ Updated ${firstName} ${lastName}`);
      updateCount++;

    } catch (error) {
      console.log(`❌ Unexpected error for ${firstName} ${lastName}: ${error.message}`);
    }
  }

  console.log('\n🏢 Updating company logos...');

  // Update company logos
  for (const company of sampleCompanyLogos) {
    const companyName = company['Company Name'];
    const logo = company['Logo'];

    if (!companyName || !logo) {
      console.log(`⚠️  Skipping ${companyName} - missing data`);
      continue;
    }

    try {
      // Find company by name
      const { data: companies, error: findError } = await supabase
        .from('nominees')
        .select('id, company_name, logo_url')
        .eq('type', 'company')
        .ilike('company_name', `%${companyName}%`);

      if (findError) {
        console.log(`❌ Error finding company ${companyName}: ${findError.message}`);
        continue;
      }

      if (!companies || companies.length === 0) {
        // Create new company nominee
        console.log(`➕ Creating new company: ${companyName}`);
        
        const { error: createError } = await supabase
          .from('nominees')
          .insert({
            type: 'company',
            company_name: companyName,
            logo_url: logo,
            company_industry: 'Staffing & Recruiting'
          });

        if (createError) {
          console.log(`❌ Error creating company ${companyName}: ${createError.message}`);
        } else {
          console.log(`✅ Created company ${companyName}`);
          updateCount++;
        }
        continue;
      }

      // Update existing companies
      for (const comp of companies) {
        const { error: updateError } = await supabase
          .from('nominees')
          .update({ 
            logo_url: logo,
            updated_at: new Date().toISOString()
          })
          .eq('id', comp.id);

        if (updateError) {
          console.log(`❌ Error updating company ${comp.company_name}: ${updateError.message}`);
          continue;
        }

        console.log(`✅ Updated company ${comp.company_name}`);
        updateCount++;
      }

    } catch (error) {
      console.log(`❌ Unexpected error for company ${companyName}: ${error.message}`);
    }
  }

  console.log(`\n📊 Update Summary: ${updateCount} images updated`);

  // Test the API to see the changes
  console.log('\n🔍 Testing updated data...');
  try {
    const response = await fetch('http://localhost:3000/api/nominees?limit=10');
    if (response.ok) {
      const nominees = await response.json();
      const withImages = nominees.filter(n => n.image_url && n.image_url.trim() !== '');
      console.log(`✅ API test: ${withImages.length}/${nominees.length} nominees now have images`);
    }
  } catch (error) {
    console.log('⚠️  Could not test API:', error.message);
  }

  console.log('\n🎉 Profile image update completed!');
  console.log('🌐 Visit http://localhost:3000 to see the updated images');
}

async function updateLocalDataFile() {
  console.log('📝 Updating local data file...');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const dataPath = path.join(process.cwd(), 'data', 'nominations.json');
    if (!fs.existsSync(dataPath)) {
      console.log('❌ Local data file not found');
      return;
    }

    const localData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    let updateCount = 0;

    // Update local data with profile images
    for (const leader of sampleLeadersData) {
      const email = leader['Email Address'];
      const profilePic = leader['Profile Pic'];
      
      const nominee = localData.find(n => 
        n.nominee_email === email || 
        (n.nominee_first_name === leader['First Name'] && n.nominee_last_name === leader['Last Name'])
      );
      
      if (nominee) {
        nominee.headshot_url = profilePic;
        nominee.image_url = profilePic;
        updateCount++;
        console.log(`✅ Updated ${leader['First Name']} ${leader['Last Name']} in local data`);
      }
    }

    // Save updated data
    fs.writeFileSync(dataPath, JSON.stringify(localData, null, 2));
    console.log(`📊 Updated ${updateCount} nominees in local data file`);
    
  } catch (error) {
    console.log('❌ Error updating local data:', error.message);
  }
}

// Run the update
if (require.main === module) {
  updateLocalProfileImages().catch(console.error);
}

module.exports = { updateLocalProfileImages };