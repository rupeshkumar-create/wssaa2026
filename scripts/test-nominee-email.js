#!/usr/bin/env node

/**
 * Test Nominee Email Functionality
 */

const fetch = require('node-fetch');

async function testNomineeEmail() {
  console.log('📧 Testing nominee email functionality...');
  
  try {
    // First, get a test nomination
    console.log('1. Fetching nominations...');
    const nominationsResponse = await fetch('http://localhost:3000/api/admin/nominations-improved', {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!nominationsResponse.ok) {
      throw new Error(`Failed to fetch nominations: ${nominationsResponse.status}`);
    }
    
    const nominationsResult = await nominationsResponse.json();
    
    if (!nominationsResult.success || !nominationsResult.data.length) {
      throw new Error('No nominations found for testing');
    }
    
    const testNomination = nominationsResult.data[0];
    console.log(`✅ Found test nomination: ${testNomination.id}`);
    
    // Test sending email
    console.log('2. Testing email send...');
    const emailResponse = await fetch('http://localhost:3000/api/admin/send-nominee-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nominationId: testNomination.id,
        email: 'Rupesh7126@gmail.com',
        transactionalId: 'cmfb0xhia0qnaxj0ig98plajz'
      })
    });
    
    const emailResult = await emailResponse.json();
    
    if (emailResponse.ok) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Email details:', emailResult);
    } else {
      console.log('❌ Email failed:', emailResult.error);
      console.log('📋 Details:', emailResult.details);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testNomineeEmail();