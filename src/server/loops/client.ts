import { v4 as uuidv4 } from 'uuid';

/**
 * Loops API client for World Staffing Awards 2026
 * Handles contact management, tagging, and list management in Loops
 */
export class LoopsClient {
  private readonly baseUrl = 'https://app.loops.so/api/v1';
  private readonly apiKey: string;
  private readonly maxRetries = 3;

  // Public List IDs for World Staffing Awards 2026
  public readonly LIST_IDS = {
    VOTERS: 'cmegxu1fc0gw70i1d7g35gqb0',
    NOMINEES: 'cmegxubbj0jr60h33ahctgicr',
    NOMINATORS: 'cmegxuqag0jth0h334yy17csd',
    NOMINATOR_LIVE: 'cmf5a92vx13r10i1mgbyr8wgv',
  } as const;

  constructor() {
    this.apiKey = process.env.LOOPS_API_KEY!;
    if (!this.apiKey) {
      throw new Error('LOOPS_API_KEY environment variable is required');
    }
  }

  /**
   * Safe fetch wrapper with authentication and retries
   */
  async loopsFetch(
    path: string,
    options: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<any> {
    const { method = 'GET', body, headers = {} } = options;
    
    const url = `${this.baseUrl}${path}`;
    const requestId = uuidv4().slice(0, 8);
    
    // Build headers
    const requestHeaders: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(body);
    }

    // Log request (without sensitive data)
    console.log(`[${requestId}] Loops ${method} ${path}`, {
      hasBody: !!body,
    });

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        
        // Log response status
        console.log(`[${requestId}] Response: ${response.status} ${response.statusText}`);

        if (response.ok) {
          const data = response.status === 204 ? null : await response.json();
          return data;
        }

        // Handle different error types
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          // Rate limited - use exponential backoff
          const delay = this.calculateBackoffDelay(attempt);
          console.warn(`[${requestId}] Rate limited, retrying in ${delay}ms (attempt ${attempt}/${this.maxRetries})`);
          await this.sleep(delay);
          continue;
        }

        if (response.status >= 500) {
          // Server error - retry with backoff
          const delay = this.calculateBackoffDelay(attempt);
          console.warn(`[${requestId}] Server error ${response.status}, retrying in ${delay}ms (attempt ${attempt}/${this.maxRetries})`);
          await this.sleep(delay);
          continue;
        }

        // Client error - don't retry
        const error = new LoopsError(
          `Loops API error: ${response.status} ${response.statusText}`,
          response.status,
          errorData
        );
        
        console.error(`[${requestId}] Client error:`, {
          status: response.status,
          message: error.message,
          data: errorData,
        });
        
        throw error;

      } catch (error) {
        lastError = error as Error;
        
        if (error instanceof LoopsError) {
          throw error; // Don't retry client errors
        }

        // Network error - retry with backoff
        if (attempt < this.maxRetries) {
          const delay = this.calculateBackoffDelay(attempt);
          console.warn(`[${requestId}] Network error, retrying in ${delay}ms (attempt ${attempt}/${this.maxRetries}):`, error);
          await this.sleep(delay);
          continue;
        }
      }
    }

    // All retries exhausted
    console.error(`[${requestId}] All retries exhausted`);
    throw new LoopsError(
      `Loops request failed after ${this.maxRetries} attempts: ${lastError?.message}`,
      0,
      null
    );
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private calculateBackoffDelay(attempt: number): number {
    const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Cap at 10s
    const jitter = Math.random() * 0.1 * baseDelay; // Add 10% jitter
    return Math.floor(baseDelay + jitter);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Add contact to a specific list
   * Using the contact update endpoint with list subscription
   */
  async addToList(email: string, listId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const requestId = uuidv4().slice(0, 8);
      console.log(`[${requestId}] Adding contact to list: ${email} → ${listId}`);

      // First, ensure the contact exists
      try {
        await this.loopsFetch('/contacts/create', {
          method: 'POST',
          body: {
            email: email.toLowerCase(),
            subscribed: true,
          },
        });
      } catch (createError) {
        // Contact might already exist, that's okay
        if (createError instanceof LoopsError && createError.status !== 409) {
          throw createError;
        }
      }

      // Add to list using the contact update endpoint
      await this.loopsFetch('/contacts/update', {
        method: 'PUT',
        body: {
          email: email.toLowerCase(),
          [`list_${listId}`]: true, // Subscribe to specific list
        },
      });

      console.log(`[${requestId}] ✅ Successfully added contact to list: ${email} → ${listId}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to add contact to list ${listId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Remove contact from a specific list
   */
  async removeFromList(email: string, listId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const requestId = uuidv4().slice(0, 8);
      console.log(`[${requestId}] Removing contact from list: ${email} → ${listId}`);

      // Remove from list using the contact update endpoint
      await this.loopsFetch('/contacts/update', {
        method: 'PUT',
        body: {
          email: email.toLowerCase(),
          [`list_${listId}`]: false, // Unsubscribe from specific list
        },
      });

      console.log(`[${requestId}] ✅ Successfully removed contact from list: ${email} → ${listId}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to remove contact from list ${listId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all lists for the account
   */
  async getLists(): Promise<{
    success: boolean;
    lists?: Array<{ id: string; name: string; isPublic: boolean }>;
    error?: string;
  }> {
    try {
      const requestId = uuidv4().slice(0, 8);
      console.log(`[${requestId}] Fetching all lists`);

      const response = await this.loopsFetch('/lists');
      
      console.log(`[${requestId}] ✅ Successfully fetched ${response.length || 0} lists`);
      return { 
        success: true, 
        lists: response || [] 
      };
    } catch (error) {
      console.error(`❌ Failed to fetch lists:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Batch add multiple contacts to a list
   */
  async batchAddToList(emails: string[], listId: string): Promise<{
    success: boolean;
    results: Array<{ email: string; success: boolean; error?: string }>;
    totalAdded: number;
  }> {
    const results: Array<{ email: string; success: boolean; error?: string }> = [];
    let totalAdded = 0;

    console.log(`🔄 Batch adding ${emails.length} contacts to list ${listId}`);

    // Process in smaller batches to avoid rate limits
    const batchSize = 3;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (email) => {
        const result = await this.addToList(email, listId);
        return { email, ...result };
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
          if (result.value.success) totalAdded++;
        } else {
          results.push({ 
            email: 'unknown', 
            success: false, 
            error: result.reason?.message || 'Unknown error' 
          });
        }
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`✅ Batch add to list completed: ${totalAdded}/${emails.length} contacts added successfully`);

    return {
      success: totalAdded > 0,
      results,
      totalAdded,
    };
  }

  /**
   * Check if Loops sync is enabled
   */
  static isEnabled(): boolean {
    return process.env.LOOPS_SYNC_ENABLED === 'true' && !!process.env.LOOPS_API_KEY;
  }
}

/**
 * Custom error class for Loops API errors
 */
export class LoopsError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: any
  ) {
    super(message);
    this.name = 'LoopsError';
  }
}

// Export singleton instance
export const loopsClient = new LoopsClient();