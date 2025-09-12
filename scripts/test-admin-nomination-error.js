const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testAdminNomination() {
  console.log('🧪 Testing admin nomination with Rupesh Kumar data...');
  
  // Simulate the exact payload from the admin form
  const testPayload = {
    type: 'person',
    categoryGroupId: 'staffing', // You'll need to get the actual ID
    subcategoryId: 'best-staffing-firm', // You'll need to get the actual ID
    nominator: {
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@worldstaffingawards.com',
      linkedin: '',
      company: 'World Staffing Awards',
      jobTitle: 'Administrator',
      phone: '',
      country: 'Global'
    },
    nominee: {
      firstname: 'Rupesh',
      lastname: 'Kumar',
      jobtitle: 'Test Position',
      email: 'Rupesh.kumar@candidate.ly',
      linkedin: '',
      phone: '',
      company: '',
      country: '',
      headshotUrl: '', // This is likely the issue - empty string instead of required URL
      whyMe: 'Test reason for nomination',
      bio: '',
      achievements: ''
    },
    adminNotes: 'Test admin nomination',
    bypassNominationStatus: true,
    isAdminNomination: true
  };

  try {
    // First, let's get actual category IDs
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: categories } = await supabase
      .from('subcategories')
      .select('id, name, category_groups(id, name)')
      .limit(5);
      
    console.log('📋 Available categories:', categories?.map(c => ({
      id: c.id,
      name: c.name,
      group: c.category_groups?.name
    })));
    
    if (categories && categories.length > 0) {
      // Use the first available category
      testPayload.subcategoryId = categories[0].id;
      testPayload.categoryGroupId = categories[0].category_groups.id;
      
      console.log('🎯 Using category:', {
        subcategoryId: testPayload.subcategoryId,
        categoryGroupId: testPayload.categoryGroupId
      });
    }

    // Test the API call
    const response = await fetch('http://localhost:3000/api/nomination/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    
    console.log('📤 Response status:', response.status);
    console.log('📤 Response body:', JSON.stringify(result, null, 2));
    
    if (!response.ok) {
      console.error('❌ API call failed');
      if (result.details) {
        console.error('🔍 Validation errors:', result.details);
      }
    } else {
      console.log('✅ API call succeeded');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminNomination().catch(console.error);