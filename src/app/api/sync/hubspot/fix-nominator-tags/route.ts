import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

// Lazy import to avoid build-time errors
let hubspotClient: any;

async function initializeHubSpot() {
  if (!hubspotClient) {
    try {
      const client = await import('@/server/hubspot/client');
      hubspotClient = client.hubspotClient;
    } catch (error) {
      console.error('Failed to initialize HubSpot:', error);
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🏷️ Fixing nominator tags in HubSpot...');

    // Check if HubSpot sync is enabled
    const hubspotEnabled = process.env.HUBSPOT_SYNC_ENABLED === 'true' && 
                          (process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN);

    if (!hubspotEnabled) {
      return NextResponse.json({
        success: false,
        error: 'HubSpot sync not enabled or configured'
      });
    }

    // Initialize HubSpot client
    await initializeHubSpot();

    if (!hubspotEnabled) {
      return NextResponse.json({
        success: false,
        error: 'HubSpot sync is not enabled or configured'
      }, { status: 400 });
    }

    let updatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      // Step 1: Search for contacts with old nominator tag
      console.log('🔍 Searching for contacts with old nominator tags...');
      
      const searchResponse = await hubspotClient.hubFetch('/crm/v3/objects/contacts/search', {
        method: 'POST',
        body: {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'wsa_role',
                  operator: 'EQ',
                  value: 'Nominator'
                }
              ]
            }
          ],
          properties: ['email', 'firstname', 'lastname', 'wsa_role', 'wsa_contact_tag', 'wsa_tags'],
          limit: 100
        }
      });

      const contacts = searchResponse.results || [];
      console.log(`📊 Found ${contacts.length} nominator contacts to update`);

      // Step 2: Update each contact with correct tags
      for (const contact of contacts) {
        try {
          const currentTag = contact.properties.wsa_contact_tag;
          
          // Only update if they have the old tag or no tag
          if (!currentTag || currentTag === 'WSA 2026 Nominator' || currentTag !== 'Nominator 2026') {
            console.log(`🔄 Updating contact ${contact.properties.email} (ID: ${contact.id})`);
            
            await hubspotClient.hubFetch(`/crm/v3/objects/contacts/${contact.id}`, {
              method: 'PATCH',
              body: {
                properties: {
                  wsa_contact_tag: 'Nominator 2026',
                  wsa_tags: 'Nominator 2026'
                }
              },
              idempotencyKey: hubspotClient.generateIdempotencyKey(),
            });

            updatedCount++;
            console.log(`✅ Updated ${contact.properties.email} with "Nominator 2026" tag`);
          } else {
            console.log(`ℹ️ Contact ${contact.properties.email} already has correct tag`);
          }
        } catch (contactError) {
          errorCount++;
          const errorMsg = `Failed to update contact ${contact.id}: ${contactError instanceof Error ? contactError.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      // Step 3: Update database records if we have them
      try {
        console.log('📊 Updating database records...');
        
        const { data: nominators, error: dbError } = await supabase
          .from('nominators')
          .select('*')
          .not('hubspot_contact_id', 'is', null);

        if (dbError) {
          console.warn('⚠️ Could not fetch nominators from database:', dbError);
        } else if (nominators && nominators.length > 0) {
          // Update database records with new tag info
          const { error: updateError } = await supabase
            .from('nominators')
            .update({
              wsa_contact_tag: 'Nominator 2026',
              wsa_tags: 'Nominator 2026',
              updated_at: new Date().toISOString()
            })
            .not('hubspot_contact_id', 'is', null);

          if (updateError) {
            console.warn('⚠️ Could not update database records:', updateError);
          } else {
            console.log(`✅ Updated ${nominators.length} database records`);
          }
        }
      } catch (dbError) {
        console.warn('⚠️ Database update failed (non-blocking):', dbError);
      }

      console.log(`✅ Nominator tag fix completed: ${updatedCount} updated, ${errorCount} errors`);

      return NextResponse.json({
        success: true,
        message: 'Nominator tags fixed successfully',
        results: {
          totalFound: contacts.length,
          updated: updatedCount,
          errors: errorCount,
          errorDetails: errors.slice(0, 5) // Limit error details
        }
      });

    } catch (searchError) {
      console.error('❌ Failed to search for nominator contacts:', searchError);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to search for nominator contacts',
        details: searchError instanceof Error ? searchError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Nominator tag fix error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}