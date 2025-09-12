#!/usr/bin/env node

/**
 * Setup Admin Schema - Simple API Call
 */

async function setupSchema() {
  try {
    console.log('🔄 Setting up admin nomination schema...');

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/admin/setup-schema`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Schema setup completed successfully!');
      console.log(`📊 Category groups created: ${data.data.categoryGroupsCreated}`);
      console.log(`📋 Subcategories created: ${data.data.subcategoriesCreated}`);
      console.log(`🔍 Test categories found: ${data.data.testCategoriesFound}`);
      
      if (data.data.sampleCategory) {
        console.log(`📝 Sample category: ${data.data.sampleCategory.name} (${data.data.sampleCategory.category_groups?.name})`);
      }

      console.log('\n🎉 Admin nomination system is ready!');
      console.log('\nNext steps:');
      console.log('1. Go to /admin');
      console.log('2. Click "Add Nominee" tab');
      console.log('3. Create a test nomination');
      console.log('4. Check "Drafts" tab');
      console.log('5. Approve the nomination');
      console.log('6. Verify email is sent');
    } else {
      console.error('❌ Schema setup failed:', data.error);
      if (data.details) {
        console.error('Details:', data.details);
      }
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupSchema();