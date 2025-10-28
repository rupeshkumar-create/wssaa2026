import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

// Lazy import to avoid build-time errors
let syncNominatorToHubSpot: any;

async function initializeHubSpot() {
  if (!syncNominatorToHubSpot) {
    try {
      const sync = await import('@/server/hubspot/realtime-sync');
      syncNominatorToHubSpot = sync.syncNominatorToHubSpot;
    } catch (error) {
      console.error('Failed to initialize HubSpot:', error);
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if HubSpot is configured
    if (!process.env.HUBSPOT_ACCESS_TOKEN && !process.env.HUBSPOT_TOKEN) {
      return NextResponse.json(
        { 
          error: 'HubSpot not configured',
          configured: false
        },
        { status: 400 }
      );
    }

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    console.log(`🔍 Debugging nominator sync for: ${email}`);

    // Initialize HubSpot client
    await initializeHubSpot();
    
    // 1. Check if nominator exists in database
    const { data: nominator, error: nominatorError } = await supabase
      .from('nominators')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (nominatorError || !nominator) {
      return NextResponse.json({
        found: false,
        error: 'Nominator not found in database'
      });
    }
    
    console.log('✅ Found nominator in database:', nominator);
    
    // 2. Check nominations by this nominator
    const { data: nominations, error: nominationsError } = await supabase
      .from('nominations')
      .select(`
        id,
        state,
        subcategory_id,
        created_at,
        nominees (
          id,
          type,
          firstname,
          lastname,
          company_name
        )
      `)
      .eq('nominator_id', nominator.id);
    
    if (nominationsError) {
      console.error('Error fetching nominations:', nominationsError);
    }
    
    // 3. Test HubSpot sync
    let syncResult = null;
    try {
      const syncData = {
        firstname: nominator.firstname,
        lastname: nominator.lastname,
        email: nominator.email,
        linkedin: nominator.linkedin,
        company: nominator.company,
        jobTitle: nominator.job_title,
        phone: nominator.phone,
        country: nominator.country,
      };
      
      console.log('🔄 Testing HubSpot sync with data:', syncData);
      syncResult = await syncNominatorToHubSpot(syncData);
      console.log('✅ HubSpot sync result:', syncResult);
    } catch (syncError) {
      console.error('❌ HubSpot sync failed:', syncError);
      syncResult = {
        success: false,
        error: syncError instanceof Error ? syncError.message : 'Unknown sync error'
      };
    }
    
    // 4. Check HubSpot outbox
    const { data: outboxEntries, error: outboxError } = await supabase
      .from('hubspot_outbox')
      .select('*')
      .contains('payload', { nominator: { email: email.toLowerCase() } })
      .order('created_at', { ascending: false })
      .limit(5);
    
    return NextResponse.json({
      found: true,
      nominator,
      nominations: nominations || [],
      syncResult,
      outboxEntries: outboxEntries || [],
      hubspotEnabled: process.env.HUBSPOT_SYNC_ENABLED === 'true',
      hubspotConfigured: !!(process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN)
    });
    
  } catch (error) {
    console.error('Debug nominator API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}