"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp, Users } from "lucide-react";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/animations/ScrollReveal";
import { useState, useEffect } from "react";

interface NomineeStatsProps {
  nomineeData: any;
  voteCount: number;
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

export function NomineeStats({ nomineeData, voteCount }: NomineeStatsProps) {
  const [realTimeStats, setRealTimeStats] = useState<NomineeStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate days since nomination
  const calculateDaysSinceNomination = () => {
    if (!nomineeData?.createdAt) return 0;
    const nominationDate = new Date(nomineeData.createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - nominationDate.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
    return Math.max(0, daysDifference);
  };

  // Get stable supporters count - use the vote count from API (already includes total)
  const getStableSupportersCount = () => {
    // The voteCount prop already includes the total votes from the API
    // If nomineeData has a votes field, it should be the total from the API
    const totalVotes = nomineeData?.votes || voteCount;
    
    console.log('Vote count from API:', { apiVotes: nomineeData?.votes, propVoteCount: voteCount, using: totalVotes });
    
    return totalVotes;
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!nomineeData?.id) return;
      
      try {
        const response = await fetch(`/api/nominees/${nomineeData.id}/stats`);
        if (response.ok) {
          const data = await response.json();
          setRealTimeStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch nominee stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [nomineeData?.id]);

  const getRankSuffix = (rank: number) => {
    if (rank === 1) return "st";
    if (rank === 2) return "nd";
    if (rank === 3) return "rd";
    return "th";
  };

  const supportersCount = getStableSupportersCount();

  const stats = [
    {
      icon: TrendingUp,
      label: "Category Rank",
      value: loading ? 1 : (realTimeStats?.categoryRank || 1),
      color: "text-orange-500",
      bgColor: "bg-orange-100",
      suffix: loading ? "st" : getRankSuffix(realTimeStats?.categoryRank || 1),
    },
    {
      icon: Users,
      label: "Supporters",
      value: supportersCount,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    },
    {
      icon: Calendar,
      label: "Days Active",
      value: calculateDaysSinceNomination(),
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <ScrollReveal>
      <section className="pt-8 pb-16 px-4" style={{ background: 'linear-gradient(180deg, #FCFBFA 0%, #FFFFFF 100%)' }}>
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nomination Statistics
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Track the performance and engagement metrics for this outstanding nominee
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
            {stats.map((stat, index) => (
              <StaggerItem key={stat.label}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 overflow-hidden relative group h-full">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-100 to-transparent rounded-full -translate-y-10 translate-x-10 opacity-50 group-hover:opacity-70 transition-opacity" />
                  
                  <CardContent className="p-6 text-center relative z-10 h-full flex flex-col justify-center min-h-[180px]">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`mx-auto mb-4 w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}
                    >
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </motion.div>
                    
                    <div className={`text-3xl font-black ${stat.color} mb-2`}>
                      <AnimatedCounter value={stat.value} />
                      {stat.suffix && <span className="text-lg">{stat.suffix}</span>}
                    </div>
                    
                    <div className="text-sm font-medium text-gray-700">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </ScrollReveal>
  );
}