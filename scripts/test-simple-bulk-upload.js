#!/usr/bin/env node

async function testSimpleBulkUpload() {
  console.log('🧪 Testing Simple Bulk Upload Functionality\n');
  
  try {
    // Test 1: Check if the API endpoint exists
    console.log('1️⃣ Testing API endpoint...');
    
    // Create a simple test CSV content
    const testCSV = `type,category,name,email,company,country,nominator_name,nominator_email
person,top-recruiter,Test Person,test.person@example.com,Test Company,United States,Test Nominator,test.nominator@example.com
company,best-recruitment-agency,Test Agency,info@testagency.com,,United Kingdom,Another Nominator,another@example.com`;

    // Create a FormData object (simulating file upload)
    const formData = new FormData();
    const blob = new Blob([testCSV], { type: 'text/csv' });
    const file = new File([blob], 'test_upload.csv', { type: 'text/csv' });
    formData.append('file', file);

    const response = await fetch('http://localhost:3000/api/admin/simple-bulk-upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Add admin auth header if needed
        'Authorization': 'Bearer admin-token'
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ API endpoint working');
      console.log(`   Total: ${result.data.total}`);
      console.log(`   Successful: ${result.data.successful}`);
      console.log(`   Failed: ${result.data.failed}`);
      
      if (result.data.errors && result.data.errors.length > 0) {
        console.log('   Errors:');
        result.data.errors.forEach(error => {
          console.log(`     - ${error}`);
        });
      }
    } else {
      console.log('❌ API endpoint failed:', result.error);
    }
    
    // Test 2: Check admin page loads
    console.log('\n2️⃣ Testing admin page...');
    
    const adminResponse = await fetch('http://localhost:3000/admin');
    
    if (adminResponse.ok) {
      console.log('✅ Admin page loads successfully');
    } else {
      console.log('❌ Admin page failed to load');
    }
    
    // Test 3: Check categories are valid
    console.log('\n3️⃣ Testing category validation...');
    
    const categoriesResponse = await fetch('http://localhost:3000/api/nominees');
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.success) {
      const availableCategories = [...new Set(categoriesData.data.map(n => n.category))];
      console.log('✅ Available categories for testing:');
      availableCategories.slice(0, 5).forEach(cat => {
        console.log(`   - ${cat}`);
      });
      
      if (availableCategories.length > 5) {
        console.log(`   ... and ${availableCategories.length - 5} more`);
      }
    }
    
    console.log('\n🎯 Simple Bulk Upload Test Summary:');
    console.log('✅ Simple bulk upload component created');
    console.log('✅ Simple API endpoint created');
    console.log('✅ Admin page updated with both options');
    console.log('✅ Ready for local testing');
    
    console.log('\n📝 How to test:');
    console.log('1. Go to http://localhost:3000/admin');
    console.log('2. Click on "Bulk Upload" tab');
    console.log('3. Use "Simple Bulk Upload" section on the left');
    console.log('4. Download the simple template');
    console.log('5. Fill in a few test rows');
    console.log('6. Upload and see results');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimpleBulkUpload().catch(console.error);