import { NextRequest, NextResponse } from 'next/server';
import { testHubSpotRealTimeSync } from '@/server/hubspot/realtime-sync';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing HubSpot connection...');

    // Check if HubSpot sync is enabled
    const hubspotEnabled = process.env.HUBSPOT_SYNC_ENABLED === 'true' && 
                          (process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN);

    if (!hubspotEnabled) {
      return NextResponse.json({
        success: false,
        error: 'HubSpot sync is not enabled or configured',
        config: {
          syncEnabled: process.env.HUBSPOT_SYNC_ENABLED,
          hasToken: !!(process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN)
        }
      }, { status: 400 });
    }

    // Test HubSpot connection
    const result = await testHubSpotRealTimeSync();

    if (result.success) {
      console.log('✅ HubSpot connection test passed');
      
      return NextResponse.json({
        success: true,
        message: 'HubSpot connection test passed',
        accountInfo: {
          portalId: result.accountInfo?.portalId,
          accountType: result.accountInfo?.accountType,
          timeZone: result.accountInfo?.timeZone
        },
        customProperties: {
          total: result.customProperties?.length || 0,
          wsaProperties: result.customProperties?.filter((p: any) => p.name.startsWith('wsa_')).length || 0
        }
      });
    } else {
      console.error('❌ HubSpot connection test failed:', result.error);
      
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ HubSpot connection test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}