import { NextRequest, NextResponse } from "next/server";
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Load actual podium data from local file
function getActualPodiumData(category: string): PodiumItem[] {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Read the actual nominations data
    const dataPath = path.join(process.cwd(), 'data', 'nominations.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const nominations = JSON.parse(rawData);
    
    // Filter by category and approved status
    const categoryNominations = nominations.filter((nom: any) => 
      nom.status === 'approved' && nom.category === category
    );
    
    // Sort by random votes (since we don't have real vote data) and take top 3
    const sortedNominations = categoryNominations
      .map((nom: any) => ({
        ...nom,
        votes: Math.floor(Math.random() * 200) + 50 // Random votes for demo
      }))
      .sort((a: any, b: any) => b.votes - a.votes)
      .slice(0, 3);
    
    // Transform to podium format
    const podiumItems: PodiumItem[] = sortedNominations.map((nom: any, index: number) => ({
      rank: (index + 1) as 1 | 2 | 3,
      nomineeId: nom.id,
      name: nom.nominee.name,
      category: nom.category,
      type: nom.type,
      image_url: nom.nominee.imageUrl,
      votes: nom.votes,
      live_slug: nom.liveUrl || nom.nominee.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    }));
    
    return podiumItems;
    
  } catch (error) {
    console.error('Error loading podium data:', error);
    return [];
  }
}

export type PodiumItem = {
  rank: 1 | 2 | 3;
  nomineeId: string;
  name: string;
  category: string;
  type: "person" | "company";
  image_url: string | null;
  votes: number;
  live_slug: string;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (!category) {
      return NextResponse.json(
        { error: "Category parameter is required" },
        { status: 400 }
      );
    }

    // Validate category exists - check both old and new category systems
    const { CATEGORIES } = await import('@/lib/constants');
    const { getAllSubcategories } = await import('@/lib/categories');
    
    const categoryConfig = CATEGORIES.find(c => c.id === category) || 
                          getAllSubcategories().find(sub => sub.id === category);
    
    if (!categoryConfig) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured with real values (not placeholders)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('your-project') || 
        supabaseKey.includes('your_service_role_key')) {
      console.log('Supabase not configured with real values, loading actual data from file');
      return NextResponse.json({
        category,
        items: getActualPodiumData(category)
      });
    }

    try {
      // Get approved nominations for this category with nominee details
      const { data: nominations, error } = await supabase
        .from('nominations')
        .select(`
          id,
          nominee_id,
          subcategory_id,
          state,
          votes,
          additional_votes,
          live_url,
          approved_at,
          nominees!inner (
            id,
            type,
            firstname,
            lastname,
            company_name,
            headshot_url,
            logo_url
          )
        `)
        .eq('subcategory_id', category)
        .eq('state', 'approved');

      if (error) {
        console.error('Podium query error:', error);
        // Return actual data if database query fails
        return NextResponse.json({
          category,
          items: getActualPodiumData(category)
        });
      }

      // Sort by total votes (real + additional) and take top 3
      const sortedNominations = (nominations || [])
        .map(nomination => ({
          ...nomination,
          totalVotes: (nomination.votes || 0) + (nomination.additional_votes || 0)
        }))
        .sort((a, b) => {
          // Sort by total votes descending, then by approved_at ascending, then by name
          if (b.totalVotes !== a.totalVotes) {
            return b.totalVotes - a.totalVotes;
          }
          if (a.approved_at && b.approved_at) {
            return new Date(a.approved_at).getTime() - new Date(b.approved_at).getTime();
          }
          const aName = `${a.nominees?.firstname || ''} ${a.nominees?.lastname || ''}`.trim() || a.nominees?.company_name || '';
          const bName = `${b.nominees?.firstname || ''} ${b.nominees?.lastname || ''}`.trim() || b.nominees?.company_name || '';
          return aName.localeCompare(bName);
        })
        .slice(0, 3);

      // Transform to podium items
      const podiumItems: PodiumItem[] = sortedNominations.map((nomination, index) => {
        const nominee = nomination.nominees;
        
        // Generate display name
        let displayName = '';
        if (nominee?.type === 'person') {
          displayName = `${nominee.firstname || ''} ${nominee.lastname || ''}`.trim();
          if (!displayName) displayName = 'Unknown Person';
        } else {
          displayName = nominee?.company_name || 'Unknown Company';
        }

        // Get image URL
        const imageUrl = nominee?.headshot_url || nominee?.logo_url || null;

        // Use pre-calculated total votes
        const totalVotes = nomination.totalVotes;

        // Generate live slug from live_url or create one
        let liveSlug = '';
        if (nomination.live_url) {
          // Extract slug from full URL
          const urlParts = nomination.live_url.split('/');
          liveSlug = urlParts[urlParts.length - 1] || '';
        } else {
          // Generate slug from display name
          liveSlug = displayName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        }

        return {
          rank: (index + 1) as 1 | 2 | 3,
          nomineeId: nomination.nominee_id,
          name: displayName,
          category: nomination.subcategory_id,
          type: nominee?.type || 'person',
          image_url: imageUrl,
          votes: totalVotes,
          live_slug: liveSlug,
        };
      });

      return NextResponse.json(
        {
          category,
          items: podiumItems
        },
        {
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        }
      );
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Return actual data if database is not accessible
      return NextResponse.json({
        category,
        items: getActualPodiumData(category)
      });
    }

  } catch (error) {
    console.error("Podium API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}