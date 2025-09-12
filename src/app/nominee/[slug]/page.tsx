import { NomineeProfileClient } from "./NomineeProfileClient";
import { WSAButton } from "@/components/ui/wsa-button";
import { ArrowLeft } from "lucide-react";
import { supabase } from '@/lib/supabase/server';

async function getNomineeData(slug: string) {
  try {
    console.log('🔍 Server-side: Looking for nominee with identifier:', slug);
    
    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('⚠️ Supabase not configured, returning demo data');
      return getDemoNomineeData(slug);
    }
    
    // Try direct ID lookup first
    const { data: directMatch, error: directError } = await supabase
      .from('nominations')
      .select('*, nominees(*)')
      .eq('id', slug)
      .eq('state', 'approved')
      .single();
    
    if (directMatch && !directError) {
      console.log('✅ Server-side: Found by direct ID match');
      return transformNomineeData(directMatch);
    }
    
    // If direct ID fails, try live URL lookup
    const { data: urlMatches, error: urlError } = await supabase
      .from('nominations')
      .select('*, nominees(*)')
      .eq('state', 'approved')
      .ilike('live_url', `%${slug}%`);
    
    if (urlMatches && urlMatches.length > 0 && !urlError) {
      console.log('✅ Server-side: Found by live URL match');
      return transformNomineeData(urlMatches[0]);
    }
    
    console.log('❌ Server-side: No nominee found');
    return null;
  } catch (error) {
    console.error('Server-side error fetching nominee:', error);
    return getDemoNomineeData(slug);
  }
}

function getDemoNomineeData(slug: string) {
  return {
    id: slug,
    nomineeId: slug,
    category: 'top-recruiter',
    type: 'person',
    votes: 42,
    additionalVotes: 0,
    status: 'approved',
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    uniqueKey: slug,
    name: 'Demo Nominee',
    displayName: 'Demo Nominee',
    imageUrl: '',
    title: 'Senior Recruiter',
    linkedin: '',
    whyVote: 'This is a demo nominee for testing purposes.',
    liveUrl: slug,
    nominee: {
      id: slug,
      type: 'person',
      name: 'Demo Nominee',
      displayName: 'Demo Nominee',
      imageUrl: '',
      email: 'demo@example.com',
      phone: '',
      country: 'United States',
      linkedin: '',
      liveUrl: slug,
      bio: 'Demo bio',
      achievements: 'Demo achievements',
      socialMedia: '',
      firstName: 'Demo',
      lastName: 'Nominee',
      jobTitle: 'Senior Recruiter',
      title: 'Senior Recruiter',
      company: 'Demo Company',
      headshotUrl: '',
      whyMe: 'This is a demo nominee for testing purposes.',
      whyVoteForMe: 'This is a demo nominee for testing purposes.',
      whyVote: 'This is a demo nominee for testing purposes.'
    },
    nominator: {
      name: 'Anonymous',
      email: '',
      displayName: 'Anonymous'
    }
  };
}

function transformNomineeData(nomination: any) {
  const nomineeData = nomination.nominees;
  const displayName = nomineeData?.firstname && nomineeData?.lastname ? 
                     `${nomineeData.firstname} ${nomineeData.lastname}` : 
                     nomineeData?.company_name || '';

  // Calculate total votes (regular + additional)
  const totalVotes = (nomination.votes || 0) + (nomination.additional_votes || 0);

  return {
    id: nomination.id,
    nomineeId: nomination.id,
    category: nomination.subcategory_id,
    type: nomination.type || nomineeData?.type,
    votes: totalVotes, // This is the key fix - use total votes
    additionalVotes: nomination.additional_votes || 0,
    status: nomination.state,
    createdAt: nomination.created_at,
    approvedAt: nomination.approved_at,
    uniqueKey: nomination.id,
    name: displayName,
    displayName: displayName,
    imageUrl: nomineeData?.headshot_url || nomineeData?.logo_url || '',
    title: nomineeData?.jobtitle || '',
    linkedin: nomineeData?.person_linkedin || nomineeData?.company_linkedin || '',
    whyVote: nomineeData?.why_me || nomineeData?.why_us || '',
    liveUrl: nomination.live_url || '',
    nominee: {
      id: nomination.nominee_id,
      type: nomination.type || nomineeData?.type,
      name: displayName,
      displayName: displayName,
      imageUrl: nomineeData?.headshot_url || nomineeData?.logo_url || '',
      email: nomineeData?.person_email || nomineeData?.company_email || '',
      phone: nomineeData?.person_phone || nomineeData?.company_phone || '',
      country: nomineeData?.person_country || nomineeData?.company_country || '',
      linkedin: nomineeData?.person_linkedin || nomineeData?.company_linkedin || '',
      liveUrl: nomination.live_url || nomineeData?.live_url || '',
      bio: nomineeData?.bio || '',
      achievements: nomineeData?.achievements || '',
      socialMedia: nomineeData?.social_media || '',
      ...(nomination.type === 'person' ? {
        firstName: nomineeData?.firstname || '',
        lastName: nomineeData?.lastname || '',
        jobTitle: nomineeData?.jobtitle || '',
        title: nomineeData?.jobtitle || '',
        company: nomineeData?.person_company || '',
        headshotUrl: nomineeData?.headshot_url || '',
        whyMe: nomineeData?.why_me || '',
        whyVoteForMe: nomineeData?.why_me || ''
      } : {}),
      ...(nomination.type === 'company' ? {
        companyName: nomineeData?.company_name || '',
        companyDomain: nomineeData?.company_domain || '',
        companyWebsite: nomineeData?.company_website || '',
        website: nomineeData?.company_website || '',
        companySize: nomineeData?.company_size || '',
        industry: nomineeData?.company_industry || '',
        logoUrl: nomineeData?.logo_url || '',
        whyUs: nomineeData?.why_us || '',
        whyVoteForMe: nomineeData?.why_us || ''
      } : {}),
      whyVote: nomineeData?.why_me || nomineeData?.why_us || ''
    },
    nominator: {
      name: 'Anonymous',
      email: '',
      displayName: 'Anonymous'
    }
  };
}

export default async function NomineeProfilePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return (
        <div className="min-h-screen bg-background py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Invalid Request</h1>
              <p className="text-muted-foreground mb-6">
                No nominee identifier provided.
              </p>
              <a href="/nominees" className="inline-flex items-center px-4 py-2 text-gray-700 rounded-lg transition-colors" style={{ backgroundColor: '#D4ECF4' }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Nominees
              </a>
            </div>
          </div>
        </div>
      );
    }

    const nominee = await getNomineeData(slug);

    if (!nominee) {
      return (
        <div className="min-h-screen bg-background py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Nominee Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The nominee you're looking for could not be found or may have been removed.
              </p>
              <a href="/nominees" className="inline-flex items-center px-4 py-2 text-gray-700 rounded-lg transition-colors" style={{ backgroundColor: '#D4ECF4' }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Nominees
              </a>
            </div>
          </div>
        </div>
      );
    }

    console.log('🎯 Server-side: Rendering nominee with votes:', nominee.votes);

    return <NomineeProfileClient nominee={nominee} />;
  } catch (error) {
    console.error('Error in NomineeProfilePage:', error);
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Error Loading Nominee</h1>
            <p className="text-muted-foreground mb-6">
              There was an error loading the nominee profile. Please try again later.
            </p>
            <a href="/nominees" className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Nominees
            </a>
          </div>
        </div>
      </div>
    );
  }
}