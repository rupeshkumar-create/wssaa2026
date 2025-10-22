import { NextRequest, NextResponse } from 'next/server';
import { supabase as supabaseAdmin } from '@/lib/supabase/server';
import { validateAdminAuth, createAuthErrorResponse } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/nominations - Get all nominations for admin panel
 */
export async function GET(request: NextRequest) {
  // Validate admin authentication
  if (!validateAdminAuth(request)) {
    return createAuthErrorResponse();
  }
  
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
      
      // Load from local file
      const fs = require('fs');
      const path = require('path');
      
      try {
        const dataPath = path.join(process.cwd(), 'data', 'nominations.json');
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const nominations = JSON.parse(rawData);
        
        // Filter by status if provided
        let filteredNominations = nominations;
        if (status) {
          filteredNominations = nominations.filter((nom: any) => nom.status === status);
        }
        
        // Transform to admin format
        const adminNominations = filteredNominations.map((nom: any) => ({
          id: nom.id,
          type: nom.type,
          state: nom.status, // Map status to state
          categoryGroupId: '2026-awards',
          subcategoryId: nom.category,
          subcategory_id: nom.category,
          
          // Person fields
          firstname: nom.nominee.name.split(' ')[0] || '',
          lastname: nom.nominee.name.split(' ').slice(1).join(' ') || '',
          jobtitle: nom.nominee.title || '',
          personEmail: nom.type === 'person' ? nom.nominator.email : '',
          personLinkedin: nom.nominee.linkedin || '',
          personPhone: '',
          personCompany: nom.company?.name || '',
          personCountry: nom.nominee.country || '',
          headshotUrl: nom.nominee.imageUrl,
          headshot_url: nom.nominee.imageUrl,
          whyMe: nom.whyVoteForMe || '',
          
          // Company fields
          companyName: nom.type === 'company' ? nom.nominee.name : nom.company?.name || '',
          company_name: nom.type === 'company' ? nom.nominee.name : nom.company?.name || '',
          companyWebsite: nom.company?.website || '',
          companyLinkedin: nom.type === 'company' ? nom.nominee.linkedin : '',
          companyEmail: nom.type === 'company' ? nom.nominator.email : '',
          companyPhone: '',
          companyCountry: nom.type === 'company' ? nom.nominee.country : '',
          logoUrl: nom.type === 'company' ? nom.nominee.imageUrl : null,
          logo_url: nom.type === 'company' ? nom.nominee.imageUrl : null,
          whyUs: nom.type === 'company' ? nom.whyVoteForMe : '',
          
          // Shared fields
          liveUrl: nom.liveUrl || '',
          votes: Math.floor(Math.random() * 200) + 50, // Random votes for demo
          additionalVotes: 0,
          totalVotes: Math.floor(Math.random() * 200) + 50,
          createdAt: nom.createdAt,
          created_at: nom.createdAt,
          updatedAt: nom.updatedAt,
          
          // Contact info
          email: nom.nominator.email,
          phone: '',
          linkedin: nom.nominee.linkedin || '',
          
          // Nominator info
          nominatorEmail: nom.nominator.email,
          nominatorName: nom.nominator.name,
          nominatorCompany: nom.nominator.company || '',
          nominatorJobTitle: '',
          nominatorPhone: '',
          nominatorCountry: '',
          
          // Computed fields
          displayName: nom.nominee.name,
          imageUrl: nom.nominee.imageUrl,
          
          // Admin fields
          adminNotes: '',
          rejectionReason: '',
          approvedAt: nom.status === 'approved' ? nom.updatedAt : null,
          approvedBy: '',
          nominationSource: 'local-file'
        }));

        return NextResponse.json({
          success: true,
          data: adminNominations,
          count: adminNominations.length,
          message: `Loaded ${adminNominations.length} nominations from local file`
        });
        
      } catch (fileError) {
        console.error('Error reading local nominations file:', fileError);
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          message: 'No local nominations file found'
        });
      }
    }

    let query = supabaseAdmin
      .from('nominations')
      .select(`
        id,
        state,
        votes,
        additional_votes,
        subcategory_id,
        category_group_id,
        admin_notes,
        rejection_reason,
        created_at,
        updated_at,
        approved_at,
        approved_by,
        nomination_source,
        nominees (
          id,
          type,
          firstname,
          lastname,
          person_email,
          person_linkedin,
          person_phone,
          jobtitle,
          person_company,
          person_country,
          headshot_url,
          why_me,
          company_name,
          company_website,
          company_linkedin,
          company_email,
          company_phone,
          company_country,
          logo_url,
          why_us,
          live_url,
          bio,
          achievements
        ),
        nominators (
          id,
          email,
          firstname,
          lastname,
          linkedin,
          company,
          job_title,
          phone,
          country
        )
      `);

    if (status) {
      query = query.eq('state', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data: nominations, error } = await query;

    if (error) {
      console.error('Failed to get admin nominations:', error);
      throw new Error(`Failed to get nominations: ${error.message}`);
    }

    // Transform to admin-friendly format (matching frontend expectations)
    const adminNominations = nominations.map(nom => {
      const nominee = nom.nominees;
      const nominator = nom.nominators;
      
      return {
        id: nom.id,
        type: nominee?.type,
        state: nom.state,
        categoryGroupId: nom.category_group_id,
        subcategoryId: nom.subcategory_id,
        subcategory_id: nom.subcategory_id, // Frontend expects this
        
        // Person fields
        firstname: nominee?.firstname,
        lastname: nominee?.lastname,
        jobtitle: nominee?.jobtitle,
        personEmail: nominee?.person_email,
        personLinkedin: nominee?.person_linkedin,
        personPhone: nominee?.person_phone,
        personCompany: nominee?.person_company,
        personCountry: nominee?.person_country,
        headshotUrl: nominee?.headshot_url,
        headshot_url: nominee?.headshot_url, // Frontend expects this
        whyMe: nominee?.why_me,
        
        // Company fields
        companyName: nominee?.company_name,
        company_name: nominee?.company_name, // Frontend expects this
        companyWebsite: nominee?.company_website,
        companyLinkedin: nominee?.company_linkedin,
        companyEmail: nominee?.company_email,
        companyPhone: nominee?.company_phone,
        companyCountry: nominee?.company_country,
        logoUrl: nominee?.logo_url,
        logo_url: nominee?.logo_url, // Frontend expects this
        whyUs: nominee?.why_us,
        
        // Shared fields
        liveUrl: nominee?.live_url,
        votes: nom.votes, // Real votes from actual voting
        additionalVotes: nom.additional_votes || 0, // Manual votes added by admin
        totalVotes: (nom.votes || 0) + (nom.additional_votes || 0), // Total for display
        createdAt: nom.created_at,
        created_at: nom.created_at, // Frontend expects this
        updatedAt: nom.updated_at,
        
        // Contact info (computed)
        email: nominee?.type === 'person' ? nominee?.person_email : nominee?.company_email,
        phone: nominee?.type === 'person' ? nominee?.person_phone : nominee?.company_phone,
        linkedin: nominee?.type === 'person' ? nominee?.person_linkedin : nominee?.company_linkedin,
        
        // Nominator info
        nominatorEmail: nominator?.email,
        nominatorName: `${nominator?.firstname || ''} ${nominator?.lastname || ''}`.trim(),
        nominatorCompany: nominator?.company,
        nominatorJobTitle: nominator?.job_title,
        nominatorPhone: nominator?.phone,
        nominatorCountry: nominator?.country,
        
        // Computed fields
        displayName: nominee?.type === 'person' 
          ? `${nominee?.firstname || ''} ${nominee?.lastname || ''}`.trim()
          : nominee?.company_name || '',
        imageUrl: nominee?.type === 'person' ? nominee?.headshot_url : nominee?.logo_url,
        
        // Admin fields
        adminNotes: nom.admin_notes,
        rejectionReason: nom.rejection_reason,
        approvedAt: nom.approved_at,
        approvedBy: nom.approved_by,
        nominationSource: nom.nomination_source || 'public' // Track source
      };
    });

    return NextResponse.json({
      success: true,
      data: adminNominations,
      count: adminNominations.length
    });

  } catch (error) {
    console.error('GET /api/admin/nominations error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get nominations' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/nominations - Update nomination status or details
 */
export async function PATCH(request: NextRequest) {
  // Validate admin authentication
  if (!validateAdminAuth(request)) {
    return createAuthErrorResponse();
  }
  
  try {
    const body = await request.json();
    const { nominationId, state, liveUrl, whyMe, whyUs, headshotUrl, logoUrl, linkedin, adminNotes, rejectionReason } = body;

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

    // Get current nomination data to check if we need to auto-generate URL
    const { data: currentNomination, error: fetchError } = await supabaseAdmin
      .from('nominations')
      .select(`
        id, 
        state, 
        nominees (
          type,
          firstname,
          lastname,
          company_name,
          live_url
        )
      `)
      .eq('id', nominationId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch nomination: ${fetchError.message}`);
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Add fields that are provided
    if (state) {
      updateData.state = state;
      
      // Auto-generate live URL when approving if not already set
      if (state === 'approved' && !currentNomination.nominees?.live_url && liveUrl === undefined) {
        const nominee = currentNomination.nominees;
        const displayName = nominee?.type === 'person' 
          ? `${nominee?.firstname || ''} ${nominee?.lastname || ''}`.trim()
          : nominee?.company_name || `nominee-${nominationId}`;
        
        const slug = displayName
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        // Get base URL - always use localhost for development
        let baseUrl = 'http://localhost:3000';
        
        // Only use production URLs if explicitly in production
        if (process.env.NODE_ENV === 'production') {
          if (process.env.VERCEL_URL) {
            baseUrl = `https://${process.env.VERCEL_URL}`;
          } else if (process.env.NEXT_PUBLIC_SITE_URL) {
            baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
          }
        }
        
        // Store live_url in nominees table, not nominations
        const { error: nomineeUpdateError } = await supabaseAdmin
          .from('nominees')
          .update({ live_url: `${baseUrl}/nominee/${slug}` })
          .eq('id', currentNomination.nominees?.id);
        
        if (nomineeUpdateError) {
          console.error('Failed to update nominee live_url:', nomineeUpdateError);
        } else {
          console.log(`Auto-generated live URL: ${baseUrl}/nominee/${slug} for ${displayName}`);
        }
      }
    }
    
    if (liveUrl !== undefined) {
      // Ensure live URL follows consistent format
      const cleanUrl = liveUrl.trim();
      if (cleanUrl && !cleanUrl.startsWith('http')) {
        // If it's just a slug, create full URL
        let baseUrl = 'http://localhost:3000';
        
        // Only use production URLs if explicitly in production
        if (process.env.NODE_ENV === 'production') {
          baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                    'https://worldstaffingawards.com');
        }
        
        updateData.live_url = `${baseUrl}/nominee/${cleanUrl}`;
      } else {
        updateData.live_url = cleanUrl;
      }
    }
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes;
    if (rejectionReason !== undefined) updateData.rejection_reason = rejectionReason;

    // Update the nomination
    const { data: nominationData, error: nominationError } = await supabaseAdmin
      .from('nominations')
      .update(updateData)
      .eq('id', nominationId)
      .select(`
        id, 
        state, 
        nominee_id, 
        updated_at,
        subcategory_id,
        nominees (
          id,
          type,
          firstname,
          lastname,
          company_name,
          person_email,
          company_email,
          live_url
        )
      `)
      .single();

    if (nominationError) {
      console.error('Failed to update nomination:', nominationError);
      throw new Error(`Failed to update nomination: ${nominationError.message}`);
    }

    // Send approval email if nomination was approved (only when state changes to approved)
    if (state === 'approved' && nominationData.state === 'approved') {
      try {
        console.log('🔔 Sending nominee approval email...');
        const { loopsTransactional } = await import('@/server/loops/transactional');
        
        // Get category name for email
        const { data: categoryData } = await supabaseAdmin
          .from('subcategories')
          .select('name, category_groups(name)')
          .eq('id', nominationData.subcategory_id)
          .single();

        const categoryName = categoryData?.category_groups?.name || 'Unknown Category';
        const subcategoryName = categoryData?.name || 'Unknown Subcategory';
        
        const nominee = nominationData.nominees;
        const nomineeDisplayName = nominee?.type === 'person' 
          ? `${nominee?.firstname || ''} ${nominee?.lastname || ''}`.trim()
          : nominee?.company_name || '';

        const nomineeEmail = nominee?.type === 'person' 
          ? nominee?.person_email 
          : nominee?.company_email;

        if (nomineeEmail) {
          const emailResult = await loopsTransactional.sendNomineeApprovalEmail({
            nomineeFirstName: nominee?.type === 'person' ? nominee?.firstname : undefined,
            nomineeLastName: nominee?.type === 'person' ? nominee?.lastname : undefined,
            nomineeEmail,
            nomineeDisplayName,
            categoryName,
            subcategoryName,
            approvalTimestamp: new Date().toISOString(),
            nomineePageUrl: nominee?.live_url || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/nominee/${nomineeDisplayName.toLowerCase().replace(/\s+/g, '-')}`
          });

          if (emailResult.success) {
            console.log('✅ Nominee approval email sent successfully');
          } else {
            console.warn('⚠️ Failed to send nominee approval email:', emailResult.error);
          }
        } else {
          console.warn('⚠️ No email address found for nominee, skipping approval email');
        }
      } catch (error) {
        console.warn('Email sending failed (non-blocking):', error);
      }
    }

    // Update nominee data if provided
    const nomineeUpdateData: any = {};
    // Note: live_url is stored in nominations table, not nominees table
    if (whyMe !== undefined) nomineeUpdateData.why_me = whyMe;
    if (whyUs !== undefined) nomineeUpdateData.why_us = whyUs;
    if (headshotUrl !== undefined) nomineeUpdateData.headshot_url = headshotUrl;
    if (logoUrl !== undefined) nomineeUpdateData.logo_url = logoUrl;
    if (linkedin !== undefined) {
      // Update the appropriate LinkedIn field based on nominee type
      const { data: nominee } = await supabaseAdmin
        .from('nominees')
        .select('type')
        .eq('id', nominationData.nominee_id)
        .single();
      
      if (nominee?.type === 'person') {
        nomineeUpdateData.person_linkedin = linkedin;
      } else {
        nomineeUpdateData.company_linkedin = linkedin;
      }
    }

    let nomineeData = null;
    if (Object.keys(nomineeUpdateData).length > 0) {
      const { data: updatedNominee, error: nomineeError } = await supabaseAdmin
        .from('nominees')
        .update(nomineeUpdateData)
        .eq('id', nominationData.nominee_id)
        .select()
        .single();

      if (nomineeError) {
        console.error('Failed to update nominee:', nomineeError);
        // Don't throw here, nomination update succeeded
      } else {
        nomineeData = updatedNominee;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: nominationData.id,
        state: nominationData.state,
        liveUrl: nomineeData?.live_url,
        whyMe: nomineeData?.why_me,
        whyUs: nomineeData?.why_us,
        headshotUrl: nomineeData?.headshot_url,
        logoUrl: nomineeData?.logo_url,
        linkedin: nomineeData?.person_linkedin,
        adminNotes,
        rejectionReason,
        updatedAt: nominationData.updated_at
      }
    });

  } catch (error) {
    console.error('PATCH /api/admin/nominations error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update nomination' },
      { status: 500 }
    );
  }
}