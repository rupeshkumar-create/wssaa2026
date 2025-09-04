const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyBulkUpload() {
  try {
    console.log('🔍 Verifying bulk upload success...\n');
    
    // Get recent nominations
    const { data: nominations, error: nominationsError } = await supabase
      .from('nominations')
      .select(`
        id,
        subcategory_id,
        state,
        created_at,
        nominees:nominee_id (
          firstname,
          lastname,
          person_email,
          jobtitle
        ),
        nominators:nominator_id (
          firstname,
          lastname,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (nominationsError) {
      console.log('❌ Error fetching nominations:', nominationsError);
      return;
    }

    console.log(`✅ Found ${nominations?.length || 0} recent nominations:`);
    nominations?.forEach((nom, index) => {
      console.log(`\n${index + 1}. Nomination ID: ${nom.id}`);
      console.log(`   Category: ${nom.subcategory_id}`);
      console.log(`   State: ${nom.state}`);
      console.log(`   Nominee: ${nom.nominees?.firstname} ${nom.nominees?.lastname}`);
      console.log(`   Email: ${nom.nominees?.person_email}`);
      console.log(`   Job: ${nom.nominees?.jobtitle}`);
      console.log(`   Nominator: ${nom.nominators?.firstname} ${nom.nominators?.lastname} (${nom.nominators?.email})`);
      console.log(`   Created: ${nom.created_at}`);
    });

    // Check nominees table
    const { data: nominees, error: nomineesError } = await supabase
      .from('nominees')
      .select('id, type, firstname, lastname, company_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (nomineesError) {
      console.log('❌ Error fetching nominees:', nomineesError);
    } else {
      console.log(`\n✅ Found ${nominees?.length || 0} recent nominees:`);
      nominees?.forEach((nominee, index) => {
        console.log(`${index + 1}. ${nominee.type}: ${nominee.firstname || nominee.company_name} ${nominee.lastname || ''} (${nominee.created_at})`);
      });
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyBulkUpload();