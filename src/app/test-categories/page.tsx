"use client";

import { useState, useEffect } from "react";

export default function TestCategoriesPage() {
  const [allNominees, setAllNominees] = useState([]);
  const [filteredNominees, setFilteredNominees] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const testCategories = [
    { id: "", label: "All Categories" },
    { id: "top-recruiter", label: "Top Recruiters" },
    { id: "top-executive-leader", label: "Top Executive Leaders" },
    { id: "rising-star-under-30", label: "Rising Stars (Under 30)" }
  ];

  const fetchNominees = async (categoryId = "") => {
    setLoading(true);
    try {
      let url = `/api/nominees?_t=${Date.now()}`;
      if (categoryId) {
        url += `&category=${categoryId}`;
      }
      
      console.log('🔍 Fetching:', url);
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        const nominees = result.data || [];
        console.log('🔍 Received:', nominees.length, 'nominees');
        
        if (categoryId) {
          setFilteredNominees(nominees);
          console.log('🔍 Categories in filtered results:', [...new Set(nominees.map(n => n.category))]);
        } else {
          setAllNominees(nominees);
          console.log('🔍 Categories in all results:', [...new Set(nominees.map(n => n.category))]);
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNominees(); // Load all nominees on mount
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    console.log('🏷️ Category clicked:', categoryId);
    setSelectedCategory(categoryId);
    fetchNominees(categoryId);
  };

  const displayNominees = selectedCategory ? filteredNominees : allNominees;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Category Filtering Test</h1>
      
      {/* Category Buttons */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Select Category:</h2>
        <div className="flex flex-wrap gap-2">
          {testCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`px-4 py-2 rounded-lg border ${
                selectedCategory === category.id
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="text-gray-600">Loading...</div>
        </div>
      )}

      {/* Results */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">
          Results {selectedCategory && `for "${selectedCategory}"`}:
        </h2>
        <div className="text-sm text-gray-600 mb-3">
          Found {displayNominees.length} nominees
        </div>
        
        {displayNominees.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Categories in results:</div>
            <div className="text-sm text-gray-600">
              {[...new Set(displayNominees.map(n => n.category))].join(', ')}
            </div>
            
            <div className="text-sm font-medium mt-4">Sample nominees:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {displayNominees.slice(0, 6).map((nominee, index) => (
                <div key={index} className="p-2 border rounded text-sm">
                  <div className="font-medium">{nominee.name}</div>
                  <div className="text-gray-600">{nominee.category}</div>
                  <div className="text-gray-500">{nominee.votes} votes</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <div className="text-sm space-y-1">
          <div>Selected Category: {selectedCategory || 'None'}</div>
          <div>All Nominees Count: {allNominees.length}</div>
          <div>Filtered Nominees Count: {filteredNominees.length}</div>
          <div>Display Nominees Count: {displayNominees.length}</div>
        </div>
      </div>
    </div>
  );
}