"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, Users, Building, Settings, ChevronDown, ChevronUp, TrendingUp, Flame } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { formatCategoryName } from "@/lib/utils/category-formatter";
import { AnimatedSearchBar } from "./AnimatedSearchBar";
import { AdvancedFilterModal } from "./AdvancedFilterModal";

interface TrendingCategory {
  id: string;
  label: string;
  nominationCount: number;
  voteCount: number;
  trendingScore: number;
}

interface FiltersProps {
  searchQuery: string;
  selectedCategory: string;
  selectedType: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onTypeChange: (type: string) => void;
  onClearFilters: () => void;
}

export function Filters({
  searchQuery,
  selectedCategory,
  selectedType,
  onSearchChange,
  onCategoryChange,
  onTypeChange,
  onClearFilters,
}: FiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [trendingCategories, setTrendingCategories] = useState<TrendingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const hasActiveFilters = searchQuery || selectedCategory || selectedType;
  
  const allCategories = CATEGORIES;

  // Fetch trending categories
  useEffect(() => {
    const fetchTrendingCategories = async () => {
      try {
        const response = await fetch('/api/categories/trending', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          setTrendingCategories(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching trending categories:', error);
        // Fallback to demo data
        setTrendingCategories([
          { id: 'top-recruiter', label: 'Top Recruiter', nominationCount: 45, voteCount: 1250, trendingScore: 95 },
          { id: 'rising-star', label: 'Rising Star (Under 30)', nominationCount: 38, voteCount: 980, trendingScore: 88 },
          { id: 'best-sourcer', label: 'Best Sourcer', nominationCount: 42, voteCount: 1100, trendingScore: 85 },
          { id: 'executive-leader', label: 'Executive Leader', nominationCount: 35, voteCount: 890, trendingScore: 82 },
          { id: 'best-staffing-firm', label: 'Best Staffing Firm', nominationCount: 40, voteCount: 1050, trendingScore: 80 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingCategories();
  }, []);

  return (
    <div className="space-y-10">
      {/* Animated Search Bar - Larger and Centered */}
      <AnimatedSearchBar
        value={searchQuery}
        onChange={onSearchChange}
        onSuggestionSelect={onSearchChange}
        onAdvancedFilterClick={() => setShowAdvancedModal(true)}
      />

      {/* Trending Categories - Only 5 Categories in 2 Rows */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-600" />
          <Flame className="h-4 w-4 text-red-500" />
          Trending Categories
        </h3>
        {loading ? (
          <div className="flex justify-center gap-3 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* First Row - Top 3 trending categories */}
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              {trendingCategories.slice(0, 3).map((category, index) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`cursor-pointer px-6 py-3 text-sm font-medium rounded-full transition-all duration-200 hover:scale-105 relative ${
                    selectedCategory === category.id
                      ? "bg-orange-600 text-white shadow-lg hover:bg-orange-700"
                      : "bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 shadow-sm"
                  }`}
                  onClick={() => {
                    if (selectedCategory === category.id) {
                      onCategoryChange("");
                    } else {
                      onCategoryChange(category.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    {index === 0 && <Flame className="h-3 w-3 text-red-500" />}
                    <span>{category.label}</span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      {category.voteCount}
                    </span>
                  </div>
                </Badge>
              ))}
            </div>
            {/* Second Row - Next 2 trending categories */}
            <div className="flex flex-wrap justify-center gap-4">
              {trendingCategories.slice(3, 5).map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`cursor-pointer px-6 py-3 text-sm font-medium rounded-full transition-all duration-200 hover:scale-105 ${
                    selectedCategory === category.id
                      ? "bg-orange-600 text-white shadow-lg hover:bg-orange-700"
                      : "bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 shadow-sm"
                  }`}
                  onClick={() => {
                    if (selectedCategory === category.id) {
                      onCategoryChange("");
                    } else {
                      onCategoryChange(category.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>{category.label}</span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      {category.voteCount}
                    </span>
                  </div>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Search Toggle with Better Icon Positioning - Always visible */}
      <div className="text-center">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 font-semibold rounded-2xl transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
            <Settings className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-lg">{showAdvanced ? "Hide" : "Show"} Advanced Search</span>
          <div className="flex items-center justify-center w-6 h-6">
            {showAdvanced ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </button>
      </div>

      {/* Advanced Search Options */}
      {showAdvanced && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 space-y-8 max-w-4xl mx-auto border border-gray-200 shadow-lg">
          <div className="text-center">
            <h4 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Advanced Search Options
            </h4>
            <p className="text-gray-600 mt-2">Refine your search with detailed filters</p>
          </div>
          
          {/* Filter Controls with Icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Filter className="h-4 w-4 text-blue-600" />
                Filter by Category
              </label>
              <Select value={selectedCategory || "all"} onValueChange={(value) => onCategoryChange(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full h-12 rounded-xl border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Users className="h-4 w-4 text-green-600" />
                Filter by Type
              </label>
              <Select value={selectedType || "all"} onValueChange={(value) => onTypeChange(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full h-12 rounded-xl border-2 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="person">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>Individual Person</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="company">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-orange-600" />
                      <span>Company/Organization</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* All Categories Grid - Better Layout */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 justify-center">
              <Filter className="h-4 w-4 text-purple-600" />
              Browse All Categories
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-4 bg-white rounded-xl border border-gray-200">
              {allCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    if (selectedCategory === category.id) {
                      onCategoryChange("");
                    } else {
                      onCategoryChange(category.id);
                    }
                  }}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="text-center pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={onClearFilters} 
                className="px-8 py-3 rounded-full border-2 border-red-200 hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-semibold"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display - Enhanced */}
      {hasActiveFilters && (
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 border-2 border-blue-200 shadow-sm">
              <Search className="h-4 w-4" />
              <span className="font-medium">"{searchQuery}"</span>
              <button 
                onClick={() => onSearchChange("")}
                className="hover:bg-blue-200 rounded-full p-1 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-800 border-2 border-orange-200 shadow-sm">
              <Filter className="h-4 w-4" />
              <span className="font-medium">{formatCategoryName(selectedCategory)}</span>
              <button 
                onClick={() => onCategoryChange("")}
                className="hover:bg-orange-200 rounded-full p-1 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedType && (
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 border-2 border-green-200 shadow-sm">
              {selectedType === "person" ? <Users className="h-4 w-4" /> : <Building className="h-4 w-4" />}
              <span className="font-medium capitalize">{selectedType}</span>
              <button 
                onClick={() => onTypeChange("")}
                className="hover:bg-green-200 rounded-full p-1 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Advanced Filter Modal */}
      <AdvancedFilterModal
        isOpen={showAdvancedModal}
        onClose={() => setShowAdvancedModal(false)}
        selectedCategory={selectedCategory}
        selectedType={selectedType}
        onCategoryChange={onCategoryChange}
        onTypeChange={onTypeChange}
        onApplyFilters={(filters) => {
          // Handle advanced filter application
          console.log('Applied filters:', filters);
        }}
      />
    </div>
  );
}