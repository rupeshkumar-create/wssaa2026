"use client";

import Link from "next/link";
import { WSAButton } from "@/components/ui/wsa-button";
import { Award, Vote } from "lucide-react";
import { StatsSection } from "@/components/home/StatsSection";
import { SimplePodium } from "@/components/home/SimplePodium";
import { AnimatedHero } from "@/components/animations/AnimatedHero";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { AwardsTimeline } from "@/components/home/AwardsTimeline";
import { VoteButton } from "@/components/animations/VoteButton";
import { useVotingStatus } from "@/hooks/useVotingStatus";
import NomineeBackgroundCards from "@/components/animations/NomineeBackgroundCards";



export default function HomePage() {
  const votingStatus = useVotingStatus();
  
  // Show "Nominate Now" before voting opens, "Vote Now" after
  const showNominate = !votingStatus.loading && !votingStatus.isVotingOpen;
  
  // Debug logging
  console.log('🏠 HomePage - Voting Status:', {
    loading: votingStatus.loading,
    isVotingOpen: votingStatus.isVotingOpen,
    startDate: votingStatus.startDate,
    showNominate
  });
  
  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background Cards */}
      <NomineeBackgroundCards />
      
      {/* Enhanced Hero Section */}
      <AnimatedHero />

      {/* Enhanced Stats Section */}
      <ScrollReveal>
        <section className="py-16 px-4 bg-slate-50">
          <div className="container mx-auto">
            <StatsSection />
          </div>
        </section>
      </ScrollReveal>

      {/* Enhanced Podium */}
      <SimplePodium />

      {/* Enhanced Categories Preview */}
      <CategoriesSection />

      {/* Enhanced Timeline */}
      <ScrollReveal>
        <AwardsTimeline />
      </ScrollReveal>

      {/* Enhanced CTA Section */}
      <ScrollReveal>
        <section className="py-20 px-4 bg-slate-50 relative overflow-hidden">
          <div className="container mx-auto text-center relative z-10">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">
              {showNominate ? "Ready to Nominate?" : "Ready to Vote?"}
            </h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Help us recognize the outstanding individuals and companies shaping the future of staffing.
              Your {showNominate ? "nomination" : "vote"} could make all the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <WSAButton 
                asChild 
                variant="primary"
                size="lg"
              >
                <Link href={showNominate ? "/nominate" : "/nominees"} className="flex items-center">
                  {showNominate ? (
                    <Award className="mr-2 h-6 w-6" />
                  ) : (
                    <Vote className="mr-2 h-6 w-6" />
                  )}
                  {showNominate ? "Nominate Now" : "Vote Now"}
                </Link>
              </WSAButton>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Floating Action Button */}
      <VoteButton showAfterScroll={800} />
    </div>
  );
}