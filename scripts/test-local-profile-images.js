#!/usr/bin/env node

/**
 * Test Local Profile Images
 * Check current profile images and test the update functionality locally
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testLocalProfileImages() {
  console.log('🔍 Testing local profile images...');

  // Check if we're running locally
  const isLocal = process.env.NODE_ENV !== 'production';
  console.log(`Environment: ${isLocal ? 'Local Development' : 'Production'}`);

  // Test API endpoints first
  console.log('\n🌐 Testing API endpoints...');
  
  try {
    // Test nominees API
    const nomineesResponse = await fetch('http://localhost:3000/api/nominees?limit=10');
    if (nomineesResponse.ok) {
      const nominees = await nomineesResponse.json();
      console.log(`✅ Nominees API working - Found ${nominees.length} nominees`);
      
      // Check for images in nominees
      const nomineesWithImages = nominees.filter(n => n.image_url && n.image_url.trim() !== '');
      console.log(`📸 Nominees with images: ${nomineesWithImages.length}/${nominees.length}`);
      
      if (nomineesWithImages.length > 0) {
        console.log('\nSample nominees with images:');
        nomineesWithImages.slice(0, 3).forEach(nominee => {
          console.log(`  ✅ ${nominee.display_name} - ${nominee.image_url ? 'Has image' : 'No image'}`);
        });
      }
      
      const nomineesWithoutImages = nominees.filter(n => !n.image_url || n.image_url.trim() === '');
      if (nomineesWithoutImages.length > 0) {
        console.log('\nSample nominees without images:');
        nomineesWithoutImages.slice(0, 3).forEach(nominee => {
          console.log(`  ❌ ${nominee.display_name} - No image`);
        });
      }
    } else {
      console.log('❌ Nominees API not responding');
    }
  } catch (error) {
    console.log('❌ Error testing API:', error.message);
  }

  // Test database connection if credentials are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
    console.log('\n🔗 Testing database connection...');
    
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: nominees, error } = await supabase
        .from('nominees')
        .select('id, type, firstname, lastname, company_name, headshot_url, logo_url')
        .limit(10);

      if (error) {
        console.log('❌ Database connection failed:', error.message);
      } else {
        console.log('✅ Database connection successful');
        
        const personNominees = nominees.filter(n => n.type === 'person');
        const companyNominees = nominees.filter(n => n.type === 'company');
        
        const personsWithImages = personNominees.filter(p => p.headshot_url && p.headshot_url.trim() !== '');
        const companiesWithLogos = companyNominees.filter(c => c.logo_url && c.logo_url.trim() !== '');
        
        console.log(`\n📊 Database Statistics:`);
        console.log(`  👤 Person nominees: ${personNominees.length} (${personsWithImages.length} with images)`);
        console.log(`  🏢 Company nominees: ${companyNominees.length} (${companiesWithLogos.length} with logos)`);
        
        // Show some examples
        if (personsWithImages.length > 0) {
          console.log('\n✅ Sample persons with images:');
          personsWithImages.slice(0, 2).forEach(person => {
            console.log(`  ${person.firstname} ${person.lastname}`);
          });
        }
        
        if (companiesWithLogos.length > 0) {
          console.log('\n✅ Sample companies with logos:');
          companiesWithLogos.slice(0, 2).forEach(company => {
            console.log(`  ${company.company_name}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ Database test failed:', error.message);
    }
  } else {
    console.log('\n⚠️  Supabase credentials not configured or using placeholder values');
    console.log('To test database functionality, update your .env.local with actual credentials');
  }

  // Test local data layer
  console.log('\n💾 Testing local data layer...');
  
  try {
    // Test if we can access the local data
    const fs = require('fs');
    const path = require('path');
    
    const dataPath = path.join(process.cwd(), 'data', 'nominations.json');
    if (fs.existsSync(dataPath)) {
      const localData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      console.log(`✅ Local data file found with ${localData.length} nominations`);
      
      // Check for images in local data
      const withImages = localData.filter(n => n.headshot_url || n.logo_url);
      console.log(`📸 Local nominations with images: ${withImages.length}/${localData.length}`);
    } else {
      console.log('⚠️  No local data file found');
    }
  } catch (error) {
    console.log('❌ Error checking local data:', error.message);
  }

  // Recommendations
  console.log('\n💡 Next Steps:');
  console.log('1. 🌐 Open http://localhost:3000 to view the application');
  console.log('2. 🔍 Check the nominees page to see current images');
  console.log('3. 📝 To update images:');
  console.log('   - Run the SQL script: UPDATE_LEADER_PROFILE_IMAGES.sql in Supabase');
  console.log('   - Or use: node scripts/update-leader-profile-images.js');
  console.log('4. 🔄 Refresh the page to see updated images');
  
  console.log('\n🎯 Test URLs:');
  console.log('  • Home: http://localhost:3000');
  console.log('  • Nominees: http://localhost:3000/nominees');
  console.log('  • Directory: http://localhost:3000/directory');
  console.log('  • Admin: http://localhost:3000/admin');
}

// Run the test
if (require.main === module) {
  testLocalProfileImages().catch(console.error);
}

module.exports = { testLocalProfileImages };