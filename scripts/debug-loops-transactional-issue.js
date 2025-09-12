#!/usr/bin/env node

/**
 * Debug script for Loops transactional email issues
 * Helps identify and fix configuration problems
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function debugLoopsTransactionalIssue() {
  console.log('🔍 Debugging Loops Transactional Email Issue...\n');

  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`LOOPS_API_KEY: ${process.env.LOOPS_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log('');

  if (!process.env.LOOPS_API_KEY) {
    console.error('❌ LOOPS_API_KEY is required for testing');
    process.exit(1);
  }

  try {
    const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
    const TRANSACTIONAL_ID = 'cmfb0nmgv7ewn0p0i063876oq';

    console.log('🔍 Testing different email configurations...\n');

    // Test 1: Minimal email without data variables
    console.log('📧 Test 1: Minimal email (no data variables)');
    const minimalResult = await testLoopsEmail({
      transactionalId: TRANSACTIONAL_ID,
      email: 'viabl@powerscrews.com'
    }, LOOPS_API_KEY);
    
    console.log('Result:', minimalResult.success ? '✅ Success' : `❌ Failed: ${minimalResult.error}`);
    console.log('');

    // Test 2: Email with minimal data variables
    console.log('📧 Test 2: Email with minimal data variables');
    const minimalDataResult = await testLoopsEmail({
      transactionalId: TRANSACTIONAL_ID,
      email: 'viabl@powerscrews.com',
      dataVariables: {
        voterFirstName: 'Test',
        voterLastName: 'User'
      }
    }, LOOPS_API_KEY);
    
    console.log('Result:', minimalDataResult.success ? '✅ Success' : `❌ Failed: ${minimalDataResult.error}`);
    console.log('');

    // Test 3: Email with all data variables (current implementation)
    console.log('📧 Test 3: Email with all data variables (current)');
    const fullDataResult = await testLoopsEmail({
      transactionalId: TRANSACTIONAL_ID,
      email: 'viabl@powerscrews.com',
      dataVariables: {
        voterFirstName: 'Test',
        voterLastName: 'User',
        voterFullName: 'Test User',
        voterEmail: 'viabl@powerscrews.com',
        voterLinkedIn: 'https://linkedin.com/in/test',
        voterCompany: 'Test Company',
        voterJobTitle: 'Test Role',
        voterCountry: 'United States',
        nomineeDisplayName: 'Test Nominee',
        nomineeUrl: 'https://example.com/nominee',
        categoryName: 'Test Category',
        subcategoryName: 'Test Category',
        voteTimestamp: new Date().toISOString(),
        voteDate: 'January 9, 2025',
        voteTime: '10:30 AM EST'
      }
    }, LOOPS_API_KEY);
    
    console.log('Result:', fullDataResult.success ? '✅ Success' : `❌ Failed: ${fullDataResult.error}`);
    console.log('');

    // Test 4: Different email address
    console.log('📧 Test 4: Different email address');
    const differentEmailResult = await testLoopsEmail({
      transactionalId: TRANSACTIONAL_ID,
      email: 'rupesh.kumar@candidate.ly',
      dataVariables: {
        voterFirstName: 'Rupesh',
        voterLastName: 'Kumar'
      }
    }, LOOPS_API_KEY);
    
    console.log('Result:', differentEmailResult.success ? '✅ Success' : `❌ Failed: ${differentEmailResult.error}`);
    console.log('');

    // Provide diagnosis
    console.log('🔍 DIAGNOSIS:');
    console.log('The error "This transactional email contains a contact property" typically means:');
    console.log('1. ❌ The email template in Loops dashboard has contact properties configured');
    console.log('2. ❌ The transactional email is set to sync contact data');
    console.log('3. ❌ There are conflicting field mappings in the template');
    console.log('');
    
    console.log('🛠️ SOLUTIONS:');
    console.log('1. Go to your Loops dashboard');
    console.log('2. Find transactional email ID: cmfb0nmgv7ewn0p0i063876oq');
    console.log('3. Check "Contact Properties" section - remove any configured properties');
    console.log('4. Ensure "Sync contact data" is disabled');
    console.log('5. Use only dataVariables for personalization');
    console.log('');
    
    console.log('📝 RECOMMENDED TEMPLATE SETUP:');
    console.log('- Use {{voterFirstName}} instead of contact.firstName');
    console.log('- Use {{nomineeDisplayName}} instead of contact properties');
    console.log('- Disable all contact property syncing');
    console.log('- Use only the dataVariables we send in the API call');

  } catch (error) {
    console.error('❌ Debug failed with error:', error);
    process.exit(1);
  }
}

async function testLoopsEmail(payload, apiKey) {
  try {
    const response = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: responseData?.message || responseData?.error || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    return {
      success: true,
      messageId: responseData?.id || responseData?.messageId || 'unknown'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the debug
debugLoopsTransactionalIssue().catch(console.error);