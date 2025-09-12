"use client";

import { useState, useEffect, useCallback } from 'react';

interface NominationStatus {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  closeMessage: string;
  votingStartDate: string;
  isVotingOpen: boolean;
}

export function useNominationStatus(): NominationStatus {
  const [status, setStatus] = useState<NominationStatus>({
    enabled: true,
    loading: true,
    error: null,
    refresh: () => {},
    closeMessage: '',
    votingStartDate: '',
    isVotingOpen: false
  });

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/settings', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('📝 Nomination status fetched:', result);
        
        const nominationsEnabled = result.settings?.nominations_enabled === 'true' || result.nominations_enabled === 'true';
        const votingStartDate = result.settings?.voting_start_date || result.voting_start_date || '';
        
        // Check if voting is open
        const now = new Date();
        const start = votingStartDate ? new Date(votingStartDate) : null;
        const isVotingOpen = start ? now >= start : false;
        
        // If voting is open, nominations should be closed
        const enabled = nominationsEnabled && !isVotingOpen;
        
        let closeMessage = '';
        if (isVotingOpen) {
          closeMessage = 'Nominations are now closed. Voting is currently open!';
        } else if (!nominationsEnabled) {
          closeMessage = 'Nominations are currently closed by administrators.';
        } else if (votingStartDate) {
          closeMessage = `Nominations will close when voting opens on ${start?.toLocaleDateString()}.`;
        }
        
        console.log('📝 Nomination logic:', {
          nominationsEnabled,
          votingStartDate,
          now: now.toISOString(),
          start: start?.toISOString(),
          isVotingOpen,
          enabled,
          closeMessage
        });
        
        setStatus(prev => ({
          ...prev,
          enabled,
          votingStartDate,
          isVotingOpen,
          closeMessage,
          loading: false,
          error: null
        }));
      } else if (response.status === 404) {
        // API route not found, try admin settings API as fallback
        console.log('⚠️ Settings API not found, trying admin API...');
        const adminResponse = await fetch('/api/admin/settings', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (adminResponse.ok) {
          const adminResult = await adminResponse.json();
          console.log('📝 Admin nomination settings fetched:', adminResult);
          
          const nominationsEnabled = adminResult.settings?.nominations_enabled?.value === 'true';
          const votingStartDate = adminResult.settings?.voting_start_date?.value || '';
          
          // Check if voting is open
          const now = new Date();
          const start = votingStartDate ? new Date(votingStartDate) : null;
          const isVotingOpen = start ? now >= start : false;
          
          // If voting is open, nominations should be closed
          const enabled = nominationsEnabled && !isVotingOpen;
          
          let closeMessage = '';
          if (isVotingOpen) {
            closeMessage = 'Nominations are now closed. Voting is currently open!';
          } else if (!nominationsEnabled) {
            closeMessage = 'Nominations are currently closed by administrators.';
          } else if (votingStartDate) {
            closeMessage = `Nominations will close when voting opens on ${start?.toLocaleDateString()}.`;
          }
          
          console.log('📝 Admin nomination logic:', {
            nominationsEnabled,
            votingStartDate,
            now: now.toISOString(),
            start: start?.toISOString(),
            isVotingOpen,
            enabled,
            closeMessage
          });
          
          setStatus(prev => ({
            ...prev,
            enabled,
            votingStartDate,
            isVotingOpen,
            closeMessage,
            loading: false,
            error: null
          }));
        } else {
          throw new Error('Both settings APIs failed');
        }
      } else {
        throw new Error('Failed to fetch nomination status');
      }
    } catch (error) {
      console.error('❌ Error fetching nomination status:', error);
      console.log('📝 Defaulting to nominations enabled for safety');
      // Default to nominations enabled for better UX
      setStatus(prev => ({
        ...prev,
        enabled: true,
        closeMessage: 'Unable to check nomination status',
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch status'
      }));
    }
  }, []);

  const refresh = useCallback(() => {
    setStatus(prev => ({ ...prev, loading: true }));
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus();
    
    // Set up periodic refresh every 30 seconds to catch admin changes
    const interval = setInterval(fetchStatus, 30000);
    
    // Listen for focus events to refresh when user returns to tab
    const handleFocus = () => {
      fetchStatus();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchStatus]);

  return {
    ...status,
    refresh
  };
}