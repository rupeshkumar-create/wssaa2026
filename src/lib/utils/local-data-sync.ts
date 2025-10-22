/**
 * Local data synchronization utilities for updating the local JSON file
 * when changes are made through the admin panel
 */

interface LocalNomination {
  id: string;
  category: string;
  type: 'person' | 'company';
  nominee: {
    name: string;
    title?: string;
    country?: string;
    linkedin?: string;
    imageUrl?: string;
  };
  company?: {
    name: string;
    website?: string;
    country?: string;
  };
  nominator: {
    name: string;
    email: string;
    company?: string;
    linkedin?: string;
  };
  whyNominated?: string;
  whyVoteForMe?: string;
  liveUrl?: string;
  status: 'submitted' | 'approved' | 'rejected';
  uniqueKey: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Update local nominations data file with changes from admin panel
 */
export async function updateLocalNominationData(nominationId: string, updates: any): Promise<boolean> {
  try {
    // This would normally update the database, but since we're using local files,
    // we need to update the JSON file directly
    const response = await fetch('/api/admin/update-local-nomination', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nominationId,
        updates
      })
    });

    if (response.ok) {
      // Trigger data refresh across all components
      const { triggerAdminDataRefresh } = await import('./data-sync');
      triggerAdminDataRefresh();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to update local nomination data:', error);
    return false;
  }
}

/**
 * Sync changes to all data sources
 */
export async function syncNominationChanges(nominationId: string, changes: {
  linkedin?: string;
  whyMe?: string;
  whyUs?: string;
  headshotUrl?: string;
  logoUrl?: string;
  liveUrl?: string;
  adminNotes?: string;
  rejectionReason?: string;
}): Promise<boolean> {
  try {
    // Update the local JSON file
    const success = await updateLocalNominationData(nominationId, changes);
    
    if (success) {
      // Force refresh of all cached data
      await Promise.all([
        // Refresh nominations list
        fetch('/api/admin/nominations-improved', { 
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' }
        }),
        // Refresh nominees API
        fetch('/api/nominees', { 
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' }
        })
      ]);

      // Trigger UI refresh
      const { triggerAdminDataRefresh } = await import('./data-sync');
      triggerAdminDataRefresh();
      
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to sync nomination changes:', error);
    return false;
  }
}