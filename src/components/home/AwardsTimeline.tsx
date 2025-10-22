"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, AlertCircle, Trophy, Users } from "lucide-react";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'nomination' | 'voting' | 'announcement' | 'ceremony';
  status: 'upcoming' | 'active' | 'completed';
}

export function AwardsTimeline() {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      const response = await fetch('/api/timeline', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTimeline(result.data);
        }
      }
    } catch (err) {
      console.error('Timeline fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'nomination':
        return <Users className="h-5 w-5" />;
      case 'voting':
        return <CheckCircle className="h-5 w-5" />;
      case 'announcement':
        return <AlertCircle className="h-5 w-5" />;
      case 'ceremony':
        return <Trophy className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: TimelineEvent['type'], status: TimelineEvent['status']) => {
    const baseColors = {
      nomination: 'from-blue-500 to-blue-600',
      voting: 'from-green-500 to-green-600',
      announcement: 'from-orange-500 to-orange-600',
      ceremony: 'from-purple-500 to-purple-600'
    };

    if (status === 'completed') {
      return 'from-gray-400 to-gray-500';
    }

    return baseColors[type] || 'from-gray-400 to-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Awards Timeline</h2>
            <div className="text-center py-8">Loading timeline...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3 text-gray-900">
            <Calendar className="h-10 w-10" style={{ color: '#0b869d' }} />
            Awards Timeline
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Important dates and milestones for the World Staffing Awards 2026. Stay updated on nominations, voting, and ceremony dates.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200"></div>

          <div className="space-y-8">
            {timeline.map((event, index) => (
              <div key={event.id} className="relative flex items-start gap-6">
                {/* Timeline dot */}
                <div className={`
                  relative z-10 w-16 h-16 rounded-full bg-gradient-to-br ${getTypeColor(event.type, event.status)}
                  flex items-center justify-center text-white shadow-lg
                  ${event.status === 'completed' ? 'opacity-60' : 'shadow-xl'}
                  transition-all duration-300 hover:scale-110
                `}>
                  {getTypeIcon(event.type)}
                  
                  {/* Status indicator */}
                  {event.status === 'completed' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Event content */}
                <div className={`
                  flex-1 bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100
                  ${event.status === 'completed' ? 'opacity-75' : 'hover:shadow-xl'}
                  transition-all duration-300
                `}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className={`
                      text-xl font-bold
                      ${event.status === 'completed' ? 'text-gray-600' : 'text-gray-900'}
                    `}>
                      {event.title}
                    </h3>
                    
                    <div className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${event.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                      }
                    `}>
                      {event.status === 'completed' ? 'Completed' : 'Upcoming'}
                    </div>
                  </div>
                  
                  <p className={`
                    mb-4 leading-relaxed
                    ${event.status === 'completed' ? 'text-gray-500' : 'text-gray-600'}
                  `}>
                    {event.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className={`
                      flex items-center gap-2
                      ${event.status === 'completed' ? 'text-gray-400' : 'text-gray-600'}
                    `}>
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.date)}
                    </div>
                    <div className={`
                      flex items-center gap-2
                      ${event.status === 'completed' ? 'text-gray-400' : 'text-gray-600'}
                    `}>
                      <Clock className="h-4 w-4" />
                      {formatTime(event.date)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Stay Updated</h3>
            <p className="text-gray-600 mb-6">
              Don't miss any important dates! Follow our timeline and be part of the World Staffing Awards 2026.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/nominate"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Submit Nomination
              </a>
              <a
                href="/nominees"
                className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-8 py-3 rounded-full font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View Nominees
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}