import { NextRequest, NextResponse } from 'next/server';
import { setupHubSpotCustomProperties } from '@/server/hubspot/realtime-sync';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setting up HubSpot custom properties...');

    // Check if HubSpot sync is enabled
    const hubspotEnabled = process.env.HUBSPOT_SYNC_ENABLED === 'true' && 
                          (process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN);

    if (!hubspotEnabled) {
      return NextResponse.json({
        success: false,
        error: 'HubSpot sync is not enabled or configured'
      }, { status: 400 });
    }

    // Setup custom properties
    const result = await setupHubSpotCustomProperties();

    if (result.success) {
      console.log(`✅ HubSpot properties setup completed. Created: ${result.created.length} properties`);
      
      return NextResponse.json({
        success: true,
        message: 'HubSpot custom properties setup completed',
        created: result.created,
        totalCreated: result.created.length
      });
    } else {
      console.error('❌ HubSpot properties setup failed:', result.error);
      
      return NextResponse.json({
        success: false,
        error: result.error,
        created: result.created
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ HubSpot properties setup error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}