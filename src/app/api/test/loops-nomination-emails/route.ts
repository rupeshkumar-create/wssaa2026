import { NextRequest, NextResponse } from 'next/server';
import { loopsTransactional } from '@/server/loops/transactional';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint for Loops nomination transactional emails
 * GET /api/test/loops-nomination-emails
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailType = searchParams.get('type') || 'all';
    const testEmail = searchParams.get('email') || 'test@example.com';

    console.log('🧪 Testing Loops nomination emails:', { emailType, testEmail });

    const results: any = {};

    // Test nominator confirmation email
    if (emailType === 'nominator' || emailType === 'all') {
      console.log('📧 Testing nominator confirmation email...');
      
      const nominatorResult = await loopsTransactional.sendNominatorConfirmationEmail({
        nominatorFirstName: 'John',
        nominatorLastName: 'Doe',
        nominatorEmail: testEmail,
        nominatorCompany: 'Test Company Inc.',
        nominatorJobTitle: 'Senior Recruiter',
        nomineeDisplayName: 'Jane Smith',
        categoryName: 'Individual Awards',
        subcategoryName: 'Top Recruiter',
        submissionTimestamp: new Date().toISOString()
      });

      results.nominatorConfirmation = nominatorResult;
      console.log('📧 Nominator confirmation result:', nominatorResult);
    }

    // Test nominee approval email
    if (emailType === 'nominee' || emailType === 'all') {
      console.log('📧 Testing nominee approval email...');
      
      const nomineeResult = await loopsTransactional.sendNomineeApprovalEmail({
        nomineeFirstName: 'Jane',
        nomineeLastName: 'Smith',
        nomineeEmail: testEmail,
        nomineeDisplayName: 'Jane Smith',
        nomineeUrl: 'http://localhost:3000/nominee/jane-smith',
        categoryName: 'Individual Awards',
        subcategoryName: 'Top Recruiter',
        approvalTimestamp: new Date().toISOString()
      });

      results.nomineeApproval = nomineeResult;
      console.log('📧 Nominee approval result:', nomineeResult);
    }

    // Test nominator approval email
    if (emailType === 'nominator-approval' || emailType === 'all') {
      console.log('📧 Testing nominator approval email...');
      
      const nominatorApprovalResult = await loopsTransactional.sendNominatorApprovalEmail({
        nominatorFirstName: 'John',
        nominatorLastName: 'Doe',
        nominatorEmail: testEmail,
        nominatorCompany: 'Test Company Inc.',
        nomineeDisplayName: 'Jane Smith',
        nomineeUrl: 'http://localhost:3000/nominee/jane-smith',
        categoryName: 'Individual Awards',
        subcategoryName: 'Top Recruiter',
        approvalTimestamp: new Date().toISOString()
      });

      results.nominatorApproval = nominatorApprovalResult;
      console.log('📧 Nominator approval result:', nominatorApprovalResult);
    }

    return NextResponse.json({
      success: true,
      message: 'Loops nomination email tests completed',
      emailType,
      testEmail,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Loops nomination email test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Test specific email with custom data
 * POST /api/test/loops-nomination-emails
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailType, emailData } = body;

    console.log('🧪 Testing specific Loops nomination email:', { emailType, emailData });

    let result;

    switch (emailType) {
      case 'nominator-confirmation':
        result = await loopsTransactional.sendNominatorConfirmationEmail(emailData);
        break;
      
      case 'nominee-approval':
        result = await loopsTransactional.sendNomineeApprovalEmail(emailData);
        break;
      
      case 'nominator-approval':
        result = await loopsTransactional.sendNominatorApprovalEmail(emailData);
        break;
      
      default:
        throw new Error(`Unknown email type: ${emailType}`);
    }

    return NextResponse.json({
      success: true,
      message: `${emailType} email test completed`,
      emailType,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Loops nomination email POST test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}