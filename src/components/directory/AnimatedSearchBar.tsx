"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AnimatedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: string) => void;
  onAdvancedFilterClick?: () => void;
}

interface SearchSuggestion {
  text: string;
  type: 'category' | 'name' | 'location' | 'company';
  icon?: string;
}

export function AnimatedSearchBar({ value, onChange, onSuggestionSelect, onAdvancedFilterClick }: AnimatedSearchBarProps) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [allResults, setAllResults] = useState<SearchSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholders = [
    "John Doe - Top Recruiter",
    "Acme Corp - Best Staffing Firm", 
    "All nominees from USA",
    "CEO at TechStaff Solutions",
    "Rising Star winners under 30"
  ];

  // Animated typing effect
  useEffect(() => {
    const currentText = placeholders[placeholderIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setCurrentPlaceholder(currentText.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          // Pause at end, then start deleting
          setTimeout(() => setIsDeleting(true), 2500);
        }
      } else {
        if (charIndex > 0) {
          setCurrentPlaceholder(currentText.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setPlaceholderIndex((placeholderIndex + 1) % placeholders.length);
        }
      }
    }, isDeleting ? 50 : 120);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, placeholderIndex, placeholders]);

  // Enhanced search functionality with dedicated search API
  useEffect(() => {
    const searchDatabase = async () => {
      if (value.length > 1) {
        try {
          // Use dedicated search suggestions API
          const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(value)}&_t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            const searchSuggestions = result.data || [];
            
            setSuggestions(searchSuggestions.slice(0, 5));
            setAllResults(searchSuggestions);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Search error:', error);
          // Fallback to static suggestions
          const fallbackSuggestions: SearchSuggestion[] = [
            { text: 'Top Recruiter', type: 'category', icon: '🏆' },
            { text: 'Rising Star (Under 30)', type: 'category', icon: '⭐' },
            { text: 'Best Sourcer', type: 'category', icon: '🔍' },
            { text: 'Executive Leader', type: 'category', icon: '👔' },
            { text: 'Rupesh Kumar', type: 'name', icon: '👤' },
            { text: 'All nominees from USA', type: 'location', icon: '🌍' }
          ].filter(s => s.text.toLowerCase().includes(value.toLowerCase()));
          
          setSuggestions(fallbackSuggestions.slice(0, 5));
          setAllResults(fallbackSuggestions);
          setShowSuggestions(true);
        }
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
        setAllResults([]);
      }
    };

    const debounceTimer = setTimeout(searchDatabase, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion.text);
    }
  };

  const handleShowAllResults = () => {
    // Show all results in suggestions
    setSuggestions(allResults);
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Search Input - Made Bigger with Pop-up Animation */}
      <div className={`relative group transition-all duration-300 ${value ? 'transform -translate-y-2 scale-105' : ''}`}>
        <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 h-7 w-7 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" />
        <Input
          ref={inputRef}
          placeholder={value ? "Search nominees..." : `Search for ${currentPlaceholder}|`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length > 1 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-16 pr-16 py-8 text-2xl rounded-3xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white placeholder:text-gray-400 font-medium"
        />
        {value && (
          <button
            onClick={() => {
              onChange("");
              setShowSuggestions(false);
            }}
            className="absolute right-7 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        )}
      </div>

      {/* Advanced Filter Button - Always visible */}
      <div className="flex justify-center mt-4">
        <button
          onClick={onAdvancedFilterClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 font-semibold rounded-2xl transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg border border-blue-200"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
            <Filter className="h-4 w-4 text-blue-600" />
          </div>
          <span>Advanced Filters</span>
        </button>
      </div>

      {/* Enhanced Search Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || allResults.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 z-50 overflow-hidden">
          <div className="p-6">
            {/* Suggestions Section */}
            {suggestions.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-4 font-semibold flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.text}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-5 py-4 hover:bg-blue-50 rounded-xl transition-colors duration-150 flex items-center gap-4 group mb-2 border border-transparent hover:border-blue-200"
                  >
                    <span className="text-2xl">{suggestion.icon || '🔍'}</span>
                    <div className="flex-1">
                      <span className="text-gray-900 group-hover:text-blue-900 font-medium text-lg">
                        {suggestion.text}
                      </span>
                      <div className="text-sm text-gray-500 capitalize">
                        {suggestion.type === 'name' ? 'Nominee' : 
                         suggestion.type === 'category' ? 'Category' :
                         suggestion.type === 'location' ? 'Location' : 'Company'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Show All Results Button */}
            {allResults.length > suggestions.length && (
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={handleShowAllResults}
                  className="w-full px-5 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-150 flex items-center justify-center gap-2 text-gray-700 font-medium"
                >
                  <Filter className="h-4 w-4" />
                  Show All {allResults.length} Results
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}