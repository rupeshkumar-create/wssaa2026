#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  try {
    // Get table schema
    const { data, error } = await supabase
      .from('nominations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching schema:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Available columns in nominations table:');
      console.log(Object.keys(data[0]).sort());
    } else {
      console.log('No data in nominations table, checking with raw SQL...');
      
      // Try to get column info via raw SQL
      const { data: columns, error: colError } = await supabase
        .rpc('get_table_columns', { table_name: 'nominations' });
      
      if (colError) {
        console.error('Error getting columns:', colError);
      } else {
        console.log('Columns:', columns);
      }
    }
    
  } catch (err) {
    console.error('Exception:', err);
  }
}

checkSchema();