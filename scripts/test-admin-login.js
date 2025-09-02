#!/usr/bin/env node

async function testAdminLogin() {
  const credentials = {
    email: 'admin@worldstaffingawards.com',
    password: 'WSA2026Admin!Secure'
  };
  
  console.log('Testing admin login with credentials:', {
    email: credentials.email,
    password: '***hidden***'
  });
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', result);
    
    if (response.ok) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.error('Error testing login:', error.message);
    console.log('Make sure the development server is running with: npm run dev');
  }
}

testAdminLogin();