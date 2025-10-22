import { NextRequest, NextResponse } from 'next/server';
import { supabase as supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/send-nominee-email - Send email to nominee
 */
export async function POST(request: NextRequest) {
  try {
    const { nominationId, email, transactionalId } = await request.json();

    if (!nominationId || !email || !transactionalId) {
      return NextResponse.json(
        { error: 'Missing required fields: nominationId, email, transactionalId' },
        { status: 400 }
      );
    }

    // Get nomination details
    const { data: nomination, error: nominationError } = await supabaseAdmin
      .from('nominations')
      .select('*')
      .eq('id', nominationId)
      .single();

    if (nominationError || !nomination) {
      return NextResponse.json(
        { error: 'Nomination not found' },
        { status: 404 }
      );
    }

    // Send email via Loops
    const loopsResponse = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionalId: transactionalId,
        email: email,
        dataVariables: {
          nominee_name: nomination.type === 'person' 
            ? `${nomination.firstname || ''} ${nomination.lastname || ''}`.trim()
            : nomination.companyName || nomination.company_name || 'Company',
          category: nomination.subcategory_id,
          live_url: nomination.liveUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/nominee/${nomination.id}`,
          nomination_type: nomination.type,
        }
      }),
    });

    const loopsResult = await loopsResponse.json();

    if (!loopsResponse.ok) {
      console.error('Loops API error:', loopsResult);
      
      // Log failed email attempt
      await supabaseAdmin
        .from('nominee_email_log')
        .insert({
          nomination_id: nominationId,
          email_address: email,
          transactional_id: transactionalId,
          status: 'failed',
          error_message: loopsResult.message || 'Unknown error'
        });

      return NextResponse.json(
        { error: 'Failed to send email', details: loopsResult.message },
        { status: 500 }
      );
    }

    // Log successful email
    const { error: logError } = await supabaseAdmin
      .from('nominee_email_log')
      .insert({
        nomination_id: nominationId,
        email_address: email,
        transactional_id: transactionalId,
        status: 'sent'
      });

    if (logError) {
      console.error('Failed to log email:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      loopsResponse: loopsResult
    });

  } catch (error) {
    console.error('Send nominee email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}