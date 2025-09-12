"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

interface CategoryCardProps {
  title: string;
  description: string;
  iconImage: string;
  gradient: string;
  badges: Array<{ id: string; label: string }>;
  delay?: number;
}

export function CategoryCard({ 
  title, 
  description, 
  iconImage, 
  gradient, 
  badges, 
  delay = 0 
}: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 border-slate-200 bg-white group overflow-hidden relative">
        {/* Hover Border Effect */}
        <motion.div
          className="absolute inset-0 border-2 border-orange-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
        />
        
        <div className="relative z-10">
          <CardHeader className="pb-3">
            <motion.div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-xl shadow-lg bg-white mb-3 relative overflow-hidden border-2 border-gray-200`}
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              {/* PNG Image */}
              <Image
                src={iconImage}
                alt={`${title} icon`}
                width={48}
                height={48}
                className="relative z-10 drop-shadow-sm"
              />
            </motion.div>
            
            <CardTitle className="text-lg text-slate-900 group-hover:text-orange-600 transition-colors duration-200 mb-2">
              {title}
            </CardTitle>
            <CardDescription className="text-slate-600 leading-relaxed">
              {description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-1">
            <div className="flex flex-wrap gap-1.5">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: delay + (index * 0.05) }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Link 
                    href={`/nominees?category=${badge.id}`}
                    onClick={() => {
                      console.log('🏷️ CategoryCard - Badge clicked:', {
                        badgeId: badge.id,
                        badgeLabel: badge.label,
                        targetUrl: `/nominees?category=${badge.id}`
                      });
                    }}
                  >
                    <Badge 
                      variant="outline" 
                      className="cursor-pointer hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-all duration-200"
                    >
                      {badge.label}
                    </Badge>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}