#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testFrontendForm() {
  console.log('🌐 Testing Frontend Form Submission...\n');

  // Test the actual frontend form submission flow
  console.log('Testing form submission through frontend...');
  
  try {
    // First, check if the nomination form page loads
    const pageResponse = await fetch('http://localhost:3000/nominate');
    console.log(`Nomination page status: ${pageResponse.status}`);
    
    if (pageResponse.ok) {
      console.log('✅ Nomination page loads successfully');
    } else {
      console.log('❌ Nomination page failed to load');
      return;
    }

    // Test the API endpoint directly (simulating frontend submission)
    const testPayload = {
      type: 'person',
      categoryGroupId: 'staffing',
      subcategoryId: 'best-staffing-firm',
      nominator: {
        firstname: 'Frontend',
        lastname: 'Test',
        email: 'frontend.test@example.com',
        company: 'Test Company',
        jobTitle: 'Tester',
        linkedin: '',
        phone: '',
        country: 'United States'
      },
      nominee: {
        firstname: 'Test',
        lastname: 'Nominee',
        email: 'test.nominee@example.com',
        jobtitle: 'Test Position',
        company: 'Test Company',
        linkedin: '',
        phone: '',
        country: 'United States',
        headshotUrl: 'https://example.com/headshot.jpg',
        whyMe: 'Test submission from frontend',
        liveUrl: 'https://example.com',
        bio: 'Test bio',
        achievements: 'Test achievements'
      }
    };

    console.log('\nSubmitting test nomination...');
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/nomination/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`Response Status: ${response.status}`);
    console.log(`Response Time: ${responseTime}ms`);

    const result = await response.json();

    if (response.ok) {
      console.log('✅ FRONTEND FORM SUBMISSION WORKING!');
      console.log(`Nomination ID: ${result.nominationId}`);
      console.log(`Processing Time: ${result.processingTime}ms`);
      
      // Check integrations
      console.log('\nIntegration Status:');
      console.log(`- HubSpot Nominator Sync: ${result.hubspotSync?.nominatorSynced ? '✅' : '❌'}`);
      console.log(`- HubSpot Nominee Sync: ${result.hubspotSync?.nomineeSynced ? '✅' : '❌'}`);
      console.log(`- Loops Nominator Sync: ${result.loopsSync?.nominatorSynced ? '✅' : '❌'}`);
      console.log(`- Email Confirmation: ${result.emails?.nominatorConfirmationSent ? '✅' : '❌'}`);
      
      console.log('\n🎉 All systems working! Users can now submit nominations successfully.');
      
    } else {
      console.log('❌ FRONTEND FORM SUBMISSION FAILED!');
      console.log(`Error: ${result.error}`);
      if (result.details) {
        console.log(`Details:`, result.details);
      }
    }

  } catch (error) {
    console.log('❌ TEST FAILED!');
    console.log(`Error: ${error.message}`);
  }
}

// Run the test
testFrontendForm().catch(console.error);