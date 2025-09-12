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
import { CATEGORIES } from "@/lib/constants";


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

  // Local state for immediate UI updates without page refresh
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [localCategoryFilter, setLocalCategoryFilter] = useState("");
  const [localSortBy, setLocalSortBy] = useState("votes");

  useEffect(() => {
    setIsClient(true);
    console.log('🔍 Nominees - Component mounted, URL params:', {
      searchQuery: searchParams.get("q"),
      categoryParam: searchParams.get("category"),
      sortBy: searchParams.get("sort")
    });
  }, [searchParams]);

  // Sync local state with URL params on mount
  useEffect(() => {
    if (isClient) {
      setLocalSearchQuery(searchQuery);
      setLocalCategoryFilter(categoryParam);
      setLocalSortBy(sortBy);
      
      // Debug logging
      console.log('🔍 Nominees - URL params synced:', {
        searchQuery,
        categoryParam,
        sortBy
      });
      
      // If we have a category parameter, ensure we're in loading state
      if (categoryParam) {
        setLoading(true);
        console.log('🔍 Nominees - Category parameter detected, setting loading state');
      }
      console.log('🔍 Nominees - URL params synced:', {
        searchQuery,
        categoryParam,
        sortBy
      });
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

  // Store all nominees data
  const [allNominees, setAllNominees] = useState<NominationWithVotes[]>([]);

  // Fetch all nominees once on mount
  useEffect(() => {
    if (!isClient) return;
    
    console.log('🔍 Nominees - useEffect triggered, localCategoryFilter:', localCategoryFilter);
    
    const fetchAllNominees = async () => {
      try {
        setLoading(true);
        setError(""); // Clear any previous errors
        
        const timestamp = Date.now();
        // Build API URL with category filter if present
        let apiUrl = `/api/nominees?_t=${timestamp}`;
        if (localCategoryFilter) {
          apiUrl += `&category=${localCategoryFilter}`;
          console.log('🔍 Nominees - API URL with category filter:', apiUrl);
          console.log('🔍 Nominees - Category filter value:', localCategoryFilter);
        } else {
          console.log('🔍 Nominees - No category filter, fetching all nominees');
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
        console.log('🔍 Nominees - Loaded nominees:', data.length, localCategoryFilter ? `for category: ${localCategoryFilter}` : '(all categories)');
        
        // Debug: Show first few nominees and their categories
        if (data.length > 0) {
          console.log('🔍 Nominees - Sample data:', data.slice(0, 3).map(n => ({
            name: n.name || n.displayName,
            category: n.category
          })));
          
          // If category filter is active, verify all results match the filter
          if (localCategoryFilter) {
            const categories = [...new Set(data.map(n => n.category))];
            console.log('🔍 Nominees - Categories in filtered results:', categories);
            if (categories.length === 1 && categories[0] === localCategoryFilter) {
              console.log('✅ Category filtering working correctly');
            } else {
              console.log('⚠️ Category filtering issue detected');
            }
          }
        }
        
        setAllNominees(data);
        console.log('🔍 Nominees - setAllNominees called with', data.length, 'nominees');
        console.log('🔍 Nominees - First 3 nominees:', data.slice(0, 3).map(n => ({ name: n.name, category: n.category })));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAllNominees();
  }, [isClient, localCategoryFilter]);

  // Filter and sort nominees based on search and sort criteria
  useEffect(() => {
    if (!allNominees.length) return;

    let filteredData = [...allNominees];
    
    console.log('🔍 Nominees - Processing', filteredData.length, 'nominees');
    console.log('🔍 Nominees - localCategoryFilter:', localCategoryFilter);
    console.log('🔍 Nominees - localSearchQuery:', localSearchQuery);
    
    // Apply client-side search filtering (only if no category filter is active)
    if (localSearchQuery && !localCategoryFilter) {
      console.log('🔍 Nominees - Applying search filter:', localSearchQuery);
      const beforeCount = filteredData.length;
      filteredData = filteredData.filter((nominee: any) => {
        const name = nominee.nominee?.name || nominee.displayName || nominee.name || '';
        const category = nominee.category || '';
        const company = nominee.nominee?.company || nominee.company || '';
        const title = nominee.nominee?.jobtitle || nominee.jobtitle || '';
        
        const searchLower = localSearchQuery.toLowerCase();
        
        // Regular search across all fields
        return name.toLowerCase().includes(searchLower) ||
               category.toLowerCase().includes(searchLower) ||
               getCategoryLabel(category).toLowerCase().includes(searchLower) ||
               company.toLowerCase().includes(searchLower) ||
               title.toLowerCase().includes(searchLower);
      });
      console.log('🔍 Nominees - Search filter result:', filteredData.length, '(was', beforeCount, ')');
    }
    
    // When category filter is active, the data is already filtered by the API
    // so we don't need additional client-side filtering
    
    // Log category filtering status
    if (localCategoryFilter) {
      console.log('🔍 Nominees - Category filter active:', localCategoryFilter, 'Results:', filteredData.length);
      const categories = [...new Set(filteredData.map(n => n.category))];
      console.log('🔍 Nominees - Categories in filtered data:', categories);
      if (categories.length === 1 && categories[0] === localCategoryFilter) {
        console.log('✅ Category filtering working correctly');
      } else {
        console.log('⚠️ Category filtering issue - expected:', localCategoryFilter, 'found:', categories);
      }
    }
    
    // Apply sorting
    filteredData = sortNominees(filteredData, localSortBy);
    
    console.log('🔍 Nominees - Final result:', filteredData.length, 'nominees');
    console.log('🔍 Nominees - Final nominees sample:', filteredData.slice(0, 3).map(n => ({ name: n.name, category: n.category })));
    setNominees(filteredData);
  }, [allNominees, localSearchQuery, localCategoryFilter, localSortBy]);

  // Real-time vote updates
  const handleVoteUpdate = useCallback(() => {
    // Debounced refresh of nominees data with current category filter
    setTimeout(() => {
      let apiUrl = `/api/nominees?_t=${Date.now()}`;
      if (localCategoryFilter) {
        apiUrl += `&category=${localCategoryFilter}`;
      }
      
      fetch(apiUrl, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
        .then(res => res.json())
        .then(result => {
          if (!result.success) return;
          const data = result.data || [];
          console.log('🔍 Vote Update - Refreshed nominees:', data.length);
          setAllNominees(data);
        })
        .catch(console.error);
    }, 500);
  }, [localCategoryFilter]);

  useRealtimeVotes({
    category: "",
    onVoteUpdate: handleVoteUpdate,
  });

  // Debounced URL update to avoid page refresh on every keystroke
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      if (localSearchQuery) params.set('q', localSearchQuery);
      if (localCategoryFilter) params.set('category', localCategoryFilter);
      if (localSortBy !== 'votes') params.set('sort', localSortBy);
      
      const newUrl = `/nominees${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }, 1000); // 1 second debounce to reduce URL updates

    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, localCategoryFilter, localSortBy]);

  // Search change handler that updates local state immediately
  const handleSearchChange = (query: string) => {
    setLocalSearchQuery(query);
  };

  // Sort change handler
  const handleSortChange = (sort: string) => {
    setLocalSortBy(sort);
  };

  // Category click handler
  const handleCategoryClick = (categoryId: string) => {
    console.log('🏷️ handleCategoryClick called with:', categoryId);
    
    // Set loading state but don't clear data immediately
    setLoading(true);
    
    // Set category filter and clear search
    setLocalCategoryFilter(categoryId);
    setLocalSearchQuery("");
    console.log('🏷️ Local category filter set to:', categoryId);
  };

  const handleClearSearch = () => {
    setLocalSearchQuery("");
    setLocalCategoryFilter("");
    setLocalSortBy("votes");
    window.history.replaceState({}, '', '/nominees');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section with Logo - Loading */}
        <section className="relative bg-white px-4 pt-12 pb-16">
          <div className="absolute inset-0 bg-white" />
          
          <div className="relative z-20 text-center max-w-4xl mx-auto">
            {/* WSS 2026 Logo */}
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

            {/* Loading Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <Skeleton className="h-14 w-full bg-gray-200 rounded-full" />
            </div>

            {/* Loading Popular Categories */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Popular Categories</h3>
              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24 bg-gray-200 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Loading Results */}
        <section className="px-4 pb-16">
          <div className="container mx-auto">
            <div className="mb-8 text-center">
              <Skeleton className="h-6 w-32 bg-gray-200 mx-auto" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section with Logo - Error */}
        <section className="relative bg-white px-4 pt-12 pb-16">
          <div className="absolute inset-0 bg-white" />
          
          <div className="relative z-20 text-center max-w-4xl mx-auto">
            {/* WSS 2026 Logo */}
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

            {/* Error Description */}
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Something went wrong while loading nominees
            </p>

            {/* Error Alert */}
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
          {/* WSS 2026 Logo */}
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

          {/* Page Description */}
          <ScrollReveal delay={0.1}>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Discover and vote for outstanding professionals and companies in the World Staffing Awards 2026
            </p>
          </ScrollReveal>

          {/* Simple Search Bar */}
          <ScrollReveal delay={0.2}>
            <div className="max-w-3xl mx-auto">
              <SimpleSearchBar
                value={localSearchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </ScrollReveal>

          {/* Popular Categories - Only show when search and category filter are empty */}
          <AnimatePresence mode="wait">
            {!localSearchQuery && !localCategoryFilter && (
              <ScrollReveal delay={0.3}>
                <div className="mt-8">
                  <PopularCategories onCategoryClick={handleCategoryClick} />
                </div>
              </ScrollReveal>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Results Section */}
      <section className="px-4 pb-16">
        <div className="container mx-auto">
          {/* Selected Category and Sort Dropdown - Show when category filter or search is active */}
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
                </div>
                <SortDropdown value={localSortBy} onChange={handleSortChange} />
              </div>
            </ScrollReveal>
          )}
          
          {/* Sort Dropdown Only - Show when no search or category filter */}
          {!localSearchQuery && !localCategoryFilter && (
            <ScrollReveal delay={0.1}>
              <div className="mb-8 flex justify-center sm:justify-end">
                <SortDropdown value={localSortBy} onChange={handleSortChange} />
              </div>
            </ScrollReveal>
          )}

          {/* Grid */}
          <ScrollReveal delay={0.2} key={`grid-${localCategoryFilter}-${nominees.length}`}>
            {nominees && nominees.length > 0 ? (
              <Grid key={`${localCategoryFilter}-${localSearchQuery}-${nominees.length}`} nominations={nominees} />
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

      {/* Sticky Vote Button */}
      <VoteButton />
    </div>
  );
}

export default function NomineesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        {/* Hero Section with Logo - Fallback */}
        <section className="relative bg-white px-4 pt-12 pb-16">
          <div className="absolute inset-0 bg-white" />
          
          <div className="relative z-20 text-center max-w-4xl mx-auto">
            {/* WSS 2026 Logo */}
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

            {/* Loading Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <Skeleton className="h-14 w-full bg-gray-200 rounded-full" />
            </div>

            {/* Loading Popular Categories */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Popular Categories</h3>
              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24 bg-gray-200 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Loading Results */}
        <section className="px-4 pb-16">
          <div className="container mx-auto">
            <div className="mb-8 text-center">
              <Skeleton className="h-6 w-32 bg-gray-200 mx-auto" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </section>
      </div>
    }>
      <NomineesContent />
    </Suspense>
  );
}