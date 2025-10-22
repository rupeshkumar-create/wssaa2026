import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Load actual nominees data from local file
function getActualNomineesData(subcategoryId?: string, limit?: number) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Read the actual nominations data
    const dataPath = path.join(process.cwd(), 'data', 'nominations.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const nominations = JSON.parse(rawData);
    
    console.log(`📁 Loaded ${nominations.length} nominations from local file`);
    
    // Filter only approved nominations
    let approvedNominations = nominations.filter((nom: any) => nom.status === 'approved');
    console.log(`✅ Found ${approvedNominations.length} approved nominations`);
    
    // Apply category filter if provided
    if (subcategoryId) {
      approvedNominations = approvedNominations.filter((nom: any) => nom.category === subcategoryId);
      console.log(`🔍 Filtered to ${approvedNominations.length} nominations for category: ${subcategoryId}`);
    }
    
    // Apply limit if provided
    if (limit) {
      approvedNominations = approvedNominations.slice(0, limit);
    }
    
    // Transform to expected format
    const transformedData = approvedNominations.map((nomination: any) => {
      const displayName = nomination.nominee.name;
      const votes = Math.floor(Math.random() * 200) + 50; // Random votes for demo
      
      return {
        id: nomination.id,
        nomineeId: nomination.id,
        category: nomination.category,
        categoryGroup: '2026-awards',
        type: nomination.type,
        votes: votes,
        status: 'approved' as const,
        createdAt: nomination.createdAt,
        approvedAt: nomination.updatedAt,
        uniqueKey: nomination.uniqueKey,
        name: displayName,
        displayName: displayName,
        imageUrl: nomination.nominee.imageUrl,
        title: nomination.nominee.title || (nomination.type === 'company' ? 'Company' : 'Professional'),
        linkedin: nomination.nominee.linkedin || '',
        whyVote: nomination.whyVoteForMe || nomination.whyNominated || '',
        liveUrl: nomination.liveUrl || displayName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        nominee: {
          id: nomination.id,
          type: nomination.type,
          name: displayName,
          displayName: displayName,
          imageUrl: nomination.nominee.imageUrl,
          email: nomination.nominator.email || '',
          phone: '',
          country: nomination.nominee.country || nomination.company?.country || '',
          linkedin: nomination.nominee.linkedin || '',
          liveUrl: nomination.liveUrl || displayName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          bio: nomination.whyNominated || '',
          achievements: nomination.whyVoteForMe || '',
          socialMedia: '',
          
          // Person-specific fields
          ...(nomination.type === 'person' ? {
            firstName: nomination.nominee.name.split(' ')[0] || '',
            lastName: nomination.nominee.name.split(' ').slice(1).join(' ') || '',
            jobTitle: nomination.nominee.title || '',
            title: nomination.nominee.title || '',
            company: nomination.company?.name || '',
            whyMe: nomination.whyVoteForMe || ''
          } : {}),
          
          // Company-specific fields
          ...(nomination.type === 'company' ? {
            companyName: nomination.nominee.name,
            companyDomain: nomination.company?.website?.replace(/https?:\/\//, '') || '',
            companyWebsite: nomination.company?.website || '',
            website: nomination.company?.website || '',
            companySize: 'Unknown',
            industry: 'Staffing & Recruiting',
            logoUrl: nomination.nominee.imageUrl,
            whyUs: nomination.whyVoteForMe || ''
          } : {}),
          
          whyVote: nomination.whyVoteForMe || nomination.whyNominated || '',
          titleOrIndustry: nomination.nominee.title || (nomination.type === 'company' ? 'Staffing & Recruiting' : 'Professional')
        },
        nominator: {
          name: 'Anonymous', // Keep anonymous for public view
          email: '',
          displayName: 'Anonymous'
        }
      };
    });
    
    return transformedData;
    
  } catch (error) {
    console.error('Error loading nominations data:', error);
    // Fallback to empty array if file doesn't exist or has issues
    return [];
  }
}

/**
 * GET /api/nominees - Get approved nominees with complete form details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category') || searchParams.get('subcategoryId') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const search = searchParams.get('search') || undefined;
    const country = searchParams.get('country') || undefined;
    const random = searchParams.get('random') === 'true';

    console.log('Fetching nominees with params:', { categoryId, limit, search, country, random });

    // Check if Supabase is configured with real values (not placeholders)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('your-project') || 
        supabaseKey.includes('your_service_role_key')) {
      console.log('Supabase not configured with real values, loading actual data from file');
      const actualData = getActualNomineesData(categoryId, limit);
      return NextResponse.json({
        success: true,
        data: actualData,
        count: actualData.length,
        message: `Loaded ${actualData.length} nominees from local data file`
      });
    }

    // Valid categories - only show nominees from these categories
    const validCategories = [
      'best-staffing-leader',
      'best-staffing-firm', 
      'best-recruiter'
    ];

    // Query nominations with joined nominee and nominator data
    let query = supabase
      .from('nominations')
      .select(`
        *,
        nominees!inner(*),
        nominators!inner(*)
      `)
      .eq('state', 'approved')  // Use 'state' instead of 'status' to match current schema
      .in('subcategory_id', validCategories);  // Only show nominees from valid categories
    
    if (random) {
      // For random selection, we'll order by a random function
      query = query.order('id', { ascending: false }); // Simple ordering for now
    } else {
      query = query
        .order('additional_votes', { ascending: false })
        .order('created_at', { ascending: false });
    }

    if (categoryId) {
      console.log('Filtering by category:', categoryId);
      query = query.eq('subcategory_id', categoryId);
    }

    // Add search functionality - handle this after the main query to avoid PostgREST issues
    let searchFilter = null;
    if (search) {
      console.log('Search parameter detected:', search);
      searchFilter = search.toLowerCase();
    }

    // Add country filter
    if (country) {
      console.log('Applying country filter:', country);
      query = query.or(`nominees.person_country.ilike.%${country}%,nominees.company_country.ilike.%${country}%`);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data: nominations, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      console.error('Query parameters:', { categoryId, limit, search, country, random });
      
      // Return actual data if query fails
      const actualData = getActualNomineesData(categoryId, limit);
      return NextResponse.json({
        success: true,
        data: actualData,
        count: actualData.length,
        message: `Loaded ${actualData.length} nominees from local data file (database query failed)`
      });
    }

    console.log(`Found ${nominations?.length || 0} approved nominations`);

    // Apply search filter in memory if needed
    let processedNominations = nominations || [];
    
    if (searchFilter && processedNominations.length > 0) {
      console.log(`Applying search filter for: "${searchFilter}"`);
      processedNominations = processedNominations.filter((nomination: any) => {
        const nominee = nomination.nominees;
        if (!nominee) return false;
        
        // Create searchable text from all relevant fields
        const searchableFields = [
          nominee.firstname,
          nominee.lastname,
          nominee.company_name,
          nominee.jobtitle,
          nominee.person_company,
          nominee.company_industry,
          nominee.person_country,
          nominee.company_country
        ].filter(Boolean);
        
        const searchableText = searchableFields.join(' ').toLowerCase();
        const matches = searchableText.includes(searchFilter);
        
        if (matches) {
          console.log(`Search match found: ${nominee.firstname || nominee.company_name}`);
        }
        
        return matches;
      });
      
      console.log(`Search filtered results: ${processedNominations.length} matches`);
    }

    // Apply country filter in memory if needed
    if (country && processedNominations.length > 0) {
      console.log(`Applying country filter for: "${country}"`);
      const countryLower = country.toLowerCase();
      processedNominations = processedNominations.filter((nomination: any) => {
        const nominee = nomination.nominees;
        if (!nominee) return false;
        
        const nomineeCountry = (nominee.person_country || nominee.company_country || '').toLowerCase();
        return nomineeCountry.includes(countryLower);
      });
    }

    // Shuffle nominations if random is requested
    if (random && processedNominations.length > 0) {
      processedNominations = [...processedNominations].sort(() => Math.random() - 0.5);
    }

    // Transform nominations data with joined nominee and nominator data
    const transformedNominees = processedNominations.map((nomination: any) => {
      // Safety check
      if (!nomination || !nomination.nominees) {
        console.warn('Missing nomination or nominee data');
        return null;
      }
      
      // Extract nominee data from the joined table
      const nominee = nomination.nominees;
      const nominator = nomination.nominators;
      
      const displayName = nominee.type === 'person' 
        ? `${nominee.firstname || ''} ${nominee.lastname || ''}`.trim()
        : nominee.company_name || 'Unknown';
      
      const imageUrl = nominee.type === 'person' 
        ? nominee.headshot_url 
        : nominee.logo_url;
      
      const liveUrl = nominee.live_url || nomination.live_url || '';

      return {
        // Basic nomination info
        id: nomination.id,
        nomineeId: nominee.id,
        category: nomination.subcategory_id,
        categoryGroup: nomination.category_group_id,
        type: nominee.type,
        votes: (nomination.votes || 0) + (nomination.additional_votes || 0), // Total votes
        status: 'approved' as const,
        createdAt: nomination.created_at,
        approvedAt: nomination.approved_at,
        uniqueKey: nomination.id,

        // Display fields
        name: displayName,
        displayName: displayName,
        imageUrl: imageUrl,
        title: nominee.type === 'person' ? nominee.jobtitle : 'Company',
        linkedin: nominee.type === 'person' ? nominee.person_linkedin : nominee.company_linkedin,
        whyVote: nominee.type === 'person' ? nominee.why_me : nominee.why_us,
        liveUrl: liveUrl,

        // Complete nominee object with ALL available form details
        nominee: {
          id: nominee.id,
          type: nominee.type,
          name: displayName,
          displayName: displayName,
          imageUrl: imageUrl,
          
          // Contact details
          email: nominee.type === 'person' ? nominee.person_email : nominee.company_email,
          phone: nominee.type === 'person' ? nominee.person_phone : nominee.company_phone,
          country: nominee.type === 'person' ? nominee.person_country : nominee.company_country,
          linkedin: nominee.type === 'person' ? nominee.person_linkedin : nominee.company_linkedin,
          liveUrl: liveUrl,
          bio: nominee.bio || '',
          achievements: nominee.achievements || '',
          socialMedia: nominee.social_media || '',

          // Person-specific fields
          ...(nominee.type === 'person' ? {
            firstName: nominee.firstname || '',
            lastName: nominee.lastname || '',
            jobTitle: nominee.jobtitle || '',
            title: nominee.jobtitle || '',
            company: nominee.person_company || '',
            headshotUrl: nominee.headshot_url || '',
            whyMe: nominee.why_me || ''
          } : {}),

          // Company-specific fields  
          ...(nominee.type === 'company' ? {
            companyName: nominee.company_name || '',
            companyDomain: nominee.company_domain || '',
            companyWebsite: nominee.company_website || '',
            website: nominee.company_website || '',
            companySize: nominee.company_size || '',
            industry: nominee.company_industry || '',
            logoUrl: nominee.logo_url || '',
            whyUs: nominee.why_us || ''
          } : {}),

          // Computed fields for easy access
          whyVote: nominee.type === 'person' ? nominee.why_me : nominee.why_us,
          titleOrIndustry: nominee.type === 'person' ? nominee.jobtitle : nominee.company_industry
        },

        // Legacy nominator info (anonymous in public view)
        nominator: {
          name: 'Anonymous',
          email: '',
          displayName: 'Anonymous'
        }
      };
    }).filter(Boolean); // Remove any null entries

    const response = NextResponse.json({
      success: true,
      data: transformedNominees,
      count: transformedNominees.length,
      message: `Found ${transformedNominees.length} approved nominees${categoryId ? ` in category ${categoryId}` : ''}`
    });

    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('GET /api/nominees error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get nominees',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}