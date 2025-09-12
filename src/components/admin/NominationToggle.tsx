"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Save, Loader2, CheckCircle, XCircle, Calendar, Vote, Award } from "lucide-react";

interface NominationToggleProps {
  className?: string;
}

export function NominationToggle({ className }: NominationToggleProps) {
  const [votingStartDate, setVotingStartDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch current settings
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/settings', {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const settings = result.settings;
          setVotingStartDate(settings.voting_start_date?.value || '');
        } else {
          throw new Error('Failed to fetch settings');
        }
      } else {
        throw new Error(`HTTP ${response.status}: Failed to fetch settings`);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  // Update voting start date
  const updateVotingStartDate = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          setting_key: 'voting_start_date',
          setting_value: votingStartDate
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSuccess('Voting start date updated successfully');
          setTimeout(() => setSuccess(null), 3000);
        } else {
          throw new Error(result.error || 'Failed to update voting start date');
        }
      } else {
        throw new Error(`HTTP ${response.status}: Failed to update voting start date`);
      }
    } catch (error) {
      console.error('Error updating voting start date:', error);
      setError(error instanceof Error ? error.message : 'Failed to update voting start date');
    } finally {
      setSaving(false);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Voting Start Date
        </CardTitle>
        <CardDescription>
          Set when voting will open. Before this date, homepage shows "Nominate Now" and vote buttons are disabled.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Voting Start Date */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voting-start-date" className="text-base font-medium">
              Voting Start Date & Time
            </Label>
            <p className="text-sm text-muted-foreground">
              Select when voting will open. Before this date, the homepage will show "Nominate Now" and vote buttons will be disabled.
            </p>
            <Input
              id="voting-start-date"
              type="datetime-local"
              value={votingStartDate}
              onChange={(e) => setVotingStartDate(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="flex justify-start">
            <Button
              onClick={updateVotingStartDate}
              disabled={saving || !votingStartDate}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Voting Date
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Current Status</h4>
          {votingStartDate ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Voting Opens:</span>
                <span className="font-medium">
                  {new Date(votingStartDate).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current Phase:</span>
                <span className={`font-medium ${new Date() < new Date(votingStartDate) ? 'text-blue-600' : 'text-orange-600'}`}>
                  {new Date() < new Date(votingStartDate) ? 'Nomination Phase' : 'Voting Phase'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Homepage Button:</span>
                <span className="font-medium">
                  {new Date() < new Date(votingStartDate) ? 'Nominate Now' : 'Vote Now'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Vote Buttons:</span>
                <span className={`font-medium ${new Date() < new Date(votingStartDate) ? 'text-red-600' : 'text-green-600'}`}>
                  {new Date() < new Date(votingStartDate) ? 'Show "Opens on date"' : 'Active'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No voting start date set. Please select a date above.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}