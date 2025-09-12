import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { getCategoryLabel } from '@/lib/utils/category-utils';

export const dynamic = 'force-dynamic';

interface TrendingCategory {
  id: string;
  label: string;
  nominationCount: number;
  voteCount: number;
  trendingScore: number;
}

// Demo trending categories for when database is not configured
function getDemoTrendingCategories(): TrendingCategory[] {
  const demoCategories = [
    'top-recruiter',
    'top-executive-leader', 
    'rising-star-under-30',
    'top-ai-driven-staffing-platform',
    'best-recruitment-agency'
  ];
  
  return demoCategories.map((categoryId, index) => ({
    id: categoryId,
    label: getCategoryLabel(categoryId),
    nominationCount: 45 - (index * 2),
    voteCount: 1250 - (index * 90),
    trendingScore: 95 - (index * 3)
  }));
}

/**
 * GET /api/categories/trending - Get trending categories based on nominations and votes
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching trending categories...');

    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, returning demo trending categories');
      return NextResponse.json({
        success: true,
        data: getDemoTrendingCategories(),
        message: 'Demo trending categories - database not configured'
      });
    }

    // Get category statistics from database
    const { data: categoryStats, error } = await supabase
      .from('nominations')
      .select(`
        subcategory_id,
        votes,
        additional_votes
      `)
      .eq('state', 'approved');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({
        success: true,
        data: getDemoTrendingCategories(),
        message: 'Demo trending categories - database query failed'
      });
    }

    // Calculate trending scores for each category
    const categoryMap = new Map<string, { nominationCount: number; voteCount: number }>();
    
    (categoryStats || []).forEach((nomination: any) => {
      const categoryId = nomination.subcategory_id;
      const votes = (nomination.votes || 0) + (nomination.additional_votes || 0);
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, { nominationCount: 0, voteCount: 0 });
      }
      
      const stats = categoryMap.get(categoryId)!;
      stats.nominationCount += 1;
      stats.voteCount += votes;
    });

    // Remove hardcoded category labels - use getCategoryLabel function instead

    // Convert to trending categories with scores
    const trendingCategories: TrendingCategory[] = Array.from(categoryMap.entries())
      .map(([categoryId, stats]) => {
        // Calculate trending score based on nominations and votes
        // Weight: 70% votes, 30% nominations
        const trendingScore = Math.round((stats.voteCount * 0.7) + (stats.nominationCount * 30 * 0.3));
        
        return {
          id: categoryId,
          label: getCategoryLabel(categoryId),
          nominationCount: stats.nominationCount,
          voteCount: stats.voteCount,
          trendingScore
        };
      })
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 10); // Top 10 trending categories

    // If no data, return demo categories
    if (trendingCategories.length === 0) {
      return NextResponse.json({
        success: true,
        data: getDemoTrendingCategories(),
        message: 'Demo trending categories - no data found'
      });
    }

    return NextResponse.json({
      success: true,
      data: trendingCategories,
      count: trendingCategories.length,
      message: `Found ${trendingCategories.length} trending categories`
    });

  } catch (error) {
    console.error('GET /api/categories/trending error:', error);

    return NextResponse.json({
      success: true,
      data: getDemoTrendingCategories(),
      message: 'Demo trending categories - error occurred'
    });
  }
}