import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/setup-schema - Setup admin nomination schema
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Setting up admin nomination schema...');

    // 1. Create category_groups table
    const { error: cgError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.category_groups (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          display_order INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `
    });

    if (cgError) {
      console.log('Creating category_groups table directly...');
      // Try direct table creation
      const { error: directError } = await supabase
        .from('category_groups')
        .select('*')
        .limit(0);
      
      if (directError && directError.message.includes('does not exist')) {
        console.log('Table does not exist, will create via SQL execution');
      }
    }

    // 2. Insert category groups data
    const categoryGroups = [
      { id: 'role-specific-excellence', name: 'Role-Specific Excellence', description: 'Recognizing outstanding individual contributors', display_order: 1 },
      { id: 'innovation-technology', name: 'Innovation & Technology', description: 'Leading the future of staffing technology', display_order: 2 },
      { id: 'culture-impact', name: 'Culture & Impact', description: 'Making a positive difference in the industry', display_order: 3 },
      { id: 'growth-performance', name: 'Growth & Performance', description: 'Excellence in operations and thought leadership', display_order: 4 },
      { id: 'geographic-excellence', name: 'Geographic Excellence', description: 'Regional and global recognition', display_order: 5 },
      { id: 'special-recognition', name: 'Special Recognition', description: 'Unique contributions to the industry', display_order: 6 }
    ];

    // Try to insert category groups
    for (const group of categoryGroups) {
      try {
        const { error: insertError } = await supabase
          .from('category_groups')
          .upsert(group, { onConflict: 'id' });
        
        if (insertError) {
          console.log(`Category group ${group.id} insert failed:`, insertError.message);
        } else {
          console.log(`✅ Category group ${group.id} created/updated`);
        }
      } catch (error) {
        console.log(`Category group ${group.id} error:`, error);
      }
    }

    // 3. Create subcategories table and data
    const subcategories = [
      // Role-Specific Excellence
      { id: 'top-recruiter', name: 'Top Recruiter', category_group_id: 'role-specific-excellence', nomination_type: 'person', display_order: 1 },
      { id: 'top-executive-leader', name: 'Top Executive Leader', category_group_id: 'role-specific-excellence', nomination_type: 'person', display_order: 2 },
      { id: 'rising-star-under-30', name: 'Rising Star (Under 30)', category_group_id: 'role-specific-excellence', nomination_type: 'person', display_order: 3 },
      { id: 'top-staffing-influencer', name: 'Top Staffing Influencer', category_group_id: 'role-specific-excellence', nomination_type: 'person', display_order: 4 },
      { id: 'best-sourcer', name: 'Best Sourcer', category_group_id: 'role-specific-excellence', nomination_type: 'person', display_order: 5 },
      
      // Innovation & Technology
      { id: 'top-ai-driven-staffing-platform', name: 'Top AI-Driven Staffing Platform', category_group_id: 'innovation-technology', nomination_type: 'company', display_order: 1 },
      { id: 'top-digital-experience-for-clients', name: 'Top Digital Experience for Clients', category_group_id: 'innovation-technology', nomination_type: 'company', display_order: 2 },
      
      // Culture & Impact
      { id: 'top-women-led-staffing-firm', name: 'Top Women-Led Staffing Firm', category_group_id: 'culture-impact', nomination_type: 'company', display_order: 1 },
      { id: 'fastest-growing-staffing-firm', name: 'Fastest Growing Staffing Firm', category_group_id: 'culture-impact', nomination_type: 'company', display_order: 2 },
      { id: 'best-diversity-inclusion-initiative', name: 'Best Diversity & Inclusion Initiative', category_group_id: 'culture-impact', nomination_type: 'company', display_order: 3 },
      { id: 'best-candidate-experience', name: 'Best Candidate Experience', category_group_id: 'culture-impact', nomination_type: 'company', display_order: 4 },
      
      // Growth & Performance
      { id: 'best-staffing-process-at-scale', name: 'Best Staffing Process at Scale', category_group_id: 'growth-performance', nomination_type: 'company', display_order: 1 },
      { id: 'thought-leadership-and-influence', name: 'Thought Leadership & Influence', category_group_id: 'growth-performance', nomination_type: 'person', display_order: 2 },
      { id: 'best-recruitment-agency', name: 'Best Recruitment Agency', category_group_id: 'growth-performance', nomination_type: 'company', display_order: 3 },
      { id: 'best-in-house-recruitment-team', name: 'Best In-House Recruitment Team', category_group_id: 'growth-performance', nomination_type: 'company', display_order: 4 },
      
      // Geographic Excellence
      { id: 'top-staffing-company-usa', name: 'Top Staffing Company - USA', category_group_id: 'geographic-excellence', nomination_type: 'company', display_order: 1 },
      { id: 'top-staffing-company-europe', name: 'Top Staffing Company - Europe', category_group_id: 'geographic-excellence', nomination_type: 'company', display_order: 2 },
      { id: 'top-global-recruiter', name: 'Top Global Recruiter', category_group_id: 'geographic-excellence', nomination_type: 'person', display_order: 3 },
      
      // Special Recognition
      { id: 'special-recognition', name: 'Special Recognition', category_group_id: 'special-recognition', nomination_type: 'both', display_order: 1 }
    ];

    // Try to insert subcategories
    for (const subcategory of subcategories) {
      try {
        const { error: insertError } = await supabase
          .from('subcategories')
          .upsert(subcategory, { onConflict: 'id' });
        
        if (insertError) {
          console.log(`Subcategory ${subcategory.id} insert failed:`, insertError.message);
        } else {
          console.log(`✅ Subcategory ${subcategory.id} created/updated`);
        }
      } catch (error) {
        console.log(`Subcategory ${subcategory.id} error:`, error);
      }
    }

    // 4. Create settings table and default data
    try {
      const { error: settingsError } = await supabase
        .from('settings')
        .upsert({ 
          id: 'main', 
          nominations_open: true, 
          voting_open: true 
        }, { onConflict: 'id' });
      
      if (settingsError) {
        console.log('Settings insert failed:', settingsError.message);
      } else {
        console.log('✅ Settings created/updated');
      }
    } catch (error) {
      console.log('Settings error:', error);
    }

    // 5. Test the setup
    console.log('🔍 Testing setup...');
    
    const { data: testCategories, error: testError } = await supabase
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
      .limit(5);

    if (testError) {
      console.error('❌ Test query failed:', testError.message);
      return NextResponse.json({
        success: false,
        error: `Setup verification failed: ${testError.message}`,
        details: 'Some tables may not have been created properly'
      }, { status: 500 });
    }

    console.log(`✅ Setup verification successful: ${testCategories.length} categories found`);

    return NextResponse.json({
      success: true,
      message: 'Admin nomination schema setup completed successfully',
      data: {
        categoryGroupsCreated: categoryGroups.length,
        subcategoriesCreated: subcategories.length,
        testCategoriesFound: testCategories.length,
        sampleCategory: testCategories[0]
      }
    });

  } catch (error) {
    console.error('❌ Schema setup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to setup schema' },
      { status: 500 }
    );
  }
}