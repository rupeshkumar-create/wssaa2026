import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

import { CATEGORY_TREE } from '@/lib/categories';

// Generate fallback categories from the category tree
const FALLBACK_CATEGORIES = CATEGORY_TREE.flatMap(group => 
  group.subcategories.map(subcategory => ({
    id: subcategory.id,
    name: subcategory.label,
    nomination_type: subcategory.type === 'person' ? 'person' as const : 'company' as const,
    category_groups: {
      id: group.id,
      name: group.label
    }
  }))
);

/**
 * GET /api/categories - Get all categories with their groups
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching categories...');

    // Try to get categories from database first
    const { data: categories, error } = await supabase
      .from('subcategories')
      .select(`
        id,
        name,
        nomination_type,
        category_groups (
          id,
          name
        )
      `)
      .order('name');

    // If database query succeeds, use database data
    if (!error && categories && categories.length > 0) {
      console.log(`✅ Found ${categories.length} categories from database`);
      return NextResponse.json({
        success: true,
        data: categories,
        count: categories.length,
        message: `Found ${categories.length} categories from database`
      });
    }

    // If database query fails (tables don't exist), use fallback data
    console.log('⚠️ Database tables not found, using fallback categories');
    console.log(`✅ Using ${FALLBACK_CATEGORIES.length} fallback categories`);

    return NextResponse.json({
      success: true,
      data: FALLBACK_CATEGORIES,
      count: FALLBACK_CATEGORIES.length,
      message: `Using ${FALLBACK_CATEGORIES.length} fallback categories (database tables not set up yet)`
    });

  } catch (error) {
    console.error('❌ Categories API error:', error);
    
    // Even if there's an error, return fallback data so the form works
    console.log('⚠️ Error occurred, using fallback categories');
    return NextResponse.json({
      success: true,
      data: FALLBACK_CATEGORIES,
      count: FALLBACK_CATEGORIES.length,
      message: `Using fallback categories due to error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}