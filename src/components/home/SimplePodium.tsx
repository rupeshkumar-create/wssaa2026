"use client";

import { useState, useEffect } from "react";
import { Trophy, Crown, Medal, Award, User, Building2, Star, Sparkles } from "lucide-react";
import { getCategoryLabel } from "@/lib/utils/category-utils";
import { CATEGORY_TREE, getAllSubcategories } from "@/lib/categories";

type PodiumItem = {
  rank: 1 | 2 | 3;
  nomineeId: string;
  name: string;
  category: string;
  type: "person" | "company";
  image_url: string | null;
  votes: number;
  live_slug: string;
};

// Use the correct category groups from the categories file
const categoryGroups = CATEGORY_TREE.map(group => ({
  id: group.id,
  label: group.label,
  categories: group.subcategories.map(sub => sub.id)
}));

export function SimplePodium() {
  const [podiumData, setPodiumData] = useState<PodiumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState('staffing');
  const [selectedCategory, setSelectedCategory] = useState('best-staffing-leader');
  const [isAnimating, setIsAnimating] = useState(false);
  const [fadeClass, setFadeClass] = useState('opacity-100 translate-y-0');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dataCache, setDataCache] = useState<Record<string, PodiumItem[]>>({});

  useEffect(() => {
    const fetchPodiumData = async () => {
      try {
        // Check cache first for instant loading
        if (dataCache[selectedCategory] && !isInitialLoad) {
          console.log('Using cached data for:', selectedCategory);
          setIsAnimating(true);
          setFadeClass('opacity-70 translate-y-1');
          
          setTimeout(() => {
            setPodiumData(dataCache[selectedCategory]);
            setError(null);
            setFadeClass('opacity-100 translate-y-0');
            setIsAnimating(false);
          }, 25); // Super fast for cached data
          return;
        }

        // Only show loading spinner on initial load
        if (isInitialLoad) {
          setLoading(true);
        }
        
        // Start fade animation
        setIsAnimating(true);
        setFadeClass('opacity-70 translate-y-1');
        
        // Fetch data with shorter timeout for faster response
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(`/api/podium?category=${selectedCategory}`, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (response.ok) {
          const newData = data.items || [];
          
          // Cache the data for future use
          setDataCache(prev => ({
            ...prev,
            [selectedCategory]: newData
          }));
          
          // Update UI with minimal delay
          const delay = isInitialLoad ? 150 : 25; // Much faster for switches
          
          setTimeout(() => {
            setPodiumData(newData);
            setError(null);
            setFadeClass('opacity-100 translate-y-0');
            
            // Complete animation quickly
            setTimeout(() => {
              setIsAnimating(false);
            }, 25);
          }, delay);
        } else {
          console.error('API Error:', data);
          setError(data.error || 'Failed to load podium data');
          setIsAnimating(false);
          setFadeClass('opacity-100 translate-y-0');
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.warn('Request timeout for category:', selectedCategory);
          setError('Request timeout - please try again');
        } else {
          console.error('Fetch error:', err);
          setError('Network error');
        }
        setIsAnimating(false);
        setFadeClass('opacity-100 translate-y-0');
      } finally {
        if (isInitialLoad) {
          setTimeout(() => {
            setLoading(false);
            setIsInitialLoad(false);
          }, 50);
        }
      }
    };

    fetchPodiumData();
  }, [selectedCategory, isInitialLoad, dataCache]);

  const handleGroupChange = (groupId: string) => {
    if (groupId === selectedGroup) return; // Prevent unnecessary re-renders
    
    console.log('Switching to group:', groupId);
    setSelectedGroup(groupId);
    const group = categoryGroups.find(g => g.id === groupId);
    if (group && group.categories.length > 0) {
      const firstCategory = group.categories[0];
      console.log('Setting first category:', firstCategory);
      setSelectedCategory(firstCategory);
      
      // Clear cache for smooth transition
      setDataCache(prev => {
        const newCache = { ...prev };
        delete newCache[firstCategory];
        return newCache;
      });
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === selectedCategory) return; // Prevent unnecessary re-renders
    
    console.log('Switching to category:', categoryId);
    setSelectedCategory(categoryId);
  };

  const currentGroup = categoryGroups.find(g => g.id === selectedGroup);
  const availableCategories = currentGroup?.categories || [];

  const getRankCard = (rank: number, nominee?: PodiumItem) => {
    const isGold = rank === 1;
    const isSilver = rank === 2;
    const isBronze = rank === 3;

    const cardSizes = {
      1: 'w-80 h-[28rem]', // Gold - Largest (increased height for better spacing)
      2: 'w-72 h-[24rem]', // Silver - Medium (increased height for better spacing)
      3: 'w-64 h-[22rem]'  // Bronze - Smallest (increased height for better spacing)
    };

    const cardColors = {
      1: 'from-yellow-400 via-yellow-500 to-amber-600', // Gold gradient
      2: 'from-gray-300 via-gray-400 to-gray-500',      // Silver gradient
      3: 'from-amber-600 via-orange-500 to-amber-700'   // Bronze gradient
    };

    const textColors = {
      1: 'text-yellow-600',
      2: 'text-gray-600', 
      3: 'text-orange-700'
    };

    const bgColors = {
      1: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      2: 'bg-gradient-to-br from-gray-50 to-slate-50',
      3: 'bg-gradient-to-br from-orange-50 to-red-50'
    };

    const borderColors = {
      1: 'border-yellow-300 shadow-yellow-200/50',
      2: 'border-gray-300 shadow-gray-200/50',
      3: 'border-orange-300 shadow-orange-200/50'
    };

    const getRankIcon = () => {
      if (isGold) return <Crown className="h-8 w-8 text-yellow-500" />;
      if (isSilver) return <Trophy className="h-7 w-7 text-gray-500" />;
      if (isBronze) return <Medal className="h-6 w-6 text-orange-600" />;
      return <Award className="h-6 w-6" />;
    };

    return (
      <div 
        key={`${rank}-${nominee?.nomineeId || 'empty'}`}
        className={`
          ${cardSizes[rank as keyof typeof cardSizes]} 
          mx-auto relative
          transform transition-all duration-300 ease-out
          ${isAnimating ? 'scale-98 opacity-70 translate-y-1' : 'scale-100 opacity-100 translate-y-0'}
          hover:scale-105 hover:-translate-y-3 hover:shadow-2xl
        `}
        style={{
          transitionDelay: isAnimating ? '0ms' : `${rank * 50}ms`
        }}
      >
        {/* Rank Badge */}
        <div 
          className={`
            absolute ${isGold ? '-top-12' : isSilver ? '-top-10' : '-top-9'} left-1/2 transform -translate-x-1/2 z-20
            ${isGold ? 'w-20 h-20' : isSilver ? 'w-18 h-18' : 'w-16 h-16'} rounded-full bg-gradient-to-br ${cardColors[rank as keyof typeof cardColors]}
            flex items-center justify-center text-white font-bold ${isGold ? 'text-xl' : isSilver ? 'text-lg' : 'text-base'}
            shadow-2xl border-4 border-white ring-2 ring-white/50
            transition-all duration-300 hover:scale-110
          `}
          style={{
            boxShadow: `0 10px 30px -5px ${isGold ? 'rgba(245, 158, 11, 0.5)' : isSilver ? 'rgba(107, 114, 128, 0.5)' : 'rgba(217, 119, 6, 0.5)'}, 0 0 0 1px rgba(255,255,255,0.1) inset`
          }}
        >
          <span className="drop-shadow-sm">#{rank}</span>
        </div>

        {/* Card */}
        <div 
          className={`
            w-full h-full rounded-2xl border-2 ${borderColors[rank as keyof typeof borderColors]}
            ${bgColors[rank as keyof typeof bgColors]}
            shadow-2xl relative overflow-hidden
            transition-all duration-500 hover:shadow-3xl
          `}
          style={{
            boxShadow: `0 25px 50px -12px ${isGold ? 'rgba(245, 158, 11, 0.25)' : isSilver ? 'rgba(107, 114, 128, 0.25)' : 'rgba(217, 119, 6, 0.25)'}, 0 0 0 1px rgba(255,255,255,0.1) inset`
          }}
        >
          {/* Enhanced Sparkle Effects for Gold */}
          {isGold && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 via-transparent to-amber-200/20 pointer-events-none"></div>
              <Sparkles className="absolute top-4 right-4 h-6 w-6 text-yellow-400 animate-pulse drop-shadow-lg" />
              <Star className="absolute top-8 left-4 h-4 w-4 text-yellow-300 animate-ping drop-shadow-lg" />
              <Sparkles className="absolute bottom-8 right-6 h-5 w-5 text-amber-400 animate-pulse delay-300 drop-shadow-lg" />
              <div className="absolute top-6 left-1/2 h-2 w-2 bg-yellow-300 rounded-full animate-pulse delay-500 opacity-60"></div>
              <div className="absolute bottom-12 left-6 h-1 w-1 bg-amber-400 rounded-full animate-ping delay-700 opacity-80"></div>
            </>
          )}

          {/* Subtle effects for Silver */}
          {isSilver && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200/10 via-transparent to-slate-200/10 pointer-events-none"></div>
          )}

          {/* Warm effects for Bronze */}
          {isBronze && (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200/15 via-transparent to-red-200/15 pointer-events-none"></div>
          )}

          <div className={`${isGold ? 'pt-20 px-6 pb-12' : isSilver ? 'pt-18 px-5 pb-10' : 'pt-16 px-4 pb-8'} h-full flex flex-col items-center justify-center text-center`}>
            {nominee ? (
              <>
                {/* Photo with extra top spacing for better separation from rank badge */}
                <div className={`${isGold ? 'mt-2 mb-6' : isSilver ? 'mt-1 mb-5' : 'mb-4'} ${isGold ? 'w-24 h-24' : isSilver ? 'w-20 h-20' : 'w-16 h-16'}`}>
                  {nominee.image_url ? (
                    <img 
                      src={nominee.image_url} 
                      alt={nominee.name}
                      className={`
                        w-full h-full rounded-full object-cover 
                        border-4 ${isGold ? 'border-yellow-300' : isSilver ? 'border-gray-300' : 'border-orange-300'}
                        shadow-lg transition-transform duration-300 hover:scale-110
                      `}
                    />
                  ) : (
                    <div className={`
                      w-full h-full rounded-full 
                      bg-gradient-to-br from-blue-100 to-purple-100 
                      border-4 ${isGold ? 'border-yellow-300' : isSilver ? 'border-gray-300' : 'border-orange-300'}
                      shadow-lg flex items-center justify-center
                    `}>
                      {nominee.type === 'person' ? (
                        <User className={`${isGold ? 'h-12 w-12' : isSilver ? 'h-10 w-10' : 'h-8 w-8'} text-blue-600`} />
                      ) : (
                        <Building2 className={`${isGold ? 'h-12 w-12' : isSilver ? 'h-10 w-10' : 'h-8 w-8'} text-purple-600`} />
                      )}
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className={`
                  font-bold ${isGold ? 'mb-4' : isSilver ? 'mb-3' : 'mb-3'} text-gray-900 leading-tight
                  ${isGold ? 'text-xl' : isSilver ? 'text-lg' : 'text-base'}
                `}>
                  {nominee.name}
                </h3>

                {/* Category */}
                <p className={`
                  text-gray-600 ${isGold ? 'mb-5' : isSilver ? 'mb-4' : 'mb-4'} leading-tight
                  ${isGold ? 'text-sm' : 'text-xs'}
                `}>
                  {getCategoryLabel(nominee.category)}
                </p>

                {/* WSS Top 100 Badge - No Vote Counts */}
                <div 
                  className={`
                    bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full px-5 py-3 ${isGold ? 'mb-5' : isSilver ? 'mb-4' : 'mb-4'}
                    shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105
                  `}
                  style={{
                    boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.4)'
                  }}
                >
                  <p className={`
                    font-bold text-white drop-shadow-sm
                    ${isGold ? 'text-lg' : isSilver ? 'text-base' : 'text-sm'}
                  `}>
                    WSS Top 100
                  </p>
                  <p className={`
                    text-orange-100 font-medium
                    ${isGold ? 'text-xs' : 'text-xs'}
                  `}>
                    2026 Nominee
                  </p>
                </div>

                {/* Type Badge */}
                <div 
                  className={`
                    inline-flex items-center gap-2 
                    bg-white/70 backdrop-blur-sm rounded-full px-4 py-2
                    border ${isGold ? 'border-yellow-200' : isSilver ? 'border-gray-200' : 'border-orange-200'}
                    shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105
                    mt-2
                  `}
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)`
                  }}
                >
                  {nominee.type === 'person' ? (
                    <User className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Building2 className="h-4 w-4 text-purple-600" />
                  )}
                  <span className="font-semibold capitalize text-xs text-gray-700">
                    {nominee.type}
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Empty State with extra top spacing for better separation from rank badge */}
                <div className={`
                  ${isGold ? 'mt-2 mb-6' : isSilver ? 'mt-1 mb-5' : 'mb-5'} ${isGold ? 'w-32 h-32' : isSilver ? 'w-28 h-28' : 'w-24 h-24'}
                  flex items-center justify-center
                `}>
                  <img 
                    src={`/${isGold ? 'Gold' : isSilver ? 'Silver' : 'Bronze'}.png`}
                    alt={`${isGold ? 'Gold' : isSilver ? 'Silver' : 'Bronze'} Trophy`}
                    className={`
                      ${isGold ? 'w-28 h-28' : isSilver ? 'w-24 h-24' : 'w-20 h-20'}
                      object-contain drop-shadow-lg transition-transform duration-300 hover:scale-110
                      ${isGold ? 'filter brightness-110' : isSilver ? 'filter brightness-105' : 'filter brightness-100'}
                    `}
                  />
                </div>
                <div className={`text-slate-200`}>
                  <p className={`font-medium ${isGold ? 'text-lg' : 'text-base'} mb-2`}>
                    Awaiting Nominations
                  </p>
                  <p className="text-sm">Be the first to nominate!</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3 text-gray-900">
            <Trophy className="h-10 w-10" style={{ color: '#0b869d' }} />
            Champions Podium
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Celebrating excellence in the staffing industry. Recognizing outstanding professionals and companies in our community.
          </p>
        </div>

        {/* Specific Category Tabs - TOP SECTION */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {availableCategories.map((categoryId) => {
              const category = getAllSubcategories().find(c => c.id === categoryId);
              if (!category) return null;
              
              return (
                <button
                  key={categoryId}
                  onClick={() => handleCategoryChange(categoryId)}
                  className={`
                    relative px-8 py-4 text-sm font-bold transition-all duration-300
                    transform hover:scale-105 hover:shadow-2xl overflow-hidden
                    ${selectedCategory === categoryId
                      ? 'text-white shadow-2xl ring-4 ring-orange-200/50 shadow-orange-500/25'
                      : 'bg-white text-gray-700 border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-orange-300'
                    }
                  `}
                  style={{
                    borderRadius: '6px',
                    ...(selectedCategory === categoryId 
                      ? { 
                          background: 'linear-gradient(135deg, #08acc1 0%, #0b7790 100%)',
                          boxShadow: '0 20px 40px -12px rgba(8, 172, 193, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset'
                        }
                      : {}
                    )
                  }}

                >
                  {/* Gradient overlay for selected state */}
                  {selectedCategory === categoryId && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-teal-500/20"></div>
                    </>
                  )}
                  
                  {/* Hover gradient for non-selected */}
                  {selectedCategory !== categoryId && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-red-50 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                  
                  <span className="relative z-10">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Group Tabs - BELOW SUBCATEGORIES */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categoryGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => handleGroupChange(group.id)}
                className={`
                  relative px-5 py-3 rounded-xl text-xs font-semibold transition-all duration-300
                  transform hover:scale-105 overflow-hidden
                  ${selectedGroup === group.id
                    ? 'text-white shadow-lg ring-2 ring-gray-400/30'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:from-orange-50 hover:to-red-50 border border-gray-200 hover:border-orange-200 shadow-sm hover:shadow-md'
                  }
                `}
                style={selectedGroup === group.id 
                  ? { 
                      background: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #374151 100%)',
                      boxShadow: '0 10px 25px -5px rgba(55, 65, 81, 0.3)'
                    }
                  : undefined
                }
              >
                {/* Subtle gradient overlay for selected state */}
                {selectedGroup === group.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                )}
                
                <span className="relative z-10">{group.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Podium Content */}
        <div className="relative">
          {loading && isInitialLoad && (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-3">
                <div 
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: '#0b869d' }}
                ></div>
                <span className="text-lg text-gray-600">Loading champions...</span>
              </div>
              {/* Loading skeleton */}
              <div className="flex items-end justify-center gap-8 mt-8 opacity-30">
                <div className="w-72 h-80 bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="w-80 h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="w-64 h-72 bg-gray-200 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
                <p className="text-red-600 font-medium text-lg">Unable to load podium</p>
                <p className="text-red-500 text-sm mt-2">{error}</p>
              </div>
            </div>
          )}

          {(!loading || !isInitialLoad) && !error && (
            <div className={`
              flex items-end justify-center gap-8 min-h-[500px]
              transition-all duration-200 ease-out transform
              ${fadeClass}
            `}>
              {/* 2nd Place - Silver */}
              <div className="flex flex-col items-center">
                {getRankCard(2, podiumData.find(p => p.rank === 2))}
              </div>

              {/* 1st Place - Gold (Center, Largest) */}
              <div className="flex flex-col items-center">
                {getRankCard(1, podiumData.find(p => p.rank === 1))}
              </div>

              {/* 3rd Place - Bronze */}
              <div className="flex flex-col items-center">
                {getRankCard(3, podiumData.find(p => p.rank === 3))}
              </div>
            </div>
          )}

          {/* Category Info */}
          {(!loading || !isInitialLoad) && !error && (
            <div className={`
              text-center mt-12 transition-all duration-200 ease-out transform
              ${fadeClass}
            `}>
              <div 
                className="inline-flex items-center gap-4 bg-white/95 backdrop-blur-sm rounded-2xl px-10 py-5 border-2 border-gray-200 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                  boxShadow: '0 25px 50px -12px rgba(11, 134, 157, 0.15), 0 0 0 1px rgba(255,255,255,0.1) inset'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 via-transparent to-red-50/50 pointer-events-none"></div>
                <Award className="h-7 w-7 relative z-10 drop-shadow-sm" style={{ color: '#0b869d' }} />
                <span className="font-bold text-gray-800 text-xl relative z-10 drop-shadow-sm">
                  {getCategoryLabel(selectedCategory)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}