// Simple test to check admin nominations API and photo URLs
async function testAdminPhotos() {
  console.log('🔍 Testing admin nominations API and photo display...');
  
  try {
    // Test the admin nominations API
    console.log('📡 Fetching nominations from API...');
    const response = await fetch('http://localhost:3000/api/admin/nominations-improved');
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✅ API Response: ${result.success ? 'Success' : 'Failed'}`);
    console.log(`📊 Total nominations: ${result.data?.length || 0}`);
    
    if (result.data && result.data.length > 0) {
      console.log('\n🖼️ Photo/Image Analysis:');
      
      result.data.forEach((nomination, index) => {
        const name = nomination.type === 'person' 
          ? `${nomination.firstname || ''} ${nomination.lastname || ''}`.trim()
          : nomination.companyName || nomination.company_name || 'Unknown';
          
        console.log(`\n${index + 1}. ${name} (${nomination.type})`);
        console.log(`   Status: ${nomination.state}`);
        
        // Check all possible image fields
        const imageFields = [
          { field: 'imageUrl', value: nomination.imageUrl },
          { field: 'headshotUrl', value: nomination.headshotUrl },
          { field: 'headshot_url', value: nomination.headshot_url },
          { field: 'logoUrl', value: nomination.logoUrl },
          { field: 'logo_url', value: nomination.logo_url }
        ];
        
        const hasImages = imageFields.filter(field => field.value);
        
        if (hasImages.length > 0) {
          console.log('   📸 Images found:');
          hasImages.forEach(img => {
            console.log(`     ${img.field}: ${img.value}`);
          });
        } else {
          console.log('   ❌ No images found - will show fallback icon');
        }
      });
      
      // Test a few image URLs directly
      console.log('\n🌐 Testing image URL accessibility:');
      const imageUrls = result.data
        .map(nom => nom.imageUrl || nom.headshotUrl || nom.headshot_url || nom.logoUrl || nom.logo_url)
        .filter(Boolean)
        .slice(0, 3); // Test first 3 images
        
      for (const imageUrl of imageUrls) {
        try {
          const fullUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:3000${imageUrl}`;
          const imgResponse = await fetch(fullUrl, { method: 'HEAD' });
          console.log(`   ${imageUrl}: ${imgResponse.ok ? '✅ Accessible' : '❌ Not accessible'} (${imgResponse.status})`);
        } catch (error) {
          console.log(`   ${imageUrl}: ❌ Error - ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAdminPhotos();