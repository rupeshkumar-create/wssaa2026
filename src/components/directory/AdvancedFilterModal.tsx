"use client";

import { useState } from "react";
import { X, Filter, Users, Building, MapPin, Briefcase, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/constants";

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  selectedType: string;
  onCategoryChange: (category: string) => void;
  onTypeChange: (type: string) => void;
  onApplyFilters: (filters: {
    category: string;
    type: string;
    sortBy: string;
    sortOrder: string;
  }) => void;
}

export function AdvancedFilterModal({
  isOpen,
  onClose,
  selectedCategory,
  selectedType,
  onCategoryChange,
  onTypeChange,
  onApplyFilters,
}: AdvancedFilterModalProps) {
  const [localCategory, setLocalCategory] = useState(selectedCategory);
  const [localType, setLocalType] = useState(selectedType);
  const [sortBy, setSortBy] = useState("votes");
  const [sortOrder, setSortOrder] = useState("desc");

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters({
      category: localCategory,
      type: localType,
      sortBy,
      sortOrder,
    });
    onCategoryChange(localCategory);
    onTypeChange(localType);
    onClose();
  };

  const handleReset = () => {
    setLocalCategory("");
    setLocalType("");
    setSortBy("votes");
    setSortOrder("desc");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Advanced Filters</h2>
              <p className="text-gray-600">Refine your search with detailed options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Filter by Type */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filter by Type</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setLocalType("")}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  localType === ""
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Filter className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">All Types</div>
                    <div className="text-sm text-gray-500">Show all nominees</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setLocalType("person")}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  localType === "person"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Individual Person</div>
                    <div className="text-sm text-gray-500">Professionals & leaders</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setLocalType("company")}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  localType === "company"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Company/Organization</div>
                    <div className="text-sm text-gray-500">Firms & agencies</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Filter by Category */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filter by Category</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-4 bg-gray-50 rounded-xl">
              <button
                onClick={() => setLocalCategory("")}
                className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  localCategory === ""
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300"
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setLocalCategory(category.id)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    localCategory === category.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SortAsc className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Sort Results</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sort by</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="votes">Most Votes</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Order</label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">
                      <div className="flex items-center gap-2">
                        <SortDesc className="h-4 w-4" />
                        Descending
                      </div>
                    </SelectItem>
                    <SelectItem value="asc">
                      <div className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4" />
                        Ascending
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={handleReset}
            className="px-6 py-2"
          >
            Reset All
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="px-8 py-2 bg-blue-600 hover:bg-blue-700"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}