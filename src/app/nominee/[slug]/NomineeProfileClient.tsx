"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { WSAButton } from "@/components/ui/wsa-button";
import { ArrowLeft } from "lucide-react";
import { VoteDialog } from "@/components/VoteDialog";
import { VotingClosedDialog } from "@/components/VotingClosedDialog";
import { ContactButton } from "@/components/ContactSection";
import { useRealtimeVotes } from "@/hooks/useRealtimeVotes";
import { useVotingStatus } from "@/hooks/useVotingStatus";
import { Nomination } from "@/lib/types";
import { SuggestedNomineesCard } from "@/components/SuggestedNomineesCard";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { EnhancedNomineeHero } from "@/components/nominee/EnhancedNomineeHero";
import { VoteSection } from "@/components/nominee/VoteSection";
import { NomineeStats } from "@/components/nominee/NomineeStats";
import { TabsSection } from "@/components/nominee/TabsSection";
import { getCategoryLabel } from "@/lib/utils/category-utils";

interface NomineeData extends Nomination {
  nomineeId: string;
  categoryGroup: string;
  votes: number;
  approvedAt?: string;
  nominee: {
    id: string;
    name: string;
    displayName: string;
    imageUrl?: string;
    type: 'person' | 'company';
    firstName?: string;
    lastName?: string;
    title?: string;
    jobtitle?: string;
    linkedin?: string;
    personLinkedin?: string;
    whyVoteForMe?: string;
    whyMe?: string;
    companyName?: string;
    website?: string;
    companyWebsite?: string;
    industry?: string;
    companyLinkedin?: string;
    whyUs?: string;
    liveUrl?: string;
    whyVote?: string;
  };
  nominator: {
    name: string;
    email: string;
    displayName: string;
  };
}

interface NomineeProfileClientProps {
  nominee: NomineeData;
}

export function NomineeProfileClient({ nominee: nomineeData }: NomineeProfileClientProps) {
  const [isClient, setIsClient] = useState(false);
  // Initialize with total votes from API (already includes regular + additional votes)
  const initialVoteCount = nomineeData?.votes || 0;
  const [voteCount, setVoteCount] = useState<number>(initialVoteCount);
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 NomineeProfileClient - Vote count debug:', {
      nomineeDataVotes: nomineeData?.votes,
      additionalVotes: nomineeData?.additionalVotes,
      initialVoteCount,
      currentVoteCount: voteCount,
      nomineeDataName: nomineeData?.name || nomineeData?.displayName,
      nomineeId: nomineeData?.id
    });
  }, [nomineeData, initialVoteCount, voteCount]);
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [showVotingClosed, setShowVotingClosed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const votingStatus = useVotingStatus();

  // Handle scroll effect for floating button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100); // Start floating after 100px scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update vote count when nominee data changes
  useEffect(() => {
    if (nomineeData?.votes !== undefined) {
      setVoteCount(nomineeData.votes);
    }
  }, [nomineeData?.votes]);

  // Add safety checks for nomineeData
  if (!nomineeData || !nomineeData.nominee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <h1 className="text-2xl font-bold mb-4">Nominee Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The nominee you're looking for could not be found or may have been removed.
            </p>
            <WSAButton 
              variant="secondary" 
              onClick={() => window.history.back()}
              style={{
                width: '180.66px',
                backgroundColor: '#D4ECF4'
              }}
            >
              <ArrowLeft className="h-6 w-6 mr-2" />
              Go Back
            </WSAButton>
          </motion.div>
        </div>
      </div>
    );
  }

  // Real-time vote updates
  const handleVoteUpdate = useCallback((data: any) => {
    // Update vote count from polling data
    console.log('🔄 Real-time vote update received:', data);
    if (data && typeof data.total === 'number') {
      console.log('✅ Updating vote count to:', data.total);
      setVoteCount(data.total);
    } else if (data && typeof data.count === 'number') {
      console.log('✅ Updating vote count to:', data.count);
      setVoteCount(data.count);
    }
  }, []);

  // Only enable real-time updates after client hydration and with a longer interval
  useRealtimeVotes(isClient ? {
    nomineeId: nomineeData.id,
    onVoteUpdate: handleVoteUpdate,
    pollInterval: 30000, // Poll every 30 seconds instead of 5 seconds
  } : {});

  const handleVoteSuccess = (newTotal: number) => {
    // Optimistically update vote count
    setVoteCount(newTotal);
  };

  const handleVoteClick = () => {
    if (!votingStatus.loading && !votingStatus.isVotingOpen) {
      setShowVotingClosed(true);
    } else {
      setShowVoteDialog(true);
    }
  };

  const isPersonNomination = nomineeData.type === "person";
  const nominee = nomineeData.nominee || {};
  
  // Get the appropriate image URL with safety checks
  const imageUrl = nominee.imageUrl || nomineeData.imageUrl || null;
  
  // Get LinkedIn URL with safety checks
  const linkedinUrl = nominee.linkedin || nominee.personLinkedin || nominee.companyLinkedin || null;
  
  // Get why vote text with safety checks
  const whyVoteText = nominee.whyVoteForMe || nominee.whyMe || nominee.whyUs || nominee.whyVote || null;
  
  // Get website URL with safety checks
  const websiteUrl = nominee.website || nominee.companyWebsite || nominee.liveUrl || nomineeData.liveUrl || null;

  return (
    <div className="min-h-screen bg-white">

      {/* Floating Back Button - appears when scrolled */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isScrolled ? 1 : 0,
          scale: isScrolled ? 1 : 0.8,
          pointerEvents: isScrolled ? 'auto' : 'none'
        }}
        transition={{ duration: 0.3 }}
        className="fixed top-6 left-6 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <WSAButton 
            size="icon"
            onClick={() => window.history.back()}
            className="w-12 h-12 rounded-full text-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            style={{ backgroundColor: '#D4ECF4' }}
            title="Back to Directory"
          >
            <ArrowLeft className="h-5 w-5" />
          </WSAButton>
        </motion.div>
      </motion.div>

      {/* Enhanced Hero Section with Navigation */}
      <EnhancedNomineeHero
        nominee={nominee}
        nomineeData={nomineeData}
        imageUrl={imageUrl}
        linkedinUrl={linkedinUrl}
        isPersonNomination={isPersonNomination}
        onVoteClick={handleVoteClick}
        votingStatus={votingStatus}
      />

      {/* Statistics Section */}
      <NomineeStats 
        nomineeData={nomineeData}
        voteCount={voteCount}
      />

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 py-8 lg:py-16">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabbed Content Section */}
            <TabsSection
              nominee={nominee}
              nomineeData={nomineeData}
              whyVoteText={whyVoteText}
              isPersonNomination={isPersonNomination}
            />
            
            {/* Suggested Nominees - Moved below tabs */}
            <div className="mt-12">
              <ScrollReveal delay={0.4}>
                <SuggestedNomineesCard 
                  currentNomineeId={nomineeData.id}
                  currentCategory={nomineeData.category}
                />
              </ScrollReveal>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Desktop Vote Section */}
              <div className="hidden lg:block">
                <VoteSection
                  voteCount={voteCount}
                  nominee={nominee}
                  onVoteClick={handleVoteClick}
                  votingStatus={votingStatus}
                  isDesktop={true}
                />
              </div>

              {/* Category Info Card */}
              <ScrollReveal delay={0.3}>
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">About This Category</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="font-medium text-gray-700">
                        {getCategoryLabel(nomineeData.category) || 'Unknown Category'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      This category recognizes outstanding {isPersonNomination ? "individuals" : "companies"} 
                      who have made significant contributions to the staffing industry.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Vote Section */}
      <div className="lg:hidden px-4 pb-8">
        <VoteSection
          voteCount={voteCount}
          nominee={nominee}
          onVoteClick={handleVoteClick}
          votingStatus={votingStatus}
          isDesktop={false}
        />
      </div>

      {/* Contact Button */}
      <ContactButton position="right" />

      {/* Vote Dialog */}
      <VoteDialog
        open={showVoteDialog}
        onOpenChange={setShowVoteDialog}
        nomination={{
          ...nomineeData,
          nominee: {
            name: nominee.displayName || nominee.name || 'Unknown Nominee',
            ...nominee
          }
        }}
        onVoteSuccess={handleVoteSuccess}
      />

      {/* Voting Closed Dialog */}
      <VotingClosedDialog
        open={showVotingClosed}
        onOpenChange={setShowVotingClosed}
        startDate={votingStatus.startDate}
      />
    </div>
  );
}