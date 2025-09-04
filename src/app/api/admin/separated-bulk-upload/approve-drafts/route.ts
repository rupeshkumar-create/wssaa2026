import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Function to determine Loops user group based on nomination type and category
function getLoopsUserGroup(type: 'person' | 'company', category: string): string {
  // Person categories
  if (type === 'person') {
    if (category.includes('usa') || category.includes('north-america')) {
      return 'nominees-person-usa';
    } else if (category.includes('europe')) {
      return 'nominees-person-europe';
    } else if (category.includes('global')) {
      return 'nominees-person-global';
    } else {
      return 'nominees-person-general';
    }
  }
  
  // Company categories
  if (type === 'company') {
    if (category.includes('usa') || category.includes('north-america')) {
      return 'nominees-company-usa';
    } else if (category.includes('europe')) {
      return 'nominees-company-europe';
    } else if (category.includes('global')) {
      return 'nominees-company-global';
    } else {
      return 'nominees-company-general';
    }
  }

  return 'nominees-general';
}

// Function to sync nomination to Loops
async function syncToLoops(nomination: any): Promise<{ success: boolean; error?: string }> {
  try {
    const loopsApiKey = process.env.LOOPS_API_KEY;
    if (!loopsApiKey) {
      throw new Error('Loops API key not configured');
    }

    const userGroup = getLoopsUserGroup(nomination.type, nomination.category);
    
    // Prepare contact data based on nomination type
    let contactData: any = {
      email: nomination.nominee_data.email,
      userGroup: userGroup,
      source: 'WSA2026_Bulk_Upload',
      category: nomination.category,
      nominationType: nomination.type,
      status: 'approved',
      country: nomination.nominee_data.country
    };

    if (nomination.type === 'person') {
      contactData = {
        ...contactData,
        firstName: nomination.nominee_data.firstName,
        lastName: nomination.nominee_data.lastName,
        jobTitle: nomination.nominee_data.jobTitle,
        company: nomination.nominee_data.companyName || nomination.company_data?.name || '',
        linkedin: nomination.nominee_data.linkedin || '',
        phone: nomination.nominee_data.phone || ''
      };
    } else {
      contactData = {
        ...contactData,
        firstName: nomination.nominee_data.name,
        lastName: '',
        company: nomination.nominee_data.name,
        website: nomination.nominee_data.website || '',
        industry: nomination.nominee_data.industry || '',
        companySize: nomination.nominee_data.size || '',
        phone: nomination.nominee_data.phone || ''
      };
    }

    // Add nominator data if available
    if (nomination.nominator_data) {
      contactData.nominatorName = nomination.nominator_data.name;
      contactData.nominatorEmail = nomination.nominator_data.email;
      contactData.nominatorCompany = nomination.nominator_data.company;
    }

    // Create or update contact in Loops
    const response = await fetch('https://app.loops.so/api/v1/contacts/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loopsApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Loops API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    
    // Update nomination with Loops sync info
    await supabase
      .from('nominations')
      .update({
        loops_contact_id: result.id,
        loops_user_group: userGroup,
        loops_synced_at: new Date().toISOString(),
        loops_sync_status: 'synced'
      })
      .eq('id', nomination.id);

    return { success: true };

  } catch (error) {
    console.error('Error syncing to Loops:', error);
    
    // Update nomination with sync error
    await supabase
      .from('nominations')
      .update({
        loops_sync_status: 'failed',
        loops_sync_error: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', nomination.id);

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Loops sync failed' 
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { batchId } = await request.json();

    if (!batchId) {
      return NextResponse.json(
        { success: false, error: 'Batch ID is required' },
        { status: 400 }
      );
    }

    // Fetch all draft nominations for this batch
    const { data: draftNominations, error: fetchError } = await supabase
      .from('nominations')
      .select('*')
      .eq('bulk_upload_batch_id', batchId)
      .eq('state', 'draft');

    if (fetchError) {
      throw fetchError;
    }

    if (!draftNominations || draftNominations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No draft nominations found for this batch' },
        { status: 404 }
      );
    }

    let approvedCount = 0;
    let syncedCount = 0;
    let syncErrors: string[] = [];

    // Process each draft nomination
    for (const nomination of draftNominations) {
      try {
        // Update state to approved
        const { error: updateError } = await supabase
          .from('nominations')
          .update({
            state: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: 'admin'
          })
          .eq('id', nomination.id);

        if (updateError) {
          throw updateError;
        }

        approvedCount++;

        // Sync to Loops
        const syncResult = await syncToLoops(nomination);
        if (syncResult.success) {
          syncedCount++;
        } else {
          syncErrors.push(`${nomination.nominee_data.displayName || nomination.nominee_data.name}: ${syncResult.error}`);
        }

      } catch (error) {
        console.error(`Error processing nomination ${nomination.id}:`, error);
        syncErrors.push(`${nomination.nominee_data.displayName || nomination.nominee_data.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update batch with approval info
    const { error: batchUpdateError } = await supabase
      .from('separated_bulk_upload_batches')
      .update({
        approved_rows: approvedCount,
        loops_synced_rows: syncedCount,
        approval_completed_at: new Date().toISOString()
      })
      .eq('id', batchId);

    if (batchUpdateError) {
      console.error('Error updating batch:', batchUpdateError);
    }

    return NextResponse.json({
      success: true,
      data: {
        approved_count: approvedCount,
        synced_count: syncedCount,
        sync_errors: syncErrors,
        total_processed: draftNominations.length
      }
    });

  } catch (error) {
    console.error('Error approving draft nominations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Approval failed' 
      },
      { status: 500 }
    );
  }
}