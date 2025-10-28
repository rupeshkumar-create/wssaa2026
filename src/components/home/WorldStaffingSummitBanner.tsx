"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Calendar, MapPin } from "lucide-react";
import Image from "next/image";

interface SummitBanner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function WorldStaffingSummitBanner() {
  const [banner, setBanner] = useState<SummitBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      const response = await fetch('/api/summit-banner', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setBanner(result.data);
        }
      }
    } catch (err) {
      console.error('Summit banner fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !banner || !banner.is_active) {
    return null;
  }

  const handleBannerClick = () => {
    if (banner.link_url) {
      window.open(banner.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.section 
      className="py-12 px-4 bg-gradient-to-br from-[#F26B21]/5 via-orange-50/30 to-yellow-50/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="relative overflow-hidden rounded-2xl shadow-2xl cursor-pointer group"
          onClick={handleBannerClick}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background Image */}
          <div className="relative h-64 md:h-80 lg:h-96">
            <Image
              src={banner.image_url}
              alt={banner.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-start p-8 md:p-12">
              <div className="max-w-2xl text-white">
                <motion.h2 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {banner.title}
                </motion.h2>
                
                <motion.p 
                  className="text-lg md:text-xl mb-6 leading-relaxed opacity-90"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {banner.description}
                </motion.p>
                
                <motion.div
                  className="flex items-center gap-3 text-white/90 group-hover:text-white transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <ExternalLink className="h-5 w-5" />
                  <span className="font-semibold">Learn More & Register</span>
                </motion.div>
              </div>
            </div>
            
            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-[#F26B21]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* Bottom Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#F26B21] to-[#E55A1A] p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">World Staffing Summit 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Global Event</span>
                </div>
              </div>
              
              <motion.div
                className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm font-semibold">Register Now</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}