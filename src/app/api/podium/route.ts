import { NextRequest, NextResponse } from "next/server";
import { supabase } from '@/lib/supabase/server';
import { CATEGORIES } from "@/lib/constants";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Demo data for when database is not ready
function getDemoPodiumData(category: string): PodiumItem[] {
  const demoData: Record<string, PodiumItem[]> = {
    'best-recruitment-agency': [
      {
        rank: 1,
        nomineeId: 'demo-1',
        name: 'Global Talent Solutions',
        category: 'best-recruitment-agency',
        type: 'company',
        image_url: null,
        votes: 150,
        live_slug: 'global-talent-solutions'
      },
      {
        rank: 2,
        nomineeId: 'demo-2',
        name: 'Elite Staffing Partners',
        category: 'best-recruitment-agency',
        type: 'company',
        image_url: null,
        votes: 125,
        live_slug: 'elite-staffing-partners'
      },
      {
        rank: 3,
        nomineeId: 'demo-3',
        name: 'Premier Recruitment Co.',
        category: 'best-recruitment-agency',
        type: 'company',
        image_url: null,
        votes: 100,
        live_slug: 'premier-recruitment-co'
      }
    ],
    'best-recruiter': [
      {
        rank: 1,
        nomineeId: 'demo-4',
        name: 'Sarah Johnson',
        category: 'best-recruiter',
        type: 'person',
        image_url: null,
        votes: 180,
        live_slug: 'sarah-johnson'
      },
      {
        rank: 2,
        nomineeId: 'demo-5',
        name: 'Michael Chen',
        category: 'best-recruiter',
        type: 'person',
        image_url: null,
        votes: 165,
        live_slug: 'michael-chen'
      },
      {
        rank: 3,
        nomineeId: 'demo-6',
        name: 'Emma Rodriguez',
        category: 'best-recruiter',
        type: 'person',
        image_url: null,
        votes: 140,
        live_slug: 'emma-rodriguez'
      }
    ]
  };

  return demoData[category] || [];
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

    // Validate category exists
    const categoryConfig = CATEGORIES.find(c => c.id === category);
    if (!categoryConfig) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, returning demo data');
      return NextResponse.json({
        category,
        items: getDemoPodiumData(category)
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
        // Return demo data if database query fails
        return NextResponse.json({
          category,
          items: getDemoPodiumData(category)
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
      // Return demo data if database is not accessible
      return NextResponse.json({
        category,
        items: getDemoPodiumData(category)
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