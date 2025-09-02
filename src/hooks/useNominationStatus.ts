"use client";

import { useState, useEffect, useCallback } from 'react';

interface NominationStatus {
  enabled: boolean;
  closeMessage: string;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useNominationStatus(): NominationStatus {
  const [status, setStatus] = useState<NominationStatus>({
    enabled: false, // Default to disabled for safety
    closeMessage: 'Thank you for your interest! Nominations are now closed.',
    loading: true,
    error: null,
    refresh: () => {}
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
        console.log('🔄 Nomination status fetched:', result);
        
        setStatus(prev => ({
          ...prev,
          enabled: result.nominations_enabled === true,
          closeMessage: result.nominations_close_message || 'Thank you for your interest! Nominations are now closed.',
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
          console.log('🔄 Admin settings fetched:', adminResult);
          
          const enabled = adminResult.settings?.nominations_enabled?.value === 'true';
          const closeMessage = adminResult.settings?.nominations_close_message?.value || 'Thank you for your interest! Nominations are now closed.';
          
          setStatus(prev => ({
            ...prev,
            enabled,
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
      console.error('Error fetching nomination status:', error);
      // Default to enabled for now so you can test the toggle
      setStatus(prev => ({
        ...prev,
        enabled: true, // Default to enabled for testing
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