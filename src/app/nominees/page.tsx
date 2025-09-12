"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { SimpleSearchBar } from "@/components/directory/SimpleSearchBar";
import { PopularCategories } from "@/components/directory/PopularCategories";
import { SortDropdown } from "@/components/directory/SortDropdown";
import { Grid } from "@/components/directory/Grid";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { WSAButton } from "@/components/ui/wsa-button";
import { NominationWithVotes } from "@/lib/types";
import { useRealtimeVotes } from "@/hooks/useRealtimeVotes";
import { VoteButton } from "@/components/animations/VoteButton";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { getCategoryLabel } from "@/lib/utils/category-utils";

function NomineesContent() {
  const searchParams = useSearchParams();
  const [nominees, setNominees] = useState<NominationWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  // Get search query from URL parameters
  const searchQuery = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const sortBy = searchParams.get("sort") || "votes";
  
  // Debug logging for URL parameters
  console.log('🔍 Nominees - URL Parameters:', {
    searchQuery,
    categoryParam,
    sortBy,
    fullURL: typeof window !== 'undefined' ? window.location.href : 'SSR'
  });

  // Local state for immediate UI updates without page refresh
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [localCategoryFilter, setLocalCategoryFilter] = useState("");
  const [localSortBy, setLocalSortBy] = useState("votes");

  useEffect(() => {
    setIsClient(true);
    console.log('🔍 Nominees - Component mounted');
  }, []);

  // Sync local state with URL params on mount and when URL changes
  useEffect(() => {
    if (isClient) {
      console.log('🔍 Nominees - Syncing URL params:', {
        searchQuery,
        categoryParam,
        sortBy
      });
      
      setLocalSearchQuery(searchQuery);
      setLocalCategoryFilter(categoryParam);
      setLocalSortBy(sortBy);
      
      console.log('🔍 Nominees - Local state updated:', {
        localSearchQuery: searchQuery,
        localCategoryFilter: categoryParam,
        localSortBy: sortBy
      });
      
      // Force a re-fetch when URL parameters change
      console.log('🔍 Nominees - URL parameters changed, will trigger re-fetch');
    }
  }, [isClient, searchQuery, categoryParam, sortBy]);

  // Sorting function
  const sortNominees = (nominees: NominationWithVotes[], sortBy: string) => {
    const sorted = [...nominees];
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => {
          const nameA = a.nominee?.name || a.displayName || a.name || '';
          const nameB = b.nominee?.name || b.displayName || b.name || '';
          return nameA.localeCompare(nameB);
        });
      case 'votes':
        return sorted.sort((a, b) => {
          const votesA = (a.votes || 0) + (a.additional_votes || 0);
          const votesB = (b.votes || 0) + (b.additional_votes || 0);
          return votesB - votesA;
        });
      case 'category':
        return sorted.sort((a, b) => {
          const categoryA = a.category || '';
          const categoryB = b.category || '';
          return categoryA.localeCompare(categoryB);
        });
      case 'recent':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        });
      default:
        return sorted;
    }
  };

  // Fetch nominees data
  useEffect(() => {
    if (!isClient) return;
    
    const fetchNominees = async () => {
      try {
        setLoading(true);
        setError("");
        
        const timestamp = Date.now();
        let apiUrl = `/api/nominees?_t=${timestamp}`;
        if (localCategoryFilter) {
          apiUrl += `&category=${localCategoryFilter}`;
          console.log('🔍 Nominees - Fetching with category filter:', localCategoryFilter);
          console.log('🔍 Nominees - API URL:', apiUrl);
        } else {
          console.log('🔍 Nominees - Fetching all nominees (no category filter)');
          console.log('🔍 Nominees - localCategoryFilter value:', localCategoryFilter);
        }
        
        const response = await fetch(apiUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
        
        if (!response.ok) throw new Error("Failed to fetch nominees");
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch nominees');
        }
        
        const data = result.data || [];
        console.log('🔍 Nominees - Loaded:', data.length, 'nominees');
        
        if (localCategoryFilter && data.length > 0) {
          const categories = [...new Set(data.map(n => n.category))];
          console.log('🔍 Nominees - Categories in response:', categories);
          console.log('🔍 Nominees - Expected category:', localCategoryFilter);
          console.log('🔍 Nominees - Filtering working:', categories.length === 1 && categories[0] === localCategoryFilter ? '✅' : '❌');
        }
        
        // Apply client-side search filtering if needed
        let filteredData = [...data];
        if (localSearchQuery && !localCategoryFilter) {
          filteredData = filteredData.filter((nominee: any) => {
            const name = nominee.nominee?.name || nominee.displayName || nominee.name || '';
            const category = nominee.category || '';
            const company = nominee.nominee?.company || nominee.company || '';
            const title = nominee.nominee?.jobtitle || nominee.jobtitle || '';
            
            const searchLower = localSearchQuery.toLowerCase();
            
            return name.toLowerCase().includes(searchLower) ||
                   category.toLowerCase().includes(searchLower) ||
                   getCategoryLabel(category).toLowerCase().includes(searchLower) ||
                   company.toLowerCase().includes(searchLower) ||
                   title.toLowerCase().includes(searchLower);
          });
        }
        
        // Apply sorting
        filteredData = sortNominees(filteredData, localSortBy);
        
        console.log('🔍 Nominees - Final result:', filteredData.length, 'nominees');
        setNominees(filteredData);
        
      } catch (err) {
        console.error('🔍 Nominees - Error:', err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchNominees();
  }, [isClient, localCategoryFilter, localSearchQuery, localSortBy]);

  // Real-time vote updates
  const handleVoteUpdate = useCallback(() => {
    // Simple refresh after vote update
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }, []);

  useRealtimeVotes({
    category: "",
    onVoteUpdate: handleVoteUpdate,
  });

  // Search change handler
  const handleSearchChange = (query: string) => {
    setLocalSearchQuery(query);
  };

  // Sort change handler
  const handleSortChange = (sort: string) => {
    setLocalSortBy(sort);
  };

  // Category click handler
  const handleCategoryClick = (categoryId: string) => {
    console.log('🏷️ Category clicked:', categoryId);
    setLocalCategoryFilter(categoryId);
    setLocalSearchQuery("");
  };

  const handleClearSearch = () => {
    setLocalSearchQuery("");
    setLocalCategoryFilter("");
    setLocalSortBy("votes");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <section className="relative bg-white px-4 pt-12 pb-16">
          <div className="relative z-20 text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <img 
                src="/hero-logo.svg" 
                alt="World Staffing Awards 2026" 
                style={{
                  width: '224.89px',
                  height: '73.5px',
                  flexShrink: 0
                }}
                className="mx-auto"
              />
            </div>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Loading outstanding nominees...
            </p>
            <div className="max-w-2xl mx-auto mb-8">
              <Skeleton className="h-14 w-full bg-gray-200 rounded-full" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <section className="relative bg-white px-4 pt-12 pb-16">
          <div className="relative z-20 text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <img 
                src="/hero-logo.svg" 
                alt="World Staffing Awards 2026" 
                style={{
                  width: '224.89px',
                  height: '73.5px',
                  flexShrink: 0
                }}
                className="mx-auto"
              />
            </div>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Something went wrong while loading nominees
            </p>
            <div className="max-w-2xl mx-auto">
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 rounded-xl shadow-lg">
                <AlertDescription className="text-lg">{error}</AlertDescription>
              </Alert>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Logo */}
      <section className="relative bg-white px-4 pt-12 pb-16">
        <div className="absolute inset-0 bg-white" />
        
        <div className="relative z-20 text-center max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="mb-8">
              <img 
                src="/hero-logo.svg" 
                alt="World Staffing Awards 2026" 
                style={{
                  width: '224.89px',
                  height: '73.5px',
                  flexShrink: 0
                }}
                className="mx-auto"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Discover and vote for outstanding professionals and companies in the World Staffing Awards 2026
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="max-w-3xl mx-auto">
              <SimpleSearchBar
                value={localSearchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </ScrollReveal>

          {!localSearchQuery && !localCategoryFilter && (
            <ScrollReveal delay={0.3}>
              <div className="mt-8">
                <PopularCategories onCategoryClick={handleCategoryClick} />
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* Debug Panel - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <section className="px-4 py-4 bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto">
            <div className="text-xs text-yellow-800 bg-yellow-100 p-3 rounded">
              <strong>Debug Info:</strong> URL Category: "{categoryParam}" | Local Category: "{localCategoryFilter}" | 
              Search: "{localSearchQuery}" | Sort: "{localSortBy}" | 
              Nominees: {nominees.length} | Loading: {loading ? 'Yes' : 'No'}
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      <section className="px-4 pb-16">
        <div className="container mx-auto">
          {(localCategoryFilter || localSearchQuery) && (
            <ScrollReveal delay={0.1}>
              <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {localCategoryFilter ? 'Showing category:' : 'Showing results for:'}
                  </span>
                  <Badge
                    variant="outline"
                    className="px-4 py-2 text-sm font-medium rounded-full bg-orange-50 border-orange-200 text-orange-800"
                  >
                    {localCategoryFilter ? getCategoryLabel(localCategoryFilter) : localSearchQuery}
                    <button
                      onClick={handleClearSearch}
                      className="ml-2 text-orange-600 hover:text-orange-800"
                      title="Clear filter"
                    >
                      ×
                    </button>
                  </Badge>
                  {/* Debug info - remove in production */}
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    Debug: {localCategoryFilter || 'no-filter'} | {nominees.length} results
                  </span>
                </div>
                <SortDropdown value={localSortBy} onChange={handleSortChange} />
              </div>
            </ScrollReveal>
          )}
          
          {!localSearchQuery && !localCategoryFilter && (
            <ScrollReveal delay={0.1}>
              <div className="mb-8 flex justify-center sm:justify-end">
                <SortDropdown value={localSortBy} onChange={handleSortChange} />
              </div>
            </ScrollReveal>
          )}

          <ScrollReveal delay={0.2}>
            {nominees && nominees.length > 0 ? (
              <Grid nominations={nominees} />
            ) : (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No nominees found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search terms or browse all nominees</p>
                  {(localSearchQuery || localCategoryFilter) && (
                    <WSAButton
                      onClick={handleClearSearch}
                      variant="primary"
                      size="lg"
                    >
                      Clear {localCategoryFilter ? 'Filter' : 'Search'}
                    </WSAButton>
                  )}
                </div>
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>

      <VoteButton />
    </div>
  );
}

export default function NomineesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <section className="relative bg-white px-4 pt-12 pb-16">
          <div className="relative z-20 text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <img 
                src="/hero-logo.svg" 
                alt="World Staffing Awards 2026" 
                style={{
                  width: '224.89px',
                  height: '73.5px',
                  flexShrink: 0
                }}
                className="mx-auto"
              />
            </div>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Loading outstanding nominees...
            </p>
          </div>
        </section>
      </div>
    }>
      <NomineesContent />
    </Suspense>
  );
}