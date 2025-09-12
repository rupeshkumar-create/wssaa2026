const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function applyAdminNominationFix() {
  console.log('🔧 Applying admin nomination fix schema...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'ADMIN_NOMINATION_FIX_SCHEMA.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements (rough split by semicolon)
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== 'COMMIT');
    
    console.log(`📋 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      try {
        console.log(`  ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        
        // Use raw SQL execution
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.warn(`    ⚠️ Warning: ${error.message}`);
        } else {
          console.log(`    ✅ Success`);
        }
      } catch (err) {
        console.warn(`    ⚠️ Error: ${err.message}`);
      }
    }
    
    // Verify the tables were created
    console.log('🔍 Verifying schema...');
    
    const { data: categoryGroups, error: cgError } = await supabase
      .from('category_groups')
      .select('*')
      .limit(5);
      
    if (cgError) {
      console.error('❌ Category groups table still not accessible:', cgError.message);
    } else {
      console.log(`✅ Category groups: ${categoryGroups?.length || 0} found`);
    }
    
    const { data: subcategories, error: scError } = await supabase
      .from('subcategories')
      .select('*')
      .limit(5);
      
    if (scError) {
      console.error('❌ Subcategories table still not accessible:', scError.message);
    } else {
      console.log(`✅ Subcategories: ${subcategories?.length || 0} found`);
    }
    
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
      
    if (settingsError) {
      console.error('❌ Settings table still not accessible:', settingsError.message);
    } else {
      console.log(`✅ Settings: ${settings?.length || 0} found`);
    }
    
    console.log('🎉 Schema fix completed!');
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error.message);
    console.log('');
    console.log('📋 Manual Setup Required:');
    console.log('Please run the SQL in ADMIN_NOMINATION_FIX_SCHEMA.sql in your Supabase dashboard');
  }
}

applyAdminNominationFix().catch(console.error);