"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WSAButton } from "@/components/ui/wsa-button";
import { Vote, X, Award } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useVotingStatus } from "@/hooks/useVotingStatus";

interface VoteButtonProps {
  showAfterScroll?: number;
  nominee?: {
    id: string;
    name: string;
    liveUrl: string;
  };
}

export function VoteButton({ showAfterScroll = 600, nominee }: VoteButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const votingStatus = useVotingStatus();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > showAfterScroll;
      setIsVisible(scrolled && !isDismissed);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showAfterScroll, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  // Determine button content based on voting status
  const showNominate = !votingStatus.loading && !votingStatus.isVotingOpen;
  const buttonText = showNominate ? "Nominate Now" : "Vote Now";
  const buttonHref = showNominate ? "/nominate" : (nominee?.liveUrl || "/nominees");
  const ButtonIcon = showNominate ? Award : Vote;

  // Don't show button if voting status is still loading
  if (votingStatus.loading) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center text-xs transition-colors duration-200 z-10"
            >
              <X className="h-3 w-3" />
            </button>

            {/* Main Button */}
            <WSAButton
              asChild
              variant="primary"
              size="lg"
            >
              <Link href={buttonHref} className="flex items-center">
                <ButtonIcon className="mr-2 h-6 w-6" />
                {nominee && !showNominate ? `Vote for ${nominee.name}` : buttonText}
              </Link>
            </WSAButton>

            {/* Simplified Pulse Animation */}
            <motion.div
              className="absolute inset-0 bg-orange-400 rounded-full -z-10 opacity-30"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}