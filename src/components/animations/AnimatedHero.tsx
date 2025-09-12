"use client";

import { motion } from "framer-motion";
import { WSAButton } from "@/components/ui/wsa-button";
import { Award, Users } from "lucide-react";
import Link from "next/link";
import { useVotingStatus } from "@/hooks/useVotingStatus";

export function AnimatedHero() {
  const votingStatus = useVotingStatus();
  
  // Show "Nominate Now" before voting opens, "Vote Now" after
  const showNominate = !votingStatus.loading && !votingStatus.isVotingOpen;
  
  return (
    <section className="relative bg-white px-4 pt-12 pb-0">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-white" />
      
      {/* Content Container */}
      <div className="relative z-20 text-center max-w-5xl mx-auto">
        
        {/* Hero Logo */}
        <motion.div
          initial={{ opacity: 0, y: -36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10 mt-6"
        >
          <img 
            src="/hero-logo.svg" 
            alt="World Staffing Awards 2026" 
            style={{
              width: '224.89px',
              height: '73.5px',
              flexShrink: 0
            }}
            className="mx-auto"
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-14 leading-relaxed"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          The leading award in global staffing, honoring the people and companies driving transformation in talent.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16"
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {/* Nominate Now Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <WSAButton 
              asChild 
              variant="hero"
              size="xl"
            >
              <Link href={showNominate ? "/nominate" : "/nominees"} className="flex items-center">
                <Award className="mr-2 h-6 w-6" />
                {showNominate ? "Nominate Now" : "Vote Now"}
              </Link>
            </WSAButton>
          </motion.div>

          {/* View Nominees Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <WSAButton 
              asChild 
              variant="secondary"
              size="xl"
            >
              <Link href="/nominees" className="flex items-center">
                <Users className="mr-2 h-6 w-6" />
                View Nominees
              </Link>
            </WSAButton>
          </motion.div>
        </motion.div>

        {/* Hero Graphics */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex justify-center pt-8 -mb-1"
        >
          <img 
            src="/hero-graphics.svg" 
            alt="Award winners illustration" 
            style={{
              width: '614.196px',
              height: '409.464px',
              flexShrink: 0,
              aspectRatio: '3/2',
              display: 'block'
            }}
            className="mx-auto"
          />
        </motion.div>
      </div>
    </section>
  );
}