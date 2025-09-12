import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint for Loops transactional email functionality
 * Only available in development mode
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { email = 'rupesh.kumar@candidate.ly', testType = 'vote_confirmation' } = body;

    console.log('🧪 Testing Loops transactional email:', { email, testType });

    if (!process.env.LOOPS_API_KEY) {
      return NextResponse.json(
        { error: 'LOOPS_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const { loopsTransactional } = await import('@/server/loops/transactional');

    let result;

    if (testType === 'vote_confirmation') {
      // Test vote confirmation email
      const testVoteData = {
        voterFirstName: 'John',
        voterLastName: 'Doe',
        voterEmail: email,
        nomineeDisplayName: 'Jane Smith (Test Nominee)',
        nomineeUrl: 'https://worldstaffingawards.com/nominee/jane-smith',
        categoryName: 'Top Recruiter',
        subcategoryName: 'Top Recruiter',
        voteTimestamp: new Date().toISOString()
      };

      result = await loopsTransactional.sendVoteConfirmationEmail(testVoteData);
    } else if (testType === 'raw') {
      // Test raw transactional email
      result = await loopsTransactional.sendTransactionalEmail({
        transactionalId: 'cmfb0nmgv7ewn0p0i063876oq',
        email: email,
        dataVariables: {
          voterFirstName: 'Test',
          voterLastName: 'User',
          voterFullName: 'Test User',
          nomineeDisplayName: 'Test Nominee',
          nomineeUrl: 'https://example.com/nominee/test',
          categoryName: 'Test Category',
          subcategoryName: 'Test Subcategory',
          voteTimestamp: new Date().toISOString(),
          voteDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          voteTime: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
          })
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid testType. Use "vote_confirmation" or "raw"' },
        { status: 400 }
      );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${testType} email sent successfully`,
        messageId: result.messageId,
        email: email
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          testType: testType,
          email: email
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Test transactional email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: 'Loops Transactional Email Test Endpoint',
    usage: {
      method: 'POST',
      body: {
        email: 'test@example.com (optional, defaults to rupesh.kumar@candidate.ly)',
        testType: 'vote_confirmation | raw (optional, defaults to vote_confirmation)'
      }
    },
    examples: [
      {
        description: 'Test vote confirmation email',
        body: {
          email: 'your-email@example.com',
          testType: 'vote_confirmation'
        }
      },
      {
        description: 'Test raw transactional email',
        body: {
          email: 'your-email@example.com',
          testType: 'raw'
        }
      }
    ]
  });
}