const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // Try to get table information using a raw SQL query
    let tables = null;
      
    if (!tables) {
      // Alternative: try to query known tables to see what exists
      const knownTables = ['nominees', 'nominators', 'nominations', 'category_groups', 'subcategories', 'settings'];
      
      console.log('📋 Checking known tables:');
      for (const table of knownTables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
            
          if (error) {
            console.log(`  ❌ ${table}: ${error.message}`);
          } else {
            console.log(`  ✅ ${table}: exists (${data?.length || 0} sample records)`);
          }
        } catch (err) {
          console.log(`  ❌ ${table}: ${err.message}`);
        }
      }
    }
    
    // Check if we need to create the category tables
    const { data: categoryTest, error: categoryError } = await supabase
      .from('category_groups')
      .select('*')
      .limit(1);
      
    if (categoryError && categoryError.code === 'PGRST205') {
      console.log('🔧 Category tables missing, creating them...');
      
      // Create the category tables using SQL
      const createCategoryTablesSQL = `
        -- Create category_groups table
        CREATE TABLE IF NOT EXISTS category_groups (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create subcategories table
        CREATE TABLE IF NOT EXISTS subcategories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          category_group_id TEXT REFERENCES category_groups(id),
          nomination_type TEXT DEFAULT 'both' CHECK (nomination_type IN ('person', 'company', 'both')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Insert default categories
        INSERT INTO category_groups (id, name, description) VALUES 
        ('staffing', 'Staffing & Recruiting', 'Awards for staffing and recruiting professionals')
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO subcategories (id, name, description, category_group_id, nomination_type) VALUES 
        ('best-staffing-firm', 'Best Staffing Firm', 'Outstanding staffing and recruiting companies', 'staffing', 'both'),
        ('best-recruiter', 'Best Recruiter', 'Top performing recruiters', 'staffing', 'person'),
        ('best-staffing-leader', 'Best Staffing Leader', 'Outstanding leadership in staffing', 'staffing', 'person')
        ON CONFLICT (id) DO NOTHING;
      `;
      
      // Execute the SQL using the dev API
      const response = await fetch('http://localhost:3000/api/dev/execute-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: createCategoryTablesSQL })
      }).catch(() => null);
      
      if (response && response.ok) {
        console.log('✅ Category tables created successfully');
      } else {
        console.log('⚠️ Could not create tables via API, trying direct SQL...');
        
        // Try direct SQL execution (this might not work depending on permissions)
        const { error: sqlError } = await supabase
          .rpc('exec_sql', { sql: createCategoryTablesSQL })
          .catch(() => ({ error: 'RPC not available' }));
          
        if (sqlError) {
          console.log('❌ Direct SQL failed, manual schema setup needed');
          console.log('📋 Please run this SQL in your Supabase dashboard:');
          console.log(createCategoryTablesSQL);
        } else {
          console.log('✅ Tables created via direct SQL');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  }
}

checkDatabaseSchema().catch(console.error);