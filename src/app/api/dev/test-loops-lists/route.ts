import { NextRequest, NextResponse } from 'next/server';
import { loopsClient } from '@/server/loops/client';
import { 
  syncNominatorToLoops, 
  syncNomineeToLoops, 
  syncVoterToLoops,
  updateNominatorToLive 
} from '@/server/loops/realtime-sync';

/**
 * Development endpoint to test Loops list integration
 * 
 * POST /api/dev/test-loops-lists
 * 
 * Body options:
 * - { action: "test-basic-operations", email: "test@example.com" }
 * - { action: "test-nominator-sync", email: "test@example.com" }
 * - { action: "test-nominee-sync", email: "test@example.com" }
 * - { action: "test-voter-sync", email: "test@example.com" }
 * - { action: "test-nominator-to-live", email: "test@example.com" }
 * - { action: "get-lists" }
 * - { action: "batch-test", emails: ["email1@example.com", "email2@example.com"] }
 */
export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    // Check if Loops is enabled
    if (!loopsClient.constructor.isEnabled()) {
      return NextResponse.json(
        { 
          error: 'Loops sync is not enabled',
          loopsEnabled: false,
          apiKeyConfigured: !!process.env.LOOPS_API_KEY,
          syncEnabled: process.env.LOOPS_SYNC_ENABLED === 'true'
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, email, emails } = body;

    console.log(`🧪 Testing Loops lists - Action: ${action}`);

    switch (action) {
      case 'test-basic-operations': {
        if (!email) {
          return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const results = {
          addToVoters: await loopsClient.addToList(email, loopsClient.LIST_IDS.VOTERS),
          addToNominees: await loopsClient.addToList(email, loopsClient.LIST_IDS.NOMINEES),
          addToNominators: await loopsClient.addToList(email, loopsClient.LIST_IDS.NOMINATORS),
          removeFromVoters: await loopsClient.removeFromList(email, loopsClient.LIST_IDS.VOTERS),
          removeFromNominees: await loopsClient.removeFromList(email, loopsClient.LIST_IDS.NOMINEES),
          removeFromNominators: await loopsClient.removeFromList(email, loopsClient.LIST_IDS.NOMINATORS),
        };

        return NextResponse.json({
          success: true,
          action: 'test-basic-operations',
          email,
          results,
          listIds: loopsClient.LIST_IDS
        });
      }

      case 'test-nominator-sync': {
        if (!email) {
          return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const nominatorData = {
          firstname: 'Test',
          lastname: 'Nominator',
          email: email,
          company: 'Test Company',
          jobTitle: 'Test Role',
          country: 'United States'
        };

        const result = await syncNominatorToLoops(nominatorData);

        return NextResponse.json({
          success: result.success,
          action: 'test-nominator-sync',
          email,
          result,
          expectedList: 'Nominators',
          listId: loopsClient.LIST_IDS.NOMINATORS
        });
      }

      case 'test-nominee-sync': {
        if (!email) {
          return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const nomineeData = {
          firstname: 'Test',
          lastname: 'Nominee',
          email: email,
          type: 'person' as const,
          subcategoryId: 'test-category',
          nominationId: 'test-nomination-123',
          liveUrl: 'https://worldstaffingawards.com/nominee/test-nominee'
        };

        const result = await syncNomineeToLoops(nomineeData);

        return NextResponse.json({
          success: result.success,
          action: 'test-nominee-sync',
          email,
          result,
          expectedList: 'Nominees',
          listId: loopsClient.LIST_IDS.NOMINEES
        });
      }

      case 'test-voter-sync': {
        if (!email) {
          return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const voterData = {
          firstname: 'Test',
          lastname: 'Voter',
          email: email,
          company: 'Voter Company',
          votedFor: 'Test Nominee',
          subcategoryId: 'test-category'
        };

        const result = await syncVoterToLoops(voterData);

        return NextResponse.json({
          success: result.success,
          action: 'test-voter-sync',
          email,
          result,
          expectedList: 'Voters',
          listId: loopsClient.LIST_IDS.VOTERS
        });
      }

      case 'test-nominator-to-live': {
        if (!email) {
          return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const result = await updateNominatorToLive(email, {
          name: 'Test Nominee',
          liveUrl: 'https://worldstaffingawards.com/nominee/test-nominee'
        });

        return NextResponse.json({
          success: result.success,
          action: 'test-nominator-to-live',
          email,
          result,
          expectedList: 'Nominator Live',
          listId: loopsClient.LIST_IDS.NOMINATOR_LIVE,
          note: 'Should move from Nominators list to Nominator Live list'
        });
      }

      case 'get-lists': {
        const result = await loopsClient.getLists();

        return NextResponse.json({
          success: result.success,
          action: 'get-lists',
          result,
          configuredLists: loopsClient.LIST_IDS
        });
      }

      case 'batch-test': {
        if (!emails || !Array.isArray(emails)) {
          return NextResponse.json({ error: 'Emails array is required' }, { status: 400 });
        }

        const result = await loopsClient.batchAddToList(emails, loopsClient.LIST_IDS.VOTERS);

        return NextResponse.json({
          success: result.success,
          action: 'batch-test',
          emails,
          result,
          listId: loopsClient.LIST_IDS.VOTERS
        });
      }

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action',
            availableActions: [
              'test-basic-operations',
              'test-nominator-sync',
              'test-nominee-sync', 
              'test-voter-sync',
              'test-nominator-to-live',
              'get-lists',
              'batch-test'
            ]
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Loops list test error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Loops List Integration Test Endpoint',
    description: 'Use POST with action parameter to test different list operations',
    availableActions: [
      'test-basic-operations - Test basic add/remove operations',
      'test-nominator-sync - Test nominator sync with list integration',
      'test-nominee-sync - Test nominee sync with list integration',
      'test-voter-sync - Test voter sync with list integration',
      'test-nominator-to-live - Test nominator to live migration',
      'get-lists - Get all available lists',
      'batch-test - Test batch operations'
    ],
    listIds: {
      VOTERS: 'cmegxu1fc0gw70i1d7g35gqb0',
      NOMINEES: 'cmegxubbj0jr60h33ahctgicr',
      NOMINATORS: 'cmegxuqag0jth0h334yy17csd',
      NOMINATOR_LIVE: 'cmf5a92vx13r10i1mgbyr8wgv'
    }
  });
}