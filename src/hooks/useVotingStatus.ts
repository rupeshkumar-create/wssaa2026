"use client";

import { useState, useEffect, useCallback } from 'react';

interface VotingStatus {
  startDate: string;
  endDate: string;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  isVotingOpen: boolean;
  isNominationOpen: boolean;
  votingMessage: string;
  nominationMessage: string;
}

export function useVotingStatus(): VotingStatus {
  const [status, setStatus] = useState<VotingStatus>({
    startDate: '',
    endDate: '',
    loading: true,
    error: null,
    refresh: () => {},
    isVotingOpen: false,
    isNominationOpen: true,
    votingMessage: '',
    nominationMessage: ''
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
        console.log('🗳️ Voting status fetched:', result);
        
        const startDate = result.settings?.voting_start_date || result.voting_start_date || '';
        const endDate = result.settings?.voting_end_date || result.voting_end_date || '';
        const nominationsEnabled = result.settings?.nominations_enabled === 'true' || result.nominations_enabled === 'true';
        
        // Check if voting is open (current time >= start date and < end date if set)
        const now = new Date();
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        let isVotingOpen = false;
        let votingMessage = '';
        let isNominationOpen = nominationsEnabled;
        let nominationMessage = '';
        
        if (start) {
          if (now >= start) {
            if (end && now >= end) {
              isVotingOpen = false;
              votingMessage = 'Voting has ended';
            } else {
              isVotingOpen = true;
              votingMessage = 'Voting is now open!';
            }
          } else {
            isVotingOpen = false;
            votingMessage = `Voting opens on ${start.toLocaleDateString()}`;
          }
        } else {
          isVotingOpen = false;
          votingMessage = 'Voting date not set';
        }
        
        // Nomination logic: if voting is open, nominations should be closed
        if (isVotingOpen) {
          isNominationOpen = false;
          nominationMessage = 'Nominations are now closed. Voting is open!';
        } else if (!nominationsEnabled) {
          isNominationOpen = false;
          nominationMessage = 'Nominations are currently closed';
        } else {
          isNominationOpen = true;
          nominationMessage = 'Nominations are open';
        }
        
        console.log('🗳️ Status logic:', {
          startDate,
          endDate,
          nominationsEnabled,
          now: now.toISOString(),
          start: start?.toISOString(),
          end: end?.toISOString(),
          isVotingOpen,
          isNominationOpen,
          votingMessage,
          nominationMessage
        });
        
        setStatus(prev => ({
          ...prev,
          startDate,
          endDate,
          isVotingOpen,
          isNominationOpen,
          votingMessage,
          nominationMessage,
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
          console.log('🗳️ Admin voting settings fetched:', adminResult);
          
          const startDate = adminResult.settings?.voting_start_date?.value || '';
          const endDate = adminResult.settings?.voting_end_date?.value || '';
          const nominationsEnabled = adminResult.settings?.nominations_enabled?.value === 'true';
          
          // Check if voting is open (current time >= start date and < end date if set)
          const now = new Date();
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          
          let isVotingOpen = false;
          let votingMessage = '';
          let isNominationOpen = nominationsEnabled;
          let nominationMessage = '';
          
          if (start) {
            if (now >= start) {
              if (end && now >= end) {
                isVotingOpen = false;
                votingMessage = 'Voting has ended';
              } else {
                isVotingOpen = true;
                votingMessage = 'Voting is now open!';
              }
            } else {
              isVotingOpen = false;
              votingMessage = `Voting opens on ${start.toLocaleDateString()}`;
            }
          } else {
            isVotingOpen = false;
            votingMessage = 'Voting date not set';
          }
          
          // Nomination logic: if voting is open, nominations should be closed
          if (isVotingOpen) {
            isNominationOpen = false;
            nominationMessage = 'Nominations are now closed. Voting is open!';
          } else if (!nominationsEnabled) {
            isNominationOpen = false;
            nominationMessage = 'Nominations are currently closed';
          } else {
            isNominationOpen = true;
            nominationMessage = 'Nominations are open';
          }
          
          console.log('🗳️ Admin status logic:', {
            startDate,
            endDate,
            nominationsEnabled,
            now: now.toISOString(),
            start: start?.toISOString(),
            end: end?.toISOString(),
            isVotingOpen,
            isNominationOpen,
            votingMessage,
            nominationMessage
          });
          
          setStatus(prev => ({
            ...prev,
            startDate,
            endDate,
            isVotingOpen,
            isNominationOpen,
            votingMessage,
            nominationMessage,
            loading: false,
            error: null
          }));
        } else {
          throw new Error('Both settings APIs failed');
        }
      } else {
        throw new Error('Failed to fetch voting status');
      }
    } catch (error) {
      console.error('❌ Error fetching voting status:', error);
      console.log('🗳️ Defaulting to safe state (nominations open, voting closed)');
      // Default to safe state for better UX
      setStatus(prev => ({
        ...prev,
        isVotingOpen: false,
        isNominationOpen: true,
        votingMessage: 'Unable to check voting status',
        nominationMessage: 'Nominations available',
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