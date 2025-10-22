import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'nomination' | 'voting' | 'announcement' | 'ceremony';
  status: 'upcoming' | 'active' | 'completed';
}

// Load timeline from local storage
function loadTimeline(): TimelineEvent[] {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const timelinePath = path.join(process.cwd(), 'data', 'timeline.json');
    
    if (fs.existsSync(timelinePath)) {
      const rawData = fs.readFileSync(timelinePath, 'utf8');
      const timeline = JSON.parse(rawData);
      
      // Update status based on current date
      const now = new Date();
      return timeline.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        type: event.type,
        status: new Date(event.date) < now ? 'completed' : 'upcoming'
      }));
    } else {
      // Return default timeline if file doesn't exist
      return [
        {
          id: 'nominations-open',
          title: 'Nominations Open',
          description: 'Start accepting nominations for all award categories',
          date: '2025-01-01T00:00:00Z',
          type: 'nomination',
          status: 'completed'
        },
        {
          id: 'nominations-close',
          title: 'Nominations Close',
          description: 'Final deadline for all nominations',
          date: '2025-03-31T23:59:59Z',
          type: 'nomination',
          status: 'upcoming'
        },
        {
          id: 'voting-open',
          title: 'Public Voting Opens',
          description: 'Community voting begins for all nominees',
          date: '2025-04-01T00:00:00Z',
          type: 'voting',
          status: 'upcoming'
        },
        {
          id: 'voting-close',
          title: 'Public Voting Closes',
          description: 'Final deadline for community votes',
          date: '2025-05-31T23:59:59Z',
          type: 'voting',
          status: 'upcoming'
        },
        {
          id: 'winners-announcement',
          title: 'Winners Announcement',
          description: 'Official announcement of all award winners',
          date: '2025-06-15T12:00:00Z',
          type: 'announcement',
          status: 'upcoming'
        },
        {
          id: 'awards-ceremony',
          title: 'Awards Ceremony',
          description: 'World Staffing Summit Awards Ceremony 2026',
          date: '2025-07-15T18:00:00Z',
          type: 'ceremony',
          status: 'upcoming'
        }
      ];
    }
  } catch (error) {
    console.error('Error loading timeline:', error);
    return [];
  }
}

/**
 * GET /api/timeline - Get public awards timeline
 */
export async function GET(request: NextRequest) {
  try {
    const timeline = loadTimeline();
    
    // Sort by date
    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return NextResponse.json({
      success: true,
      data: timeline,
      count: timeline.length
    });
  } catch (error) {
    console.error('GET /api/timeline error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get timeline' },
      { status: 500 }
    );
  }
}