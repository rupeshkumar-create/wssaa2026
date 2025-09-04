const fs = require('fs');
const FormData = require('form-data');
const { default: fetch } = require('node-fetch');

async function testComprehensiveBulkUpload() {
  try {
    console.log('🧪 Testing comprehensive bulk upload...\n');
    
    // Test 1: Person nominations
    console.log('📝 Testing person nominations...');
    const personCSV = `first_name,last_name,job_title,company_name,email,phone,country,linkedin,bio,achievements,why_vote_for_me,headshot_url,category,nominator_name,nominator_email,nominator_company,nominator_job_title,nominator_phone,nominator_country
Alice,Johnson,Senior Recruiter,TechCorp,alice.johnson@techcorp.com,+1-555-111-2222,United States,https://linkedin.com/in/alicejohnson,Experienced tech recruiter,Placed 300+ candidates,Excellent track record in tech recruitment,https://example.com/headshots/alice.jpg,top-recruiter,Bob Manager,bob@manager.com,Manager Corp,HR Director,+1-555-333-4444,United States
Charlie,Brown,VP Talent,GlobalTech,charlie.brown@globaltech.com,+44-20-1111-2222,United Kingdom,https://linkedin.com/in/charliebrown,Global talent leader,Built teams across 5 countries,Innovative global talent strategies,https://example.com/headshots/charlie.jpg,top-recruiting-leader-europe,Diana Boss,diana@boss.com,Boss Ltd,CEO,+44-20-3333-4444,United Kingdom`;

    fs.writeFileSync('test-person-upload.csv', personCSV);
    
    const personFormData = new FormData();
    personFormData.append('file', fs.createReadStream('test-person-upload.csv'));
    personFormData.append('type', 'person');
    
    const personResponse = await fetch('http://localhost:3000/api/admin/separated-bulk-upload', {
      method: 'POST',
      body: personFormData,
      headers: personFormData.getHeaders()
    });
    
    const personResult = await personResponse.json();
    
    console.log('Person Upload Result:');
    console.log('- Status:', personResponse.status);
    console.log('- Success:', personResult.success);
    console.log('- Data:', personResult.data);
    
    if (!personResult.success) {
      console.log('- Error:', personResult.error);
    }

    // Test 2: Company nominations
    console.log('\n📝 Testing company nominations...');
    const companyCSV = `company_name,website,email,phone,country,industry,company_size,bio,achievements,why_vote_for_me,logo_url,category,nominator_name,nominator_email,nominator_company,nominator_job_title,nominator_phone,nominator_country
TechStaff Solutions,https://techstaff.com,info@techstaff.com,+1-555-777-8888,United States,Technology,100-500,Leading tech staffing company,Placed 1000+ tech professionals,Innovation in AI-driven recruitment,https://example.com/logos/techstaff.jpg,top-staffing-company-usa,Eva Client,eva@client.com,Client Corp,VP Operations,+1-555-999-0000,United States
EuroRecruit Ltd,https://eurorecruit.com,hello@eurorecruit.com,+33-1-11-22-33-44,France,Staffing,50-100,European recruitment specialists,Expanded to 10 European countries,Excellence in European talent acquisition,https://example.com/logos/eurorecruit.jpg,top-staffing-company-europe,Frank Partner,frank@partner.com,Partner Inc,Managing Director,+33-1-55-66-77-88,France`;

    fs.writeFileSync('test-company-upload.csv', companyCSV);
    
    const companyFormData = new FormData();
    companyFormData.append('file', fs.createReadStream('test-company-upload.csv'));
    companyFormData.append('type', 'company');
    
    const companyResponse = await fetch('http://localhost:3000/api/admin/separated-bulk-upload', {
      method: 'POST',
      body: companyFormData,
      headers: companyFormData.getHeaders()
    });
    
    const companyResult = await companyResponse.json();
    
    console.log('Company Upload Result:');
    console.log('- Status:', companyResponse.status);
    console.log('- Success:', companyResult.success);
    console.log('- Data:', companyResult.data);
    
    if (!companyResult.success) {
      console.log('- Error:', companyResult.error);
    }

    // Clean up
    fs.unlinkSync('test-person-upload.csv');
    fs.unlinkSync('test-company-upload.csv');
    
    console.log('\n✅ Comprehensive bulk upload test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Wait for server to start
setTimeout(testComprehensiveBulkUpload, 3000);