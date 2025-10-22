"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Crown,
  Medal,
  Star,
  RefreshCw,
  Building2,
  User,
  ChevronDown
} from "lucide-react";

interface LeaderboardEntry {
  id: string;
  rank: number;
  displayName: string;
  type: 'person' | 'company';
  votes: number;
  additionalVotes: number;
  totalVotes: number;
  category: string;
  imageUrl?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'best-staffing-leader', label: 'Top Leaders' },
  { value: 'best-recruiter', label: 'Top Recruiters' },
  { value: 'best-staffing-firm', label: 'Top Companies' }
];

export function SimpleLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>('best-staffing-leader');

  const fetchLeaderboard = async (category: string) => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch nominations from the working API
      const response = await fetch('/api/admin/nominations-improved', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch nominations');
      }

      // Filter by category and approved status, then sort by total votes
      const filteredNominations = result.data
        .filter((nom: any) => 
          nom.state === 'approved' && 
          nom.subcategory_id === category
        )
        .map((nom: any) => ({
          id: nom.id,
          displayName: nom.type === 'person' 
            ? `${nom.firstname || ''} ${nom.lastname || ''}`.trim()
            : nom.companyName || nom.company_name || 'Unknown',
          type: nom.type,
          votes: nom.votes || 0,
          additionalVotes: nom.additionalVotes || 0,
          totalVotes: (nom.votes || 0) + (nom.additionalVotes || 0),
          category: nom.subcategory_id,
          imageUrl: nom.imageUrl || nom.headshotUrl || nom.headshot_url || nom.logoUrl || nom.logo_url
        }))
        .sort((a: any, b: any) => b.totalVotes - a.totalVotes)
        .slice(0, 10)
        .map((nom: any, index: number) => ({
          ...nom,
          rank: index + 1
        }));

      setLeaderboard(filteredNominations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(selectedCategory);
  }, [selectedCategory]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <Star className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryLabel = (value: string) => {
    return CATEGORY_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-bold text-gray-900">Leaderboard</h3>
        </div>
        <Button 
          onClick={() => fetchLeaderboard(selectedCategory)} 
          variant="outline" 
          size="sm"
          className="gap-1"
          disabled={loading}
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Category Dropdown */}
      <div className="flex items-center gap-3">
        <label htmlFor="category-select" className="text-sm font-medium text-gray-700">
          Category:
        </label>
        <div className="relative">
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[200px]"
          >
            {CATEGORY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="text-red-800">
              <p className="font-medium">Failed to load leaderboard</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            Top 10 - {getCategoryLabel(selectedCategory)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          ) : leaderboard.length > 0 ? (
            leaderboard.map((nominee) => (
              <div
                key={nominee.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  nominee.rank <= 3 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 shadow-sm' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Icon */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
                    {getRankIcon(nominee.rank)}
                  </div>
                  
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    {nominee.imageUrl ? (
                      <img 
                        src={nominee.imageUrl} 
                        alt={nominee.displayName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {nominee.type === 'person' ? (
                          <User className="h-5 w-5 text-gray-500" />
                        ) : (
                          <Building2 className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Name and Type */}
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {nominee.displayName}
                    </div>
                    <div className="text-xs text-gray-600 flex items-center gap-1">
                      {nominee.type === 'person' ? <User className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                      {nominee.type === 'person' ? 'Person' : 'Company'}
                    </div>
                  </div>
                </div>
                
                {/* Vote Breakdown */}
                <div className="text-right">
                  <div className="font-bold text-sm text-gray-900">
                    {nominee.totalVotes.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">
                    {nominee.votes.toLocaleString()} + {nominee.additionalVotes.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Real + Additional
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">
              No nominees found for {getCategoryLabel(selectedCategory)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}