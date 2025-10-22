import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if admin environment variables are set
    const adminEmails = process.env.ADMIN_EMAILS;
    const adminHashes = process.env.ADMIN_PASSWORD_HASHES;
    const sessionSecret = process.env.SERVER_SESSION_SECRET;
    
    const envCheck = {
      adminEmailsSet: !!adminEmails,
      adminHashesSet: !!adminHashes,
      sessionSecretSet: !!sessionSecret,
      adminEmailsCount: adminEmails ? adminEmails.split(',').length : 0,
      adminHashesCount: adminHashes ? adminHashes.split(',').length : 0,
      hashFormat: adminHashes ? {
        startsWithDollar2b: adminHashes.startsWith('$2b$'),
        length: adminHashes.length,
        preview: adminHashes.substring(0, 10) + '...'
      } : null
    };
    
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      envCheck
    });
    
  } catch (error) {
    console.error('Environment test error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check environment' },
      { status: 500 }
    );
  }
}