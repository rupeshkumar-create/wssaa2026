"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Vote, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface VotingSettings {
  voting_start_date: string;
  voting_end_date: string;
  nominations_enabled: boolean;
}

export function VotingDateControl() {
  const [settings, setSettings] = useState<VotingSettings>({
    voting_start_date: '',
    voting_end_date: '',
    nominations_enabled: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔧 Fetched admin settings:', data);
        
        setSettings({
          voting_start_date: data.settings?.voting_start_date?.value || '',
          voting_end_date: data.settings?.voting_end_date?.value || '',
          nominations_enabled: data.settings?.nominations_enabled?.value === 'true'
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setResult({ error: 'Failed to load current settings' });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setting_key: key,
          setting_value: value
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update setting');
      }

      return true;
    } catch (error) {
      console.error(`Failed to update ${key}:`, error);
      throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setResult(null);

    try {
      // Validate dates
      if (settings.voting_start_date && settings.voting_end_date) {
        const start = new Date(settings.voting_start_date);
        const end = new Date(settings.voting_end_date);
        
        if (end <= start) {
          throw new Error('Voting end date must be after start date');
        }
      }

      // Update all settings
      await Promise.all([
        updateSetting('voting_start_date', settings.voting_start_date),
        updateSetting('voting_end_date', settings.voting_end_date),
        updateSetting('nominations_enabled', settings.nominations_enabled.toString())
      ]);

      setResult({ success: true });
      
      // Refresh the page data after a short delay to show the success message
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      setResult({ 
        error: error instanceof Error ? error.message : 'Failed to save settings' 
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatus = () => {
    const now = new Date();
    const start = settings.voting_start_date ? new Date(settings.voting_start_date) : null;
    const end = settings.voting_end_date ? new Date(settings.voting_end_date) : null;

    if (start && now >= start) {
      if (end && now >= end) {
        return { status: 'ended', message: 'Voting has ended', color: 'red' };
      } else {
        return { status: 'open', message: 'Voting is currently open', color: 'green' };
      }
    } else if (start) {
      return { status: 'scheduled', message: `Voting opens on ${start.toLocaleDateString()}`, color: 'orange' };
    } else {
      return { status: 'not_set', message: 'Voting date not set', color: 'gray' };
    }
  };

  const status = getStatus();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Settings className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <CardTitle>Voting & Nomination Control</CardTitle>
            <CardDescription>
              Manage when voting opens/closes and control nomination availability
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Vote className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold">Current Status</h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`
                  ${status.color === 'green' ? 'border-green-500 text-green-700 bg-green-50' : ''}
                  ${status.color === 'orange' ? 'border-orange-500 text-orange-700 bg-orange-50' : ''}
                  ${status.color === 'red' ? 'border-red-500 text-red-700 bg-red-50' : ''}
                  ${status.color === 'gray' ? 'border-gray-500 text-gray-700 bg-gray-50' : ''}
                `}
              >
                {status.message}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Nominations:</span>
              <Badge variant={settings.nominations_enabled ? "default" : "secondary"}>
                {settings.nominations_enabled ? 'Open' : 'Closed'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Voting Dates */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Voting Schedule
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voting_start_date">Voting Start Date & Time</Label>
              <Input
                id="voting_start_date"
                type="datetime-local"
                value={settings.voting_start_date}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  voting_start_date: e.target.value 
                }))}
              />
              <p className="text-xs text-gray-500">
                When voting opens, nominations will automatically close
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="voting_end_date">Voting End Date & Time (Optional)</Label>
              <Input
                id="voting_end_date"
                type="datetime-local"
                value={settings.voting_end_date}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  voting_end_date: e.target.value 
                }))}
              />
              <p className="text-xs text-gray-500">
                Leave empty for no end date
              </p>
            </div>
          </div>
        </div>

        {/* Nomination Control */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Nomination Control
          </h3>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="nominations_enabled" className="text-base font-medium">
                Public Nominations Enabled
              </Label>
              <p className="text-sm text-gray-500">
                Allow public users to submit nominations
              </p>
            </div>
            <Switch
              id="nominations_enabled"
              checked={settings.nominations_enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ 
                ...prev, 
                nominations_enabled: checked 
              }))}
            />
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Admin nominations are always available regardless of these settings. 
              When voting opens, public nominations will be automatically disabled.
            </AlertDescription>
          </Alert>
        </div>

        {/* Result Messages */}
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {result.success 
                ? "Settings saved successfully! The page will refresh to show updated status."
                : result.error
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}