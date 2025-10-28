"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, CheckCircle, Trophy, ArrowRight } from "lucide-react";

interface TimelinePhase {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  icon: React.ReactNode;
  status: 'completed' | 'active' | 'upcoming';
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'nomination' | 'voting' | 'announcement' | 'ceremony';
  status: 'upcoming' | 'active' | 'completed';
}

export function AwardsTimeline() {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchTimeline();
    
    // Set up periodic refresh to catch admin changes
    const interval = setInterval(fetchTimeline, 60000); // Refresh every minute
    
    // Listen for focus events to refresh when user returns to tab
    const handleFocus = () => {
      fetchTimeline();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchTimeline = async () => {
    try {
      const response = await fetch('/api/timeline', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('🔄 Timeline data fetched:', result.data.length, 'events');
          setTimelineEvents(result.data);
        }
      }
    } catch (err) {
      console.error('Timeline fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTimelinePhases = (): TimelinePhase[] => {
    const now = new Date();
    
    // Define the 3 fixed phases with their types
    const phaseTemplates = [
      {
        id: 1,
        title: "Nominations Open",
        description: "Submit nominations for outstanding individuals and companies in the staffing industry",
        type: 'nomination' as const,
        icon: <Users className="h-8 w-8" />
      },
      {
        id: 2,
        title: "Public Voting Opens",
        description: "Community voting begins for all nominees across categories",
        type: 'voting' as const,
        icon: <CheckCircle className="h-8 w-8" />
      },
      {
        id: 3,
        title: "Winners & Awards Ceremony",
        description: "Official announcement of winners and World Staffing Summit Awards Ceremony",
        type: 'ceremony' as const,
        icon: <Trophy className="h-8 w-8" />
      }
    ];

    return phaseTemplates.map(template => {
      // Find corresponding timeline event from admin panel
      // Look for specific event IDs first, then fall back to type matching
      let timelineEvent;
      
      if (template.type === 'nomination') {
        // Look for "nominations-open" specifically
        timelineEvent = timelineEvents.find(event => event.id === 'nominations-open') ||
                       timelineEvents.find(event => event.type === 'nomination' && event.title.includes('Open'));
      } else if (template.type === 'voting') {
        // Look for "voting-open" specifically  
        timelineEvent = timelineEvents.find(event => event.id === 'voting-open') ||
                       timelineEvents.find(event => event.type === 'voting' && event.title.includes('Open'));
      } else if (template.type === 'ceremony') {
        // Look for ceremony event
        timelineEvent = timelineEvents.find(event => event.id === 'awards-ceremony') ||
                       timelineEvents.find(event => event.type === 'ceremony');
      } else {
        // Fallback to type matching
        timelineEvent = timelineEvents.find(event => event.type === template.type);
      }
      
      // Use admin panel date if available, otherwise use defaults
      let startDate = "2025-01-01";
      let endDate: string | undefined;
      let status: 'completed' | 'active' | 'upcoming' = 'upcoming';
      
      if (timelineEvent) {
        startDate = timelineEvent.date.split('T')[0]; // Extract date part
        status = timelineEvent.status;
        
        // Debug logging
        console.log(`🔍 Timeline Debug - ${template.title}:`, {
          foundEvent: timelineEvent.title,
          eventId: timelineEvent.id,
          originalDate: timelineEvent.date,
          extractedDate: startDate,
          status: status
        });
        
        // Calculate end date based on phase type
        const eventDate = new Date(timelineEvent.date);
        if (template.type === 'nomination') {
          // Nominations run for 3 months
          const endDateObj = new Date(eventDate);
          endDateObj.setMonth(endDateObj.getMonth() + 3);
          endDate = endDateObj.toISOString().split('T')[0];
        } else if (template.type === 'voting') {
          // Voting runs for 2 months
          const endDateObj = new Date(eventDate);
          endDateObj.setMonth(endDateObj.getMonth() + 2);
          endDate = endDateObj.toISOString().split('T')[0];
        }
        // Ceremony doesn't have an end date
      } else {
        // Fallback dates if no admin data
        if (template.type === 'nomination') {
          startDate = "2025-01-01";
          endDate = "2025-03-31";
        } else if (template.type === 'voting') {
          startDate = "2025-04-01";
          endDate = "2025-06-30";
        } else if (template.type === 'ceremony') {
          startDate = "2025-07-15";
        }
      }
      
      return {
        id: template.id,
        title: template.title,
        description: template.description,
        startDate,
        endDate,
        icon: template.icon,
        status
      };
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    if (endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    return formatDate(startDate);
  };

  // Recalculate phases when timeline events change
  const phases = getTimelinePhases();

  // Prevent hydration mismatch by not rendering animations until mounted
  if (!mounted) {
    return (
      <section className="py-16 px-6 bg-gradient-to-br from-slate-50 via-orange-50/30 to-yellow-50/20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Awards Timeline</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Important dates and milestones for the World Staffing Awards 2026
            </p>
          </div>
          
          {/* Static version without animations for SSR */}
          <div className="relative">
            <div className="absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-[#F26B21]/30 to-gray-200 hidden lg:block"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
              {phases.map((phase, index) => (
                <div key={phase.id} className="flex flex-col items-center relative">
                  <div className="relative mb-8">
                    <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br from-[#F26B21] to-[#E55A1A] text-white transition-all duration-500 relative z-10">
                      {phase.icon}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50/50 to-yellow-50/30 w-full max-w-sm transition-all duration-500">
                    <h3 className="text-xl font-bold mb-4 text-center text-gray-900">
                      {phase.title}
                    </h3>
                    <p className="text-gray-600 text-center mb-6 leading-relaxed">
                      {phase.description}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        {formatDateRange(phase.startDate, phase.endDate)}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 bg-gradient-to-br from-slate-50 via-orange-50/30 to-yellow-50/20">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Awards Timeline</h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
            Important dates and milestones for the World Staffing Awards 2026
          </p>
        </motion.div>

        {/* 3-Phase Horizontal Timeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-[#F26B21]/30 to-gray-200 hidden lg:block"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            {phases.map((phase, index) => (
              <motion.div
                key={phase.id}
                className="flex flex-col items-center relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Phase Circle */}
                <motion.div 
                  className="relative mb-8"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div 
                    className={`
                      w-32 h-32 rounded-full flex items-center justify-center shadow-2xl
                      transition-all duration-500 relative z-10
                      ${phase.status === 'completed' 
                        ? 'bg-gradient-to-br from-[#ED641E] to-[#D55A1A] text-white' 
                        : phase.status === 'active'
                        ? 'bg-gradient-to-br from-[#F26B21] to-[#E55A1A] text-white animate-pulse'
                        : 'bg-gradient-to-br from-[#F26B21] to-[#E55A1A] text-white'
                      }
                    `}
                  >
                    {phase.icon}
                  </div>
                  
                  {/* Animated Pulse Ring */}
                  <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-[#F26B21]/30"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                  />
                  
                  {/* Secondary Pulse Ring */}
                  <motion.div 
                    className="absolute inset-0 rounded-full border-2 border-[#F26B21]/20"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ 
                      duration: 2.5,
                      repeat: Infinity,
                      delay: index * 0.4
                    }}
                  />

                  {/* Completion Check */}
                  {phase.status === 'completed' && (
                    <motion.div 
                      className="absolute -top-3 -right-3 w-10 h-10 bg-[#ED641E] rounded-full flex items-center justify-center shadow-lg z-20"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.2 + 0.6, type: "spring", stiffness: 400 }}
                    >
                      <CheckCircle className="h-6 w-6 text-white" />
                    </motion.div>
                  )}

                  {/* Connecting Arrow (Desktop) */}
                  {index < phases.length - 1 && (
                    <motion.div 
                      className="absolute left-full top-1/2 transform -translate-y-1/2 z-0 hidden lg:block"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 + 0.8 }}
                    >
                      <div className="flex items-center ml-8">
                        <div className="w-20 h-1 bg-gradient-to-r from-[#F26B21] to-gray-300"></div>
                        <ArrowRight className="h-6 w-6 text-[#F26B21] ml-2" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Content Card */}
                <motion.div 
                  className={`
                    bg-white rounded-2xl p-8 shadow-xl border-2 w-full max-w-sm
                    transition-all duration-500 hover:shadow-2xl
                    ${phase.status === 'completed' 
                      ? 'border-[#ED641E]/30 bg-gradient-to-br from-orange-50/50 to-red-50/30' 
                      : phase.status === 'active'
                      ? 'border-[#F26B21] bg-gradient-to-br from-orange-50/50 to-yellow-50/30 ring-2 ring-[#F26B21]/20'
                      : 'border-gray-200 bg-gradient-to-br from-gray-50/50 to-yellow-50/30'
                    }
                  `}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Title */}
                  <h3 className={`
                    text-xl font-bold mb-4 text-center
                    ${phase.status === 'completed' 
                      ? 'text-[#ED641E]' 
                      : phase.status === 'active'
                      ? 'text-[#F26B21]'
                      : 'text-gray-900'
                    }
                  `}>
                    {phase.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    {phase.description}
                  </p>

                  {/* Date Range */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {formatDateRange(phase.startDate, phase.endDate)}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="text-center">
                    <motion.span 
                      className={`
                        inline-block px-4 py-2 rounded-full text-sm font-semibold
                        ${phase.status === 'completed' 
                          ? 'bg-[#ED641E]/10 text-[#ED641E] border border-[#ED641E]/20' 
                          : phase.status === 'active'
                          ? 'bg-[#F26B21]/10 text-[#F26B21] border border-[#F26B21]/20'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {phase.status === 'completed' ? 'Completed' : 
                       phase.status === 'active' ? 'Active Now' : 'Coming Soon'}
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>


        </div>
      </div>
    </section>
  );
}