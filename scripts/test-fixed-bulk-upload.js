const fs = require('fs');
const FormData = require('form-data');
const { default: fetch } = require('node-fetch');

async function testBulkUpload() {
  try {
    console.log('🧪 Testing fixed bulk upload...\n');
    
    // Create a simple test CSV with valid data
    const testCSV = `first_name,last_name,job_title,company_name,email,phone,country,linkedin,bio,achievements,why_vote_for_me,headshot_url,category,nominator_name,nominator_email,nominator_company,nominator_job_title,nominator_phone,nominator_country
John,Smith,Senior Recruiter,TechTalent Solutions,john.smith@techtalent.com,+1-555-123-4567,United States,https://linkedin.com/in/johnsmith,Experienced recruiter with 10+ years,Placed 500+ candidates in 2024,Outstanding performance in tech recruitment,https://example.com/headshots/john-smith.jpg,top-recruiter,Sarah Johnson,sarah.j@client.com,Innovation Corp,Talent Director,+1-555-987-6543,United States
Maria,Garcia,VP of Talent,Global Staffing Inc,maria.garcia@globalstaffing.com,+44-20-1234-5678,United Kingdom,https://linkedin.com/in/mariagarcia,Talent acquisition leader,Built talent acquisition teams,Innovative approach to talent acquisition,https://example.com/headshots/maria-garcia.jpg,top-recruiting-leader-europe,David Wilson,david.w@startup.com,TechStart Ltd,CEO,+44-20-9876-5432,United Kingdom`;

    // Write test CSV file
    fs.writeFileSync('test-bulk-upload.csv', testCSV);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test-bulk-upload.csv'));
    formData.append('type', 'person');
    
    // Make request to bulk upload API
    const response = await fetch('http://localhost:3000/api/admin/separated-bulk-upload', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const result = await response.json();
    
    console.log('📊 Upload Result:');
    console.log('Status:', response.status);
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('✅ Upload successful!');
      console.log('Data:', result.data);
    } else {
      console.log('❌ Upload failed:');
      console.log('Error:', result.error);
    }
    
    // Clean up
    fs.unlinkSync('test-bulk-upload.csv');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Wait a bit for server to start
setTimeout(testBulkUpload, 5000);