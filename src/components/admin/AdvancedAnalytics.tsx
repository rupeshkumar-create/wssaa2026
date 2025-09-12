"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Clock, 
  Users, 
  Award, 
  Globe, 
  BarChart3, 
  Activity,
  Zap,
  Target,
  MapPin
} from "lucide-react";
import { motion } from "framer-motion";

interface AnalyticsData {
  totalVotes: number;
  totalRealVotes: number;
  totalAdditionalVotes: number;
  totalNominations: number;
  approvedNominations: number;
  votingVelocity: {
    interval: string;
    description: string;
  };
  nominationVelocity: {
    interval: string;
    description: string;
  };
  peakEngagement: {
    hour: number;
    hourDescription: string;
    peakDay: string;
    peakDayVotes: number;
  };
  recentActivity: {
    votesLast24h: number;
    nominationsLast24h: number;
  };
  conversionRate: number;
  topCountries: Array<{ country: string; count: number }>;
  topCategories: Array<{ category: string; nominations: number; votes: number }>;
  hourlyDistribution: Array<{ hour: number; votes: number; label: string }>;
  summary: {
    totalEngagement: number;
    avgVotesPerNomination: number;
    activeCategories: number;
    globalReach: number;
  };
}

export function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/analytics', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          setAnalytics(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch analytics');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-6 w-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-6 w-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800">
              <p className="font-medium">Failed to load analytics</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) return null;

  const formatCategoryName = (categoryId: string) => {
    return categoryId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-6 w-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
        <Badge variant="outline" className="ml-auto">
          Real-time Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Votes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{analytics.totalVotes.toLocaleString()}</div>
              <p className="text-xs text-orange-700 mt-1">
                {analytics.totalRealVotes} real + {analytics.totalAdditionalVotes} manual
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Nominations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{analytics.totalNominations}</div>
              <p className="text-xs text-blue-700 mt-1">
                {analytics.approvedNominations} approved ({analytics.conversionRate}%)
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Last 24h Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {analytics.recentActivity.votesLast24h + analytics.recentActivity.nominationsLast24h}
              </div>
              <p className="text-xs text-green-700 mt-1">
                {analytics.recentActivity.votesLast24h} votes, {analytics.recentActivity.nominationsLast24h} nominations
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Global Reach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{analytics.summary.globalReach}</div>
              <p className="text-xs text-purple-700 mt-1">
                Countries represented
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Velocity Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Voting Velocity
              </CardTitle>
              <CardDescription>Real-time engagement rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-orange-600 mb-2">
                {analytics.votingVelocity.interval}
              </div>
              <p className="text-sm text-gray-600">
                {analytics.votingVelocity.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Nomination Velocity
              </CardTitle>
              <CardDescription>Submission frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-blue-600 mb-2">
                {analytics.nominationVelocity.interval}
              </div>
              <p className="text-sm text-gray-600">
                {analytics.nominationVelocity.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Peak Engagement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Peak Engagement Times
            </CardTitle>
            <CardDescription>When your audience is most active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Peak Hour</div>
                <div className="text-lg font-semibold text-green-600">
                  {analytics.peakEngagement.hourDescription}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Peak Day</div>
                <div className="text-lg font-semibold text-green-600">
                  {analytics.peakEngagement.peakDay} ({analytics.peakEngagement.peakDayVotes} votes)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Geographic & Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                Top Countries
              </CardTitle>
              <CardDescription>Geographic distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topCountries.map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-600">
                        {index + 1}
                      </div>
                      <span className="font-medium">{country.country}</span>
                    </div>
                    <Badge variant="outline">{country.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Top Categories
              </CardTitle>
              <CardDescription>Most popular award categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topCategories.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
                        {index + 1}
                      </div>
                      <span className="font-medium text-sm">{formatCategoryName(category.category)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">{category.nominations}N</Badge>
                      <Badge variant="outline" className="text-xs">{category.votes}V</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-center">Performance Summary</CardTitle>
            <CardDescription className="text-center">
              Key insights for World Staffing Awards 2026
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{analytics.summary.totalEngagement}</div>
                <div className="text-sm text-gray-600">Total Engagement</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{analytics.summary.avgVotesPerNomination}</div>
                <div className="text-sm text-gray-600">Avg Votes/Nomination</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{analytics.summary.activeCategories}</div>
                <div className="text-sm text-gray-600">Active Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{analytics.summary.globalReach}</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}