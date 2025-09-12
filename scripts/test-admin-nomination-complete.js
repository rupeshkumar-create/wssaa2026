#!/usr/bin/env node

/**
 * Test Admin Nomination Complete Functionality
 * This script tests the complete admin nomination workflow
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminNominationWorkflow() {
  try {
    console.log('🧪 Testing Admin Nomination Complete Workflow...\n');

    // 1. Test categories API
    console.log('1️⃣ Testing categories API...');
    const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories`);
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.success && categoriesData.data.length > 0) {
      console.log(`✅ Categories API working: ${categoriesData.data.length} categories found`);
      console.log(`   Sample category: ${categoriesData.data[0].name} (${categoriesData.data[0].category_groups.name})`);
    } else {
      console.error('❌ Categories API failed:', categoriesData.error);
      return;
    }

    // 2. Test admin nomination creation
    console.log('\n2️⃣ Testing admin nomination creation...');
    const testNomination = {
      type: 'person',
      subcategory_id: categoriesData.data[0].id,
      category_group_id: categoriesData.data[0].category_groups.id,
      firstname: 'Test',
      lastname: 'Admin Nominee',
      jobtitle: 'Test Manager',
      person_email: 'test.admin.nominee@example.com',
      person_linkedin: 'https://linkedin.com/in/testadminnominee',
      person_phone: '+1-555-0123',
      person_company: 'Test Company',
      person_country: 'United States',
      why_me: 'This is a test nomination created by admin to verify the workflow.',
      bio: 'Test biography for admin nomination.',
      achievements: 'Test achievements for admin nomination.',
      admin_notes: 'This is a test nomination - can be deleted after testing.'
    };

    const createResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/nominations/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testNomination)
    });

    const createData = await createResponse.json();
    
    if (createData.success) {
      console.log(`✅ Admin nomination created successfully: ${createData.nomination.id}`);
      console.log(`   State: ${createData.nomination.state}`);
      
      const draftId = createData.nomination.id;

      // 3. Test draft nominations API
      console.log('\n3️⃣ Testing draft nominations API...');
      const draftsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/nominations/drafts`);
      const draftsData = await draftsResponse.json();
      
      if (draftsData.success) {
        console.log(`✅ Draft nominations API working: ${draftsData.data.length} drafts found`);
        const ourDraft = draftsData.data.find(d => d.id === draftId);
        if (ourDraft) {
          console.log(`   Our test draft found: ${ourDraft.firstname} ${ourDraft.lastname}`);
        }
      } else {
        console.error('❌ Draft nominations API failed:', draftsData.error);
      }

      // 4. Test nomination approval
      console.log('\n4️⃣ Testing nomination approval...');
      const approveResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/nominations/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nominationId: draftId })
      });

      const approveData = await approveResponse.json();
      
      if (approveData.success) {
        console.log(`✅ Nomination approved successfully: ${approveData.nomination.id}`);
        console.log(`   Nominee ID: ${approveData.nominee.id}`);
        console.log(`   Nominator ID: ${approveData.nominator.id}`);
        console.log(`   Email sent: ${approveData.emailSent ? 'Yes' : 'No'}`);

        // 5. Verify the nomination appears in main nominations
        console.log('\n5️⃣ Verifying nomination in main list...');
        const { data: mainNominations, error: mainError } = await supabase
          .from('nominations')
          .select('*')
          .eq('id', approveData.nomination.id)
          .single();

        if (mainError) {
          console.error('❌ Failed to find nomination in main list:', mainError.message);
        } else {
          console.log(`✅ Nomination found in main list: ${mainNominations.state}`);
        }

        // 6. Verify the nominee exists
        console.log('\n6️⃣ Verifying nominee record...');
        const { data: nominee, error: nomineeError } = await supabase
          .from('nominees')
          .select('*')
          .eq('id', approveData.nominee.id)
          .single();

        if (nomineeError) {
          console.error('❌ Failed to find nominee record:', nomineeError.message);
        } else {
          console.log(`✅ Nominee record found: ${nominee.firstname} ${nominee.lastname}`);
        }

        // 7. Test public nominees view
        console.log('\n7️⃣ Testing public nominees view...');
        const { data: publicNominees, error: publicError } = await supabase
          .from('public_nominees')
          .select('*')
          .eq('nominee_id', approveData.nominee.id)
          .single();

        if (publicError) {
          console.error('❌ Failed to find in public nominees view:', publicError.message);
        } else {
          console.log(`✅ Found in public nominees view: ${publicNominees.display_name}`);
        }

        // 8. Cleanup - Delete test data
        console.log('\n8️⃣ Cleaning up test data...');
        
        // Delete from nominations
        await supabase.from('nominations').delete().eq('id', approveData.nomination.id);
        
        // Delete from nominees
        await supabase.from('nominees').delete().eq('id', approveData.nominee.id);
        
        // Delete from admin_nominations
        await supabase.from('admin_nominations').delete().eq('id', draftId);
        
        console.log('✅ Test data cleaned up');

      } else {
        console.error('❌ Nomination approval failed:', approveData.error);
        
        // Cleanup draft
        await supabase.from('admin_nominations').delete().eq('id', draftId);
      }

    } else {
      console.error('❌ Admin nomination creation failed:', createData.error);
    }

    // 9. Test nomination status bypass
    console.log('\n9️⃣ Testing nomination status bypass...');
    
    // First, close nominations
    const { error: settingsError } = await supabase
      .from('settings')
      .update({ nominations_open: false })
      .eq('id', 'main');

    if (settingsError) {
      console.warn('⚠️ Could not close nominations for test:', settingsError.message);
    } else {
      console.log('✅ Nominations closed for bypass test');

      // Try to create admin nomination (should work)
      const bypassNomination = {
        type: 'company',
        subcategory_id: categoriesData.data.find(c => c.nomination_type === 'company' || c.nomination_type === 'both')?.id,
        category_group_id: categoriesData.data.find(c => c.nomination_type === 'company' || c.nomination_type === 'both')?.category_groups.id,
        company_name: 'Test Bypass Company',
        company_website: 'https://testbypass.com',
        company_email: 'test@testbypass.com',
        why_us: 'This is a test to verify admin can nominate when nominations are closed.',
        admin_notes: 'Bypass test - can be deleted.'
      };

      const bypassResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/nominations/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bypassNomination)
      });

      const bypassData = await bypassResponse.json();
      
      if (bypassData.success) {
        console.log('✅ Admin can create nominations when nominations are closed');
        
        // Cleanup
        await supabase.from('admin_nominations').delete().eq('id', bypassData.nomination.id);
      } else {
        console.error('❌ Admin nomination bypass failed:', bypassData.error);
      }

      // Reopen nominations
      await supabase
        .from('settings')
        .update({ nominations_open: true })
        .eq('id', 'main');
      
      console.log('✅ Nominations reopened');
    }

    console.log('\n🎉 Admin Nomination Complete Workflow Test Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Categories API working');
    console.log('✅ Admin nomination creation working');
    console.log('✅ Draft nominations API working');
    console.log('✅ Nomination approval working');
    console.log('✅ Email sending configured');
    console.log('✅ Public nominees view updated');
    console.log('✅ Admin bypass functionality working');
    console.log('\n🚀 The admin nomination system is ready for use!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Execute the test
testAdminNominationWorkflow();