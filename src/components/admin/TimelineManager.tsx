"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Plus, Edit, Trash2, CheckCircle, AlertCircle, Trophy, Users } from "lucide-react";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'nomination' | 'voting' | 'announcement' | 'ceremony';
  status: 'upcoming' | 'active' | 'completed';
  isEditable: boolean;
}

export function TimelineManager() {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'nomination' as TimelineEvent['type']
  });

  // Define the 3 fixed phases
  const fixedPhases = [
    {
      id: 'phase-1',
      title: 'Nominations Open',
      description: 'Submit nominations for outstanding individuals and companies in the staffing industry',
      type: 'nomination' as const,
      icon: <Users className="h-4 w-4" />
    },
    {
      id: 'phase-2', 
      title: 'Public Voting Opens',
      description: 'Community voting begins for all nominees across categories',
      type: 'voting' as const,
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      id: 'phase-3',
      title: 'Winners & Awards Ceremony', 
      description: 'Official announcement of winners and World Staffing Summit Awards Ceremony',
      type: 'ceremony' as const,
      icon: <Trophy className="h-4 w-4" />
    }
  ];

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/timeline', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTimeline(result.data);
        } else {
          setError(result.error || 'Failed to fetch timeline');
        }
      } else {
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Timeline fetch error:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = editingEvent ? '/api/admin/timeline' : '/api/admin/timeline';
      const method = editingEvent ? 'PUT' : 'POST';
      const body = editingEvent 
        ? { id: editingEvent.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await fetchTimeline();
        setIsDialogOpen(false);
        setEditingEvent(null);
        setFormData({ title: '', description: '', date: '', type: 'nomination' });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save timeline event');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Network error occurred');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this timeline event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/timeline?id=${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchTimeline();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete timeline event');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Network error occurred');
    }
  };

  const openEditDialog = (event: TimelineEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.split('T')[0], // Convert to date input format
      type: event.type
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingEvent(null);
    setFormData({ title: '', description: '', date: '', type: 'nomination' });
    setIsDialogOpen(true);
  };

  const getTypeIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'nomination':
        return <Users className="h-4 w-4" />;
      case 'voting':
        return <CheckCircle className="h-4 w-4" />;
      case 'announcement':
        return <AlertCircle className="h-4 w-4" />;
      case 'ceremony':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'nomination':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'voting':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'announcement':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ceremony':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Awards Timeline
            </CardTitle>
            <CardDescription>
              Set dates for the 3 main phases: Nominations, Voting, and Awards Ceremony
            </CardDescription>
          </div>
          <div className="text-sm text-gray-600">
            3-Phase Timeline System
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8">Loading timeline...</div>
        ) : (
          <div className="space-y-4">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">3-Phase Timeline System</h4>
              <p className="text-blue-700 text-sm">
                The awards timeline consists of exactly 3 phases. You can only edit the dates for each phase.
              </p>
            </div>
            
            {fixedPhases.map((phase, index) => {
              // Find corresponding timeline event or create default
              const timelineEvent = timeline.find(t => t.type === phase.type) || {
                id: phase.id,
                title: phase.title,
                description: phase.description,
                date: new Date().toISOString(),
                type: phase.type,
                status: 'upcoming' as const,
                isEditable: true
              };
              
              return (
                <div key={phase.id} className="relative">
                  {/* Timeline line */}
                  {index < fixedPhases.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  <div className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                    {/* Timeline dot */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(phase.type)}`}>
                      {phase.icon}
                    </div>
                    
                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{phase.title}</h3>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge className={getStatusColor(timelineEvent.status)}>
                            {timelineEvent.status}
                          </Badge>
                          <Badge variant="outline" className={getTypeColor(phase.type)}>
                            Phase {index + 1}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{phase.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {timelineEvent.date ? formatDate(timelineEvent.date) : 'Date not set'}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog({...timelineEvent, title: phase.title, description: phase.description})}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Set Date
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Timeline Event' : 'Create Timeline Event'}
              </DialogTitle>
              <DialogDescription>
                {editingEvent ? 'Update the timeline event details.' : 'Add a new event to the awards timeline.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="date">Date & Time</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="type">Phase</Label>
                <Input
                  id="type"
                  value={formData.type === 'nomination' ? 'Phase 1: Nominations' : 
                         formData.type === 'voting' ? 'Phase 2: Voting' : 
                         'Phase 3: Awards Ceremony'}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                {editingEvent ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}