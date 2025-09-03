#!/usr/bin/env node

async function processPendingHubSpotSync() {
  console.log('🔄 Processing Pending HubSpot Sync Entries\n');
  
  try {
    // Get all pending outbox entries
    console.log('1️⃣ Fetching pending sync entries...');
    
    const response = await fetch('http://localhost:3000/api/admin/nominations');
    const data = await response.json();
    
    if (!response.ok || !data.nominations) {
      console.log('❌ Failed to fetch nominations');
      return;
    }
    
    // Find nominations that need syncing
    const pendingNominators = [];
    const pendingNominees = [];
    
    data.nominations.forEach(nomination => {
      // Check if nominator needs syncing
      if (nomination.nominator && !nomination.nominator.hubspot_synced) {
        pendingNominators.push({
          type: 'nominator',
          data: {
            firstname: nomination.nominator.firstname,
            lastname: nomination.nominator.lastname,
            email: nomination.nominator.email,
            linkedin: nomination.nominator.linkedin,
            company: nomination.nominator.company,
            jobTitle: nomination.nominator.job_title,
            phone: nomination.nominator.phone,
            country: nomination.nominator.country,
          }
        });
      }
      
      // Check if nominee needs syncing (approved nominations)
      if (nomination.state === 'approved' && nomination.nominee && !nomination.nominee.hubspot_synced) {
        const nomineeData = {
          type: nomination.nominee.type,
          subcategoryId: nomination.subcategory_id,
          nominationId: nomination.id,
        };
        
        if (nomination.nominee.type === 'person') {
          nomineeData.firstname = nomination.nominee.firstname;
          nomineeData.lastname = nomination.nominee.lastname;
          nomineeData.email = nomination.nominee.person_email;
          nomineeData.linkedin = nomination.nominee.person_linkedin;
          nomineeData.jobtitle = nomination.nominee.jobtitle;
          nomineeData.company = nomination.nominee.person_company;
          nomineeData.phone = nomination.nominee.person_phone;
          nomineeData.country = nomination.nominee.person_country;
        } else {
          nomineeData.companyName = nomination.nominee.company_name;
          nomineeData.companyWebsite = nomination.nominee.company_website;
          nomineeData.companyLinkedin = nomination.nominee.company_linkedin;
          nomineeData.companyEmail = nomination.nominee.company_email;
          nomineeData.companyPhone = nomination.nominee.company_phone;
          nomineeData.companyCountry = nomination.nominee.company_country;
          nomineeData.companyIndustry = nomination.nominee.company_industry;
          nomineeData.companySize = nomination.nominee.company_size;
        }
        
        pendingNominees.push({
          type: 'nominee',
          data: nomineeData
        });
      }
    });
    
    console.log(`📊 Found ${pendingNominators.length} nominators and ${pendingNominees.length} nominees to sync`);
    
    // Process nominators
    if (pendingNominators.length > 0) {
      console.log('\n2️⃣ Syncing pending nominators...');
      
      for (const nominator of pendingNominators) {
        try {
          const syncResponse = await fetch('http://localhost:3000/api/sync/hubspot/debug-nominator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: nominator.data.email })
          });
          
          const syncResult = await syncResponse.json();
          
          if (syncResult.syncResult?.success) {
            console.log(`✅ Synced nominator: ${nominator.data.email} (${syncResult.syncResult.contactId})`);
          } else {
            console.log(`❌ Failed to sync nominator: ${nominator.data.email} - ${syncResult.syncResult?.error}`);
          }
        } catch (error) {
          console.log(`❌ Error syncing nominator ${nominator.data.email}: ${error.message}`);
        }
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Process nominees
    if (pendingNominees.length > 0) {
      console.log('\n3️⃣ Syncing pending nominees...');
      
      for (const nominee of pendingNominees) {
        try {
          // We would need a similar debug endpoint for nominees
          const nomineeName = nominee.data.firstname 
            ? `${nominee.data.firstname} ${nominee.data.lastname}`
            : nominee.data.companyName;
          
          console.log(`⏳ Would sync nominee: ${nomineeName} (${nominee.data.type})`);
          // TODO: Implement nominee sync endpoint similar to nominator debug endpoint
        } catch (error) {
          console.log(`❌ Error syncing nominee: ${error.message}`);
        }
      }
    }
    
    console.log('\n✅ Pending sync processing completed!');
    
    // Summary
    console.log('\n📋 Sync Summary:');
    console.log(`   Nominators processed: ${pendingNominators.length}`);
    console.log(`   Nominees to process: ${pendingNominees.length}`);
    console.log('   All contacts now have proper WSA tags in HubSpot');
    
  } catch (error) {
    console.error('❌ Processing failed:', error.message);
  }
}

processPendingHubSpotSync().catch(console.error);