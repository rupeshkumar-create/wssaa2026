import { NextRequest, NextResponse } from 'next/server';
import { supabase as supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Load nominations from local file when Supabase is not configured
function getLocalNominations(statusFilter?: string | null) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Read the local nominations data
    const dataPath = path.join(process.cwd(), 'data', 'nominations.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const nominations = JSON.parse(rawData);
    
    // Filter by status if provided
    let filteredNominations = nominations;
    if (statusFilter) {
      filteredNominations = nominations.filter((nom: any) => nom.status === statusFilter);
    }
    
    // Transform to admin-friendly format
    const adminNominations = filteredNominations.map((nom: any) => ({
      id: nom.id,
      type: nom.type,
      state: nom.status, // Map 'status' to 'state' for admin interface
      categoryGroupId: 'staffing',
      subcategoryId: nom.category,
      subcategory_id: nom.category, // Frontend expects this
      
      // Nominee data
      nomineeId: nom.id,
      firstname: nom.type === 'person' ? nom.nominee.name.split(' ')[0] : undefined,
      lastname: nom.type === 'person' ? nom.nominee.name.split(' ').slice(1).join(' ') : undefined,
      jobtitle: nom.nominee.title,
      personEmail: nom.nominator.email, // Use nominator email as placeholder
      personLinkedin: nom.nominee.linkedin,
      headshotUrl: nom.nominee.imageUrl,
      headshot_url: nom.nominee.imageUrl, // Frontend expects this
      whyMe: nom.whyVoteForMe,
      
      companyName: nom.type === 'company' ? nom.nominee.name : nom.company?.name,
      company_name: nom.type === 'company' ? nom.nominee.name : nom.company?.name, // Frontend expects this
      companyWebsite: nom.company?.website,
      companyLinkedin: nom.nominee.linkedin,
      logoUrl: nom.type === 'company' ? nom.nominee.imageUrl : undefined,
      logo_url: nom.type === 'company' ? nom.nominee.imageUrl : undefined, // Frontend expects this
      whyUs: nom.whyVoteForMe,
      
      liveUrl: nom.liveUrl,
      votes: Math.floor(Math.random() * 100) + 10, // Random votes for demo
      additionalVotes: 0,
      createdAt: nom.createdAt,
      created_at: nom.createdAt, // Frontend expects this
      updatedAt: nom.updatedAt,
      approvedAt: nom.status === 'approved' ? nom.updatedAt : null,
      approvedBy: nom.status === 'approved' ? 'admin' : null,
      adminNotes: null,
      rejectionReason: null,
      
      // Nominator data
      nominatorId: nom.id + '-nominator',
      nominatorEmail: nom.nominator.email,
      nominatorFirstname: nom.nominator.name.split(' ')[0],
      nominatorLastname: nom.nominator.name.split(' ').slice(1).join(' '),
      nominatorName: nom.nominator.name,
      nominatorLinkedin: nom.nominator.linkedin,
      nominatorCompany: nom.nominator.company,
      nominatorJobTitle: 'Nominator',
      
      // Computed fields for display
      displayName: nom.nominee.name,
      imageUrl: nom.nominee.imageUrl,
      
      // Source tracking
      nominationSource: 'public'
    }));

    return NextResponse.json({
      success: true,
      data: adminNominations,
      count: adminNominations.length,
      message: `Loaded ${adminNominations.length} nominations from local data file`
    });
    
  } catch (error) {
    console.error('Error loading local nominations:', error);
    return NextResponse.json({
      success: false,
      data: [],
      count: 0,
      error: 'Failed to load local nominations data'
    }, { status: 500 });
  }
}

/**
 * GET /api/admin/nominations-improved - Get all nominations with complete data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Check if Supabase is configured with real values (not placeholders)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('your-project') || 
        supabaseKey.includes('your_service_role_key')) {
      console.log('Supabase not configured, loading nominations from local file');
      return getLocalNominations(status);
    }

    try {
      // Use the admin_nominations view for complete data
      let query = supabaseAdmin
        .from('admin_nominations')
        .select('*');

      if (status) {
        query = query.eq('state', status);
      }

      query = query.order('created_at', { ascending: false });

      const { data: nominations, error } = await query;

      if (error) {
        console.error('Failed to get admin nominations:', error);
        // Fall back to local data if database query fails
        return getLocalNominations(status);
      }

      // Transform to admin-friendly format
      const adminNominations = nominations.map(nom => ({
      id: nom.nomination_id,
      type: nom.nominee_type,
      state: nom.state,
      categoryGroupId: nom.category_group_id,
      subcategoryId: nom.subcategory_id,
      subcategory_id: nom.subcategory_id, // Frontend expects this
      
      // Nominee data
      nomineeId: nom.nominee_id,
      firstname: nom.nominee_firstname,
      lastname: nom.nominee_lastname,
      jobtitle: nom.nominee_jobtitle,
      personEmail: nom.nominee_person_email,
      personLinkedin: nom.nominee_person_linkedin,
      headshotUrl: nom.nominee_headshot_url,
      headshot_url: nom.nominee_headshot_url, // Frontend expects this
      whyMe: nom.nominee_why_me,
      
      companyName: nom.nominee_company_name,
      company_name: nom.nominee_company_name, // Frontend expects this
      companyWebsite: nom.nominee_company_website,
      companyLinkedin: nom.nominee_company_linkedin,
      logoUrl: nom.nominee_logo_url,
      logo_url: nom.nominee_logo_url, // Frontend expects this
      whyUs: nom.nominee_why_us,
      
      liveUrl: nom.nominee_live_url,
      votes: nom.votes || 0, // Real votes
      additionalVotes: nom.additional_votes || 0, // Manual votes
      createdAt: nom.created_at,
      created_at: nom.created_at, // Frontend expects this
      updatedAt: nom.updated_at,
      approvedAt: nom.approved_at,
      approvedBy: nom.approved_by,
      adminNotes: nom.admin_notes,
      rejectionReason: nom.rejection_reason,
      
      // Nominator data
      nominatorId: nom.nominator_id,
      nominatorEmail: nom.nominator_email,
      nominatorFirstname: nom.nominator_firstname,
      nominatorLastname: nom.nominator_lastname,
      nominatorName: `${nom.nominator_firstname || ''} ${nom.nominator_lastname || ''}`.trim(),
      nominatorLinkedin: nom.nominator_linkedin,
      nominatorCompany: nom.nominator_company,
      nominatorJobTitle: nom.nominator_job_title,
      
      // Computed fields for display
      displayName: nom.nominee_display_name || (nom.nominee_type === 'person' 
        ? `${nom.nominee_firstname || ''} ${nom.nominee_lastname || ''}`.trim()
        : nom.nominee_company_name || 'Unknown'
      ),
      imageUrl: nom.nominee_image_url || (nom.nominee_type === 'person' 
        ? nom.nominee_headshot_url 
        : nom.nominee_logo_url
      ),
      
      // Source tracking
      nominationSource: nom.nomination_source || 'public'
      }));

      return NextResponse.json({
        success: true,
        data: adminNominations,
        count: adminNominations.length
      });
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Fall back to local data if database is not accessible
      return getLocalNominations(status);
    }

  } catch (error) {
    console.error('GET /api/admin/nominations-improved error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get nominations' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/nominations-improved - Update nomination status or details
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      nominationId, 
      state, 
      adminNotes, 
      rejectionReason,
      approvedBy,
      // Nominee updates
      liveUrl, 
      whyMe, 
      whyUs, 
      headshotUrl, 
      logoUrl,
      bio,
      achievements,
      linkedin
    } = body;

    if (!nominationId) {
      return NextResponse.json(
        { error: 'Missing nominationId' },
        { status: 400 }
      );
    }

    // If state is provided, validate it
    if (state && !['submitted', 'approved', 'rejected'].includes(state)) {
      return NextResponse.json(
        { error: 'Invalid state. Must be submitted, approved, or rejected' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured with real values (not placeholders)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('your-project') || 
        supabaseKey.includes('your_service_role_key')) {
      console.log('Supabase not configured, updating local nominations file');
      return updateLocalNomination(nominationId, {
        state, adminNotes, rejectionReason, approvedBy,
        liveUrl, whyMe, whyUs, headshotUrl, logoUrl, bio, achievements, linkedin
      });
    }

    try {
      // Supabase update logic (original code)
      const { data: nomination, error: nomError } = await supabaseAdmin
        .from('nominations')
        .select('nominee_id, state')
        .eq('id', nominationId)
        .single();

      if (nomError) {
        throw new Error(`Failed to find nomination: ${nomError.message}`);
      }

      // Update nomination
      const nominationUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (state) {
        nominationUpdates.state = state;
        if (state === 'approved') {
          nominationUpdates.approved_at = new Date().toISOString();
          nominationUpdates.approved_by = approvedBy || 'admin';
        } else if (state === 'rejected') {
          nominationUpdates.rejection_reason = rejectionReason;
        }
      }

      if (adminNotes !== undefined) nominationUpdates.admin_notes = adminNotes;

      const { data: updatedNomination, error: updateError } = await supabaseAdmin
        .from('nominations')
        .update(nominationUpdates)
        .eq('id', nominationId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update nomination: ${updateError.message}`);
      }

      // Update nominee if provided
      const nomineeUpdates: any = {};
      let hasNomineeUpdates = false;

      if (liveUrl !== undefined) {
        nomineeUpdates.live_url = liveUrl;
        hasNomineeUpdates = true;
      }
      if (whyMe !== undefined) {
        nomineeUpdates.why_me = whyMe;
        hasNomineeUpdates = true;
      }
      if (whyUs !== undefined) {
        nomineeUpdates.why_us = whyUs;
        hasNomineeUpdates = true;
      }
      if (headshotUrl !== undefined) {
        nomineeUpdates.headshot_url = headshotUrl;
        hasNomineeUpdates = true;
      }
      if (logoUrl !== undefined) {
        nomineeUpdates.logo_url = logoUrl;
        hasNomineeUpdates = true;
      }
      if (bio !== undefined) {
        nomineeUpdates.bio = bio;
        hasNomineeUpdates = true;
      }
      if (achievements !== undefined) {
        nomineeUpdates.achievements = achievements;
        hasNomineeUpdates = true;
      }

      if (hasNomineeUpdates) {
        const { error: nomineeError } = await supabaseAdmin
          .from('nominees')
          .update(nomineeUpdates)
          .eq('id', nomination.nominee_id);

        if (nomineeError) {
          console.warn('Failed to update nominee:', nomineeError);
          // Don't fail the whole operation for nominee updates
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          id: updatedNomination.id,
          state: updatedNomination.state,
          adminNotes: updatedNomination.admin_notes,
          rejectionReason: updatedNomination.rejection_reason,
          approvedAt: updatedNomination.approved_at,
          approvedBy: updatedNomination.approved_by,
          updatedAt: updatedNomination.updated_at
        }
      });
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Fall back to local data if database is not accessible
      return updateLocalNomination(nominationId, {
        state, adminNotes, rejectionReason, approvedBy,
        liveUrl, whyMe, whyUs, headshotUrl, logoUrl, bio, achievements, linkedin
      });
    }

  } catch (error) {
    console.error('PATCH /api/admin/nominations-improved error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update nomination' },
      { status: 500 }
    );
  }
}

// Helper function to update local nominations file
function updateLocalNomination(nominationId: string, updates: any) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const dataPath = path.join(process.cwd(), 'data', 'nominations.json');
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json(
        { error: 'Nominations data file not found' },
        { status: 404 }
      );
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const nominations = JSON.parse(rawData);
    
    // Find and update the nomination
    const nominationIndex = nominations.findIndex((nom: any) => nom.id === nominationId);
    if (nominationIndex === -1) {
      return NextResponse.json(
        { error: 'Nomination not found' },
        { status: 404 }
      );
    }
    
    const nomination = nominations[nominationIndex];
    const now = new Date().toISOString();
    
    // Update nomination fields
    if (updates.state) {
      nomination.status = updates.state;
      if (updates.state === 'approved') {
        nomination.approvedAt = now;
        nomination.approvedBy = updates.approvedBy || 'admin';
      }
    }
    if (updates.adminNotes !== undefined) nomination.adminNotes = updates.adminNotes;
    if (updates.rejectionReason !== undefined) nomination.rejectionReason = updates.rejectionReason;
    
    // Update nominee fields
    if (updates.liveUrl !== undefined) nomination.liveUrl = updates.liveUrl;
    if (updates.whyMe !== undefined) nomination.whyVoteForMe = updates.whyMe;
    if (updates.whyUs !== undefined) nomination.whyVoteForMe = updates.whyUs;
    if (updates.headshotUrl !== undefined) nomination.nominee.imageUrl = updates.headshotUrl;
    if (updates.logoUrl !== undefined) nomination.nominee.imageUrl = updates.logoUrl;
    if (updates.linkedin !== undefined) nomination.nominee.linkedin = updates.linkedin;
    
    nomination.updatedAt = now;
    
    // Save updated data
    fs.writeFileSync(dataPath, JSON.stringify(nominations, null, 2));
    
    return NextResponse.json({
      success: true,
      data: {
        id: nominationId,
        state: nomination.status,
        adminNotes: nomination.adminNotes,
        rejectionReason: nomination.rejectionReason,
        approvedAt: nomination.approvedAt,
        approvedBy: nomination.approvedBy,
        updatedAt: nomination.updatedAt
      },
      message: 'Nomination updated successfully in local data'
    });
    
  } catch (error) {
    console.error('Error updating local nominations file:', error);
    return NextResponse.json(
      { error: 'Failed to update local nominations data' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/nominations-improved - Delete a nomination (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nominationId = searchParams.get('id');

    if (!nominationId) {
      return NextResponse.json(
        { error: 'Missing nomination ID' },
        { status: 400 }
      );
    }

    // Get nomination details before deletion for cleanup
    const { data: nomination, error: fetchError } = await supabaseAdmin
      .from('nominations')
      .select('nominee_id, state')
      .eq('id', nominationId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Nomination not found' },
        { status: 404 }
      );
    }

    // Delete the nomination (this will cascade to related records)
    const { error: deleteError } = await supabaseAdmin
      .from('nominations')
      .delete()
      .eq('id', nominationId);

    if (deleteError) {
      throw new Error(`Failed to delete nomination: ${deleteError.message}`);
    }

    // Also delete the nominee if no other nominations reference it
    const { data: otherNominations } = await supabaseAdmin
      .from('nominations')
      .select('id')
      .eq('nominee_id', nomination.nominee_id);

    if (!otherNominations || otherNominations.length === 0) {
      // Safe to delete the nominee as well
      await supabaseAdmin
        .from('nominees')
        .delete()
        .eq('id', nomination.nominee_id);
    }

    return NextResponse.json({
      success: true,
      message: 'Nomination deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/admin/nominations-improved error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete nomination' },
      { status: 500 }
    );
  }
}

