#!/usr/bin/env node

/**
 * Check database tables and schema
 */

const { createClient } = require('@supabase/supabase-js');

const checkDatabaseTables = async () => {
  console.log('🔍 Checking database tables and schema...');
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Check if main tables exist
    const tables = ['nominators', 'nominees', 'nominations', 'subcategories', 'category_groups', 'settings'];
    
    for (const table of tables) {
      console.log(`\n📋 Checking table: ${table}`);
      
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error(`❌ Error accessing ${table}:`, error.message);
        } else {
          console.log(`✅ Table ${table} exists with ${count} rows`);
        }
      } catch (tableError) {
        console.error(`❌ Failed to check ${table}:`, tableError.message);
      }
    }
    
    // Check subcategories specifically
    console.log('\n📋 Checking subcategories data:');
    const { data: subcategories, error: subError } = await supabase
      .from('subcategories')
      .select('id, name, category_groups(id, name)')
      .limit(10);
    
    if (subError) {
      console.error('❌ Error fetching subcategories:', subError.message);
    } else {
      console.log('✅ Sample subcategories:');
      subcategories?.forEach(sub => {
        console.log(`  - ${sub.id}: ${sub.name} (group: ${sub.category_groups?.name})`);
      });
    }
    
    // Check settings
    console.log('\n📋 Checking settings:');
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .single();
    
    if (settingsError) {
      console.error('❌ Error fetching settings:', settingsError.message);
    } else {
      console.log('✅ Settings found:');
      console.log('  - nominations_open:', settings?.nominations_open);
      console.log('  - voting_open:', settings?.voting_open);
    }
    
    // Test a simple insert to check permissions
    console.log('\n🧪 Testing database write permissions...');
    const testNominator = {
      email: 'test-db-check@example.com',
      firstname: 'Test',
      lastname: 'User',
      created_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('nominators')
      .insert(testNominator)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Database write test failed:', insertError.message);
    } else {
      console.log('✅ Database write test successful, ID:', insertData.id);
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('nominators')
        .delete()
        .eq('id', insertData.id);
      
      if (deleteError) {
        console.warn('⚠️ Failed to clean up test data:', deleteError.message);
      } else {
        console.log('✅ Test data cleaned up');
      }
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
};

// Load environment variables
require('dotenv').config({ path: '.env.local' });

checkDatabaseTables();