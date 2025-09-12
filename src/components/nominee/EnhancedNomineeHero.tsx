"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { WSAButton } from "@/components/ui/wsa-button";
import { Building2, User, Linkedin, Calendar, Award, Vote } from "lucide-react";
import Image from "next/image";
import { formatCategoryName } from "@/lib/utils/category-formatter";
import { FloatingElements } from "@/components/animations/FloatingElements";

interface EnhancedNomineeHeroProps {
  nominee: any;
  nomineeData: any;
  imageUrl?: string;
  linkedinUrl?: string;
  isPersonNomination: boolean;
  onVoteClick?: () => void;
  votingStatus?: any;
}

export function EnhancedNomineeHero({ 
  nominee, 
  nomineeData, 
  imageUrl, 
  linkedinUrl, 
  isPersonNomination,
  onVoteClick,
  votingStatus
}: EnhancedNomineeHeroProps) {
  return (
    <section className="relative px-4 pt-6 pb-16 overflow-hidden min-h-[600px] md:min-h-[700px]" style={{ background: 'linear-gradient(180deg, #fce9dd 0%, #FCFBFA 100%)' }}>
      <FloatingElements />
      
      <div className="container mx-auto max-w-6xl relative z-10 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center pt-8 pb-8 min-h-[500px] md:min-h-[600px]">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col justify-center space-y-6 lg:space-y-8 order-2 lg:order-1"
          >
            {/* Category Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-start gap-3 flex-wrap"
            >
              <Badge 
                variant="outline" 
                className="text-sm font-medium px-4 py-2 bg-white/80 backdrop-blur-sm border-orange-200 text-orange-700 inline-flex items-center"
              >
                <Award className="h-4 w-4 mr-2 text-orange-500 flex-shrink-0" />
                <span>{formatCategoryName(nomineeData.category) || 'Unknown Category'}</span>
              </Badge>
            </motion.div>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-3"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 leading-tight tracking-tight">
                {nominee.displayName || nominee.name || 'Unknown Nominee'}
              </h1>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-3"
            >
              {/* Job Title for Person Nominations */}
              {isPersonNomination && (
                <div className="flex items-center text-base md:text-lg font-medium text-gray-700">
                  <User className="h-5 w-5 mr-3 text-orange-500 flex-shrink-0" />
                  <span>{nominee.title || nominee.jobtitle || nomineeData.title || 'Professional'}</span>
                </div>
              )}
              
              {/* Industry for Company Nominations */}
              {!isPersonNomination && nominee.industry && (
                <div className="flex items-center text-base md:text-lg font-medium text-gray-700">
                  <Building2 className="h-5 w-5 mr-3 text-orange-500 flex-shrink-0" />
                  <span>{nominee.industry}</span>
                </div>
              )}

              {/* Nomination Date */}
              {nomineeData.createdAt && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-3 text-orange-500 flex-shrink-0" />
                  <span>Nominated {new Date(nomineeData.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-4 pt-4"
            >
              {linkedinUrl && (
                <WSAButton 
                  asChild 
                  variant="secondary"
                  size="icon"
                  className="w-14 h-14 rounded-full text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0"
                  style={{ backgroundColor: '#D4ECF4' }}
                >
                  <a 
                    href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center hover:bg-opacity-80"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="h-6 w-6" />
                  </a>
                </WSAButton>
              )}
              
              {/* Vote Now Button */}
              {onVoteClick && (
                <WSAButton 
                  onClick={onVoteClick}
                  variant="primary"
                  className="h-14 px-6 bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold inline-flex items-center"
                  disabled={votingStatus?.loading}
                >
                  <Vote className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>Vote Now</span>
                </WSAButton>
              )}
            </motion.div>
          </motion.div>

          {/* Right Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center lg:justify-end order-1 lg:order-2"
          >
            <div className="relative">
              {/* Main image container - removed glow effects */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative w-72 h-72 md:w-80 md:h-80 lg:w-[360px] lg:h-[360px] rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-b from-gray-100 to-gray-200"
              >
                {imageUrl ? (
                  <Image 
                    src={imageUrl}
                    alt={nominee.displayName || nominee.name || 'Nominee'}
                    fill
                    className={`object-cover ${isPersonNomination ? "" : "object-contain bg-white p-4"}`}
                    unoptimized={imageUrl.startsWith('data:') || imageUrl.includes('unsplash')}
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-orange-500 to-orange-600 flex items-center justify-center">
                    {isPersonNomination ? (
                      <User className="h-24 w-24 text-white" />
                    ) : (
                      <Building2 className="h-24 w-24 text-white" />
                    )}
                  </div>
                )}
              </motion.div>

              {/* Floating badge - orange colors */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -bottom-4 -right-4 bg-white rounded-full p-4 shadow-lg border-4 border-orange-100"
              >
                <Award className="h-8 w-8 text-orange-500" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}