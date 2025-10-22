import { NextRequest, NextResponse } from 'next/server';
import { supabase as supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/update-nominee-name - Update nominee name (person or company)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nominationId, type, firstname, lastname, companyName } = body;

    if (!nominationId) {
      return NextResponse.json(
        { error: 'Missing nominationId' },
        { status: 400 }
      );
    }

    if (!type || !['person', 'company'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be person or company' },
        { status: 400 }
      );
    }

    // Get the nomination to find the nominee
    const { data: nomination, error: nomError } = await supabaseAdmin
      .from('nominations')
      .select('nominee_id, state')
      .eq('id', nominationId)
      .single();

    if (nomError) {
      throw new Error(`Failed to find nomination: ${nomError.message}`);
    }

    // Prepare updates based on type
    const nomineeUpdates: any = {};
    
    if (type === 'person') {
      if (!firstname || !lastname) {
        return NextResponse.json(
          { error: 'First name and last name are required for person nominees' },
          { status: 400 }
        );
      }
      nomineeUpdates.firstname = firstname.trim();
      nomineeUpdates.lastname = lastname.trim();
    } else if (type === 'company') {
      if (!companyName) {
        return NextResponse.json(
          { error: 'Company name is required for company nominees' },
          { status: 400 }
        );
      }
      nomineeUpdates.company_name = companyName.trim();
    }

    // Update the nominee
    const { data: updatedNominee, error: updateError } = await supabaseAdmin
      .from('nominees')
      .update(nomineeUpdates)
      .eq('id', nomination.nominee_id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update nominee: ${updateError.message}`);
    }

    // Return the updated information
    const displayName = type === 'person' 
      ? `${updatedNominee.firstname} ${updatedNominee.lastname}`
      : updatedNominee.company_name;

    return NextResponse.json({
      success: true,
      data: {
        nomineeId: updatedNominee.id,
        nominationId,
        type,
        displayName,
        firstname: updatedNominee.firstname,
        lastname: updatedNominee.lastname,
        companyName: updatedNominee.company_name,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('POST /api/admin/update-nominee-name error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update nominee name' },
      { status: 500 }
    );
  }
}