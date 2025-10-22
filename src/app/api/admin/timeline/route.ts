import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'nomination' | 'voting' | 'announcement' | 'ceremony';
  status: 'upcoming' | 'active' | 'completed';
  isEditable: boolean;
}

// Default timeline events for WSS Awards 2026
const defaultTimeline: TimelineEvent[] = [
  {
    id: 'nominations-open',
    title: 'Nominations Open',
    description: 'Start accepting nominations for all award categories',
    date: '2025-01-01T00:00:00Z',
    type: 'nomination',
    status: 'completed',
    isEditable: true
  },
  {
    id: 'nominations-close',
    title: 'Nominations Close',
    description: 'Final deadline for all nominations',
    date: '2025-03-31T23:59:59Z',
    type: 'nomination',
    status: 'upcoming',
    isEditable: true
  },
  {
    id: 'voting-open',
    title: 'Public Voting Opens',
    description: 'Community voting begins for all nominees',
    date: '2025-04-01T00:00:00Z',
    type: 'voting',
    status: 'upcoming',
    isEditable: true
  },
  {
    id: 'voting-close',
    title: 'Public Voting Closes',
    description: 'Final deadline for community votes',
    date: '2025-05-31T23:59:59Z',
    type: 'voting',
    status: 'upcoming',
    isEditable: true
  },
  {
    id: 'winners-announcement',
    title: 'Winners Announcement',
    description: 'Official announcement of all award winners',
    date: '2025-06-15T12:00:00Z',
    type: 'announcement',
    status: 'upcoming',
    isEditable: true
  },
  {
    id: 'awards-ceremony',
    title: 'Awards Ceremony',
    description: 'World Staffing Summit Awards Ceremony 2026',
    date: '2025-07-15T18:00:00Z',
    type: 'ceremony',
    status: 'upcoming',
    isEditable: true
  }
];

// Load timeline from local storage (in a real app, this would be from database)
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
      return timeline.map((event: TimelineEvent) => ({
        ...event,
        status: new Date(event.date) < now ? 'completed' : 'upcoming'
      }));
    } else {
      // Create default timeline file
      fs.writeFileSync(timelinePath, JSON.stringify(defaultTimeline, null, 2));
      return defaultTimeline;
    }
  } catch (error) {
    console.error('Error loading timeline:', error);
    return defaultTimeline;
  }
}

// Save timeline to local storage
function saveTimeline(timeline: TimelineEvent[]): boolean {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const timelinePath = path.join(process.cwd(), 'data', 'timeline.json');
    fs.writeFileSync(timelinePath, JSON.stringify(timeline, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving timeline:', error);
    return false;
  }
}

/**
 * GET /api/admin/timeline - Get awards timeline
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
    console.error('GET /api/admin/timeline error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get timeline' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/timeline - Create new timeline event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, date, type } = body;
    
    if (!title || !description || !date || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, date, type' },
        { status: 400 }
      );
    }
    
    const timeline = loadTimeline();
    
    const newEvent: TimelineEvent = {
      id: `custom-${Date.now()}`,
      title,
      description,
      date,
      type,
      status: new Date(date) < new Date() ? 'completed' : 'upcoming',
      isEditable: true
    };
    
    timeline.push(newEvent);
    
    if (saveTimeline(timeline)) {
      return NextResponse.json({
        success: true,
        data: newEvent,
        message: 'Timeline event created successfully'
      });
    } else {
      throw new Error('Failed to save timeline');
    }
  } catch (error) {
    console.error('POST /api/admin/timeline error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create timeline event' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/timeline - Update timeline event
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, date, type } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing event ID' },
        { status: 400 }
      );
    }
    
    const timeline = loadTimeline();
    const eventIndex = timeline.findIndex(event => event.id === id);
    
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Timeline event not found' },
        { status: 404 }
      );
    }
    
    const event = timeline[eventIndex];
    
    if (!event.isEditable) {
      return NextResponse.json(
        { error: 'This timeline event cannot be edited' },
        { status: 403 }
      );
    }
    
    // Update the event
    timeline[eventIndex] = {
      ...event,
      title: title || event.title,
      description: description || event.description,
      date: date || event.date,
      type: type || event.type,
      status: new Date(date || event.date) < new Date() ? 'completed' : 'upcoming'
    };
    
    if (saveTimeline(timeline)) {
      return NextResponse.json({
        success: true,
        data: timeline[eventIndex],
        message: 'Timeline event updated successfully'
      });
    } else {
      throw new Error('Failed to save timeline');
    }
  } catch (error) {
    console.error('PUT /api/admin/timeline error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update timeline event' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/timeline - Delete timeline event
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing event ID' },
        { status: 400 }
      );
    }
    
    const timeline = loadTimeline();
    const eventIndex = timeline.findIndex(event => event.id === id);
    
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Timeline event not found' },
        { status: 404 }
      );
    }
    
    const event = timeline[eventIndex];
    
    if (!event.isEditable) {
      return NextResponse.json(
        { error: 'This timeline event cannot be deleted' },
        { status: 403 }
      );
    }
    
    timeline.splice(eventIndex, 1);
    
    if (saveTimeline(timeline)) {
      return NextResponse.json({
        success: true,
        message: 'Timeline event deleted successfully'
      });
    } else {
      throw new Error('Failed to save timeline');
    }
  } catch (error) {
    console.error('DELETE /api/admin/timeline error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete timeline event' },
      { status: 500 }
    );
  }
}