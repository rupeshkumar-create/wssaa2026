import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface SearchSuggestion {
  text: string;
  type: 'category' | 'name' | 'location' | 'company';
  icon?: string;
  count?: number;
  url?: string;
  nominationId?: string;
}

// Demo search suggestions for when database is not configured
function getDemoSearchSuggestions(query: string): SearchSuggestion[] {
  const demoSuggestions: SearchSuggestion[] = [
    // Person examples
    { text: 'John Doe - Senior Recruiter at TechStaff', type: 'name', icon: '👤' },
    { text: 'Jane Smith - CEO at Acme Recruiting', type: 'name', icon: '👤' },
    { text: 'Rupesh Kumar - VP of Talent Acquisition', type: 'name', icon: '👤' },
    
    // Company examples
    { text: 'Acme Corp - Leading Staffing Firm', type: 'company', icon: '🏢' },
    { text: 'TechStaff Solutions - IT Recruiting Specialists', type: 'company', icon: '🏢' },
    { text: 'Global Talent Partners - Executive Search', type: 'company', icon: '🏢' },
    
    // Categories
    { text: 'Top Recruiter', type: 'category', icon: '🏆' },
    { text: 'Rising Star (Under 30)', type: 'category', icon: '⭐' },
    { text: 'Best Sourcer', type: 'category', icon: '🔍' },
    { text: 'Executive Leader', type: 'category', icon: '👔' },
    { text: 'Best Staffing Firm', type: 'category', icon: '🏢' },
    { text: 'Women-Led Staffing Firm', type: 'category', icon: '👩‍💼' },
    
    // Locations
    { text: 'All nominees from USA', type: 'location', icon: '🌍' },
    { text: 'All nominees from Canada', type: 'location', icon: '🌍' },
    { text: 'All nominees from UK', type: 'location', icon: '🌍' },
    
    // Job titles
    { text: 'CEO - Chief Executive Officer', type: 'name', icon: '👔' },
    { text: 'VP of Talent Acquisition', type: 'name', icon: '👤' },
    { text: 'Senior Recruiter', type: 'name', icon: '👤' },
    { text: 'Talent Acquisition Manager', type: 'name', icon: '👤' }
  ];

  return demoSuggestions.filter(s => 
    s.text.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);
}

/**
 * GET /api/search/suggestions - Get search suggestions based on query
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Query too short'
      });
    }

    console.log('Search suggestions for query:', query);

    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, returning demo suggestions');
      return NextResponse.json({
        success: true,
        data: getDemoSearchSuggestions(query),
        message: 'Demo suggestions - database not configured'
      });
    }

    const suggestions: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();

    // Search nominees by name
    const { data: nominees, error: nomineesError } = await supabase
      .from('nominations')
      .select(`
        id,
        nominees!inner(
          firstname,
          lastname,
          company_name,
          type,
          person_country,
          company_country,
          jobtitle,
          person_company,
          company_industry
        )
      `)
      .eq('state', 'approved')
      .limit(20);

    if (!nomineesError && nominees) {
      nominees.forEach((nomination: any) => {
        const nominee = nomination.nominees;
        if (!nominee) return;

        // Search by person name (name only, no job title)
        if (nominee.type === 'person') {
          const fullName = `${nominee.firstname || ''} ${nominee.lastname || ''}`.trim();
          const jobTitle = nominee.jobtitle || '';
          
          if (fullName.toLowerCase().includes(queryLower) && fullName.length > 0) {
            suggestions.push({
              text: fullName,
              type: 'name',
              icon: '👤',
              url: `/nominee/${nomination.id}`,
              nominationId: nomination.id
            });
          }
          
          // Also search by job title
          if (jobTitle && jobTitle.toLowerCase().includes(queryLower)) {
            suggestions.push({
              text: fullName,
              type: 'name',
              icon: '👔',
              url: `/nominee/${nomination.id}`,
              nominationId: nomination.id
            });
          }
        }

        // Search by company name (name only)
        if (nominee.type === 'company' && nominee.company_name) {
          if (nominee.company_name.toLowerCase().includes(queryLower)) {
            suggestions.push({
              text: nominee.company_name,
              type: 'company',
              icon: '🏢',
              url: `/nominee/${nomination.id}`,
              nominationId: nomination.id
            });
          }
        }

        // Add location suggestions
        const country = nominee.type === 'person' ? nominee.person_country : nominee.company_country;
        if (country && country.toLowerCase().includes(queryLower)) {
          const locationText = `All nominees from ${country}`;
          if (!suggestions.find(s => s.text === locationText)) {
            suggestions.push({
              text: locationText,
              type: 'location',
              icon: '🌍'
            });
          }
        }
      });
    }

    // Add category suggestions
    const categories = [
      { id: 'top-recruiter', label: 'Top Recruiter', icon: '🏆' },
      { id: 'rising-star', label: 'Rising Star (Under 30)', icon: '⭐' },
      { id: 'best-sourcer', label: 'Best Sourcer', icon: '🔍' },
      { id: 'executive-leader', label: 'Executive Leader', icon: '👔' },
      { id: 'staffing-influencer', label: 'Staffing Influencer', icon: '📢' },
      { id: 'best-staffing-firm', label: 'Best Staffing Firm', icon: '🏢' },
      { id: 'women-led-firm', label: 'Women-Led Staffing Firm', icon: '👩‍💼' },
      { id: 'ai-platform', label: 'AI-Driven Staffing Platform', icon: '🤖' },
      { id: 'digital-experience', label: 'Digital Experience for Clients', icon: '💻' },
      { id: 'diversity-inclusion', label: 'Diversity & Inclusion Champion', icon: '🌈' }
    ];

    categories.forEach(cat => {
      if (cat.label.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: cat.label,
          type: 'category',
          icon: cat.icon
        });
      }
    });

    // Add common location suggestions
    const commonLocations = ['USA', 'United States', 'Canada', 'UK', 'United Kingdom', 'Australia', 'India', 'Germany', 'France', 'Netherlands', 'Singapore'];
    commonLocations.forEach(location => {
      if (location.toLowerCase().includes(queryLower)) {
        const locationText = `All nominees from ${location}`;
        if (!suggestions.find(s => s.text === locationText)) {
          suggestions.push({
            text: locationText,
            type: 'location',
            icon: '🌍'
          });
        }
      }
    });

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text === suggestion.text)
      )
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: uniqueSuggestions,
      count: uniqueSuggestions.length,
      message: `Found ${uniqueSuggestions.length} search suggestions`
    });

  } catch (error) {
    console.error('GET /api/search/suggestions error:', error);

    // Return demo suggestions on error
    const query = new URL(request.url).searchParams.get('q') || '';
    return NextResponse.json({
      success: true,
      data: getDemoSearchSuggestions(query),
      message: 'Demo suggestions - error occurred'
    });
  }
}