"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCategoryLabel } from "@/lib/utils/category-utils";
import { motion, AnimatePresence } from "framer-motion";

interface PopularCategory {
  id: string;
  label: string;
  nominationCount: number;
  voteCount: number;
  trendingScore: number;
}

interface PopularCategoriesProps {
  onCategoryClick?: (categoryId: string) => void;
}

export function PopularCategories({ onCategoryClick }: PopularCategoriesProps) {
  const [categories, setCategories] = useState<PopularCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories/trending', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          setCategories(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching popular categories:', error);
        // Fallback to demo data
        const demoCategories = [
          'top-recruiter',
          'top-executive-leader', 
          'rising-star-under-30',
          'top-ai-driven-staffing-platform',
          'best-recruitment-agency'
        ];
        
        setCategories(demoCategories.map((categoryId, index) => ({
          id: categoryId,
          label: getCategoryLabel(categoryId),
          nominationCount: 45 - (index * 2),
          voteCount: 1250 - (index * 90),
          trendingScore: 95 - (index * 3)
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-600" />
          <Flame className="h-4 w-4 text-red-500" />
          Popular Categories
        </h3>
        <div className="max-w-4xl mx-auto">
          {/* First Row - Loading */}
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
          {/* Second Row - Loading */}
          <div className="flex flex-wrap justify-center gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const topCategories = categories.slice(0, 5);

  // Function to convert category names to proper case
  const toProperCase = (str: string) => {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <motion.div 
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3 
        className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <TrendingUp className="h-5 w-5 text-orange-600" />
        <Flame className="h-4 w-4 text-red-500" />
        Popular Categories
      </motion.h3>
      <div className="max-w-4xl mx-auto">
        {/* First Row - Top 3 categories */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, staggerChildren: 0.1 }}
        >
          {topCategories.slice(0, 3).map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + (index * 0.1) }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                variant="outline"
                className="cursor-pointer px-6 py-3 text-sm font-medium rounded-full transition-all duration-200 relative border-2 border-gray-300 text-gray-900 hover:border-gray-400 hover:text-black shadow-sm"
                style={{ backgroundColor: '#D4ECF4' }}
                onClick={() => {
                  console.log('🏷️ Category clicked:', category.id, 'Label:', getCategoryLabel(category.id));
                  onCategoryClick?.(category.id);
                }}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <Flame className="h-3 w-3 text-red-500" />}
                  <span>{getCategoryLabel(category.id)}</span>
                </div>
              </Badge>
            </motion.div>
          ))}
        </motion.div>
        {/* Second Row - Next 2 categories */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, staggerChildren: 0.1 }}
        >
          {topCategories.slice(3, 5).map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + (index * 0.1) }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                variant="outline"
                className="cursor-pointer px-6 py-3 text-sm font-medium rounded-full transition-all duration-200 border-2 border-gray-300 text-gray-900 hover:border-gray-400 hover:text-black shadow-sm"
                style={{ backgroundColor: '#D4ECF4' }}
                onClick={() => {
                  console.log('🏷️ Category clicked:', category.id, 'Label:', getCategoryLabel(category.id));
                  onCategoryClick?.(category.id);
                }}
              >
                <div className="flex items-center gap-2">
                  <span>{getCategoryLabel(category.id)}</span>
                </div>
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}