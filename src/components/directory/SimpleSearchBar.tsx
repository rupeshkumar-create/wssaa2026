"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, User, Building2, MapPin, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface SearchSuggestion {
  text: string;
  type: 'category' | 'name' | 'location' | 'company';
  icon?: string;
  count?: number;
  url?: string;
  nominationId?: string;
}

interface SimpleSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SimpleSearchBar({ value, onChange }: SimpleSearchBarProps) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  // Fetch search suggestions with debouncing
  useEffect(() => {
    const fetchSuggestions = async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        const result = await response.json();
        
        if (result.success) {
          setSuggestions(result.data || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        fetchSuggestions(value.trim());
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [value]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.url) {
      // Navigate to the nominee page
      router.push(suggestion.url);
    } else {
      // For categories and other types, update search
      onChange(suggestion.text);
    }
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (value.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'name':
        return <User className="w-4 h-4" />;
      case 'company':
        return <Building2 className="w-4 h-4" />;
      case 'location':
        return <MapPin className="w-4 h-4" />;
      case 'category':
        return <Award className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Search Input */}
      <div className={`relative group transition-all duration-300 ${value ? 'transform -translate-y-2 scale-105' : ''}`}>
        <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 h-7 w-7 text-gray-400 group-focus-within:text-orange-500 transition-colors z-10" />
        <Input
          ref={inputRef}
          placeholder={value ? "Search nominees..." : `Search for ${currentPlaceholder}|`}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          className="pl-16 pr-16 py-8 text-2xl rounded-full border-2 border-gray-200 focus:border-orange-500 focus:ring-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white placeholder:text-gray-400 font-medium"
          autoComplete="off"
        />
        {value && (
          <button
            onClick={() => {
              onChange("");
              setShowSuggestions(false);
              setSelectedIndex(-1);
            }}
            className="absolute right-7 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-orange-50 transition-colors z-10"
          >
            <X className="h-6 w-6 text-orange-500 hover:text-orange-600" />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                    index === selectedIndex ? 'bg-orange-50 border-r-4 border-orange-500' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 ${
                    suggestion.type === 'name' ? 'text-blue-500' :
                    suggestion.type === 'company' ? 'text-green-500' :
                    suggestion.type === 'location' ? 'text-purple-500' :
                    'text-orange-500'
                  }`}>
                    {suggestion.icon ? (
                      <span className="text-lg">{suggestion.icon}</span>
                    ) : (
                      getSuggestionIcon(suggestion.type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 font-medium truncate">
                      {suggestion.text}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {suggestion.type === 'name' ? 'Person' : suggestion.type}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : value.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <Search className="w-4 h-4" />
                <span>No suggestions found</span>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}