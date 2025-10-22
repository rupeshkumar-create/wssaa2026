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

async function checkTable(tableName) {
  try {
    console.log(`\n=== ${tableName.toUpperCase()} TABLE ===`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Available columns:');
      console.log(Object.keys(data[0]).sort());
      console.log('\nSample data:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log(`No data in ${tableName} table`);
    }
    
  } catch (err) {
    console.error(`Exception checking ${tableName}:`, err);
  }
}

async function main() {
  const tables = ['nominations', 'nominees', 'nominators', 'categories'];
  
  for (const table of tables) {
    await checkTable(table);
  }
}

main();