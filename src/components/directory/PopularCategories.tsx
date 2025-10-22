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
    // Fixed categories for Top 100 WSS winners
    const wssCategories = [
      {
        id: 'best-staffing-leader',
        label: 'Top 100 Staffing Leaders to Watch in 2026',
        nominationCount: 100,
        voteCount: 2500,
        trendingScore: 100
      },
      {
        id: 'best-staffing-firm',
        label: 'Top 100 Staffing Companies to Work for in 2026',
        nominationCount: 100,
        voteCount: 2300,
        trendingScore: 98
      },
      {
        id: 'best-recruiter',
        label: 'Top 100 Recruiters to work with in 2026',
        nominationCount: 100,
        voteCount: 2200,
        trendingScore: 96
      }
    ];
    
    setCategories(wssCategories);
    setLoading(false);
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
        {/* Single Row - All 3 categories */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, staggerChildren: 0.1 }}
        >
          {categories.map((category, index) => (
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
                  console.log('🏷️ Category clicked:', category.id, 'Label:', category.label);
                  onCategoryClick?.(category.id);
                }}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <Flame className="h-3 w-3 text-red-500" />}
                  <span>{category.label}</span>
                </div>
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}