"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WSAButton } from "@/components/ui/wsa-button";
import { Vote, Clock, TrendingUp, Users, Award } from "lucide-react";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { useState, useEffect } from "react";

interface VoteSectionProps {
  voteCount: number;
  nominee: any;
  onVoteClick: () => void;
  votingStatus: any;
  isDesktop?: boolean;
}

interface NomineeStats {
  totalVotes: number;
  realVotes: number;
  additionalVotes: number;
  recentVotes: number;
  categoryRank: number;
  totalInCategory: number;
  daysSinceCreated: number;
  trendingPercentile: string;
  voteMomentum: number;
  supporters: number;
}

export function VoteSection({ 
  voteCount, 
  nominee, 
  onVoteClick, 
  votingStatus, 
  isDesktop = false 
}: VoteSectionProps) {
  const [stats, setStats] = useState<NomineeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!nominee?.id) return;
      
      try {
        const response = await fetch(`/api/nominees/${nominee.id}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch nominee stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [nominee?.id, voteCount]); // Refetch when vote count changes
  return (
    <ScrollReveal delay={isDesktop ? 0.2 : 0}>
      <Card className="border-0 shadow-xl bg-gradient-to-b from-white to-slate-50 overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-orange-100 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50" />
        
        <CardHeader className="text-center pb-4 relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 w-16 h-16 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg"
          >
            <Vote className="h-8 w-8 text-white" />
          </motion.div>
          
          <CardTitle className="text-xl font-bold text-gray-900">
            Vote for {nominee.displayName || nominee.name || 'this nominee'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            Support this nominee in the World Staffing Awards 2026
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-6 relative z-10">
          {/* Vote Count Display */}
          <div className="space-y-2">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-500 to-orange-600"
            >
              <AnimatedCounter value={voteCount} />
            </motion.div>
            <div className="text-sm text-gray-600 font-medium">votes received</div>
          </div>

          {/* Vote Statistics */}
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">Trending</span>
              </div>
              <div className="text-xs text-gray-500">
                {loading ? "Loading..." : (stats?.trendingPercentile || "Rising")}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-4 w-4 text-indigo-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">Vote Momentum</span>
              </div>
              <div className="text-xs text-gray-500">
                {loading ? "Loading..." : `+${stats?.voteMomentum || 0} this week`}
              </div>
            </div>
          </div>

          {/* Vote Button */}
          <motion.div
            whileHover={{ scale: votingStatus.isVotingOpen ? 1.02 : 1 }}
            whileTap={{ scale: votingStatus.isVotingOpen ? 0.98 : 1 }}
          >
            <WSAButton 
              onClick={votingStatus.isVotingOpen ? onVoteClick : undefined}
              variant={votingStatus.isVotingOpen ? "primary" : "secondary"}
              size="lg"
              disabled={votingStatus.loading || !votingStatus.isVotingOpen}
              className="w-full relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent"
                initial={{ y: "-100%" }}
                whileHover={{ y: votingStatus.isVotingOpen ? "100%" : "-100%" }}
                transition={{ duration: 0.6 }}
              />
              {votingStatus.loading ? (
                <>
                  <Clock className="mr-2 h-6 w-6 animate-spin" />
                  Loading...
                </>
              ) : !votingStatus.isVotingOpen ? (
                <>
                  <Clock className="mr-2 h-6 w-6" />
                  {votingStatus.votingMessage || 'Voting Not Open'}
                </>
              ) : (
                <>
                  <Vote className="mr-2 h-6 w-6" />
                  Cast Your Vote
                </>
              )}
            </WSAButton>
          </motion.div>
          
          <p className="text-xs text-gray-500 mt-3">
            {votingStatus.isVotingOpen 
              ? "One vote per nominee per category"
              : votingStatus.startDate 
                ? `Voting opens on ${new Date(votingStatus.startDate).toLocaleDateString()}`
                : "Voting date to be announced"
            }
          </p>
        </CardContent>
      </Card>
    </ScrollReveal>
  );
}