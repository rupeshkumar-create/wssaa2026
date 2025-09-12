/**
 * Loops Transactional Email Service
 * Handles sending transactional emails via Loops API
 */

interface LoopsTransactionalPayload {
  transactionalId: string;
  email: string;
  dataVariables?: Record<string, any>;
}

interface VoteConfirmationData {
  voterFirstName: string;
  voterLastName: string;
  voterEmail: string;
  voterLinkedIn?: string;
  voterCompany?: string;
  voterJobTitle?: string;
  voterCountry?: string;
  nomineeDisplayName: string;
  nomineeUrl: string;
  categoryName: string;
  subcategoryName: string;
  voteTimestamp: string;
}

interface NominatorConfirmationData {
  nominatorFirstName: string;
  nominatorLastName: string;
  nominatorEmail: string;
  nominatorCompany?: string;
  nominatorJobTitle?: string;
  nomineeDisplayName: string;
  categoryName: string;
  subcategoryName: string;
  submissionTimestamp: string;
}

interface NomineeApprovalData {
  nomineeFirstName?: string;
  nomineeLastName?: string;
  nomineeEmail: string;
  nomineeDisplayName: string;
  categoryName: string;
  subcategoryName: string;
  approvalTimestamp: string;
  nomineePageUrl?: string;
}

interface NominatorApprovalData {
  nominatorFirstName: string;
  nominatorLastName: string;
  nominatorEmail: string;
  nominatorCompany?: string;
  nomineeDisplayName: string;
  nomineeUrl: string;
  categoryName: string;
  subcategoryName: string;
  approvalTimestamp: string;
}

interface NomineeDirectNominationData {
  nomineeFirstName?: string;
  nomineeLastName?: string;
  nomineeEmail: string;
  nomineeDisplayName: string;
  categoryName: string;
  subcategoryName: string;
  nominationTimestamp: string;
}

export class LoopsTransactionalService {
  private apiKey: string;
  private baseUrl = 'https://app.loops.so/api/v1';

  constructor() {
    this.apiKey = process.env.LOOPS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('LOOPS_API_KEY environment variable is not set');
    }
  }

  /**
   * Send a transactional email via Loops
   */
  async sendTransactionalEmail(payload: LoopsTransactionalPayload): Promise<{
    success: boolean;
    error?: string;
    messageId?: string;
  }> {
    try {
      if (!this.apiKey) {
        console.warn('⚠️ LOOPS_API_KEY not configured, skipping transactional email');
        return {
          success: false,
          error: 'LOOPS_API_KEY not configured'
        };
      }

      console.log('🔄 Sending Loops transactional email:', {
        transactionalId: payload.transactionalId,
        email: payload.email,
        hasDataVariables: !!payload.dataVariables,
        dataVariableKeys: payload.dataVariables ? Object.keys(payload.dataVariables) : []
      });

      const requestBody = {
        transactionalId: payload.transactionalId,
        email: payload.email,
        ...(payload.dataVariables && { dataVariables: payload.dataVariables })
      };

      console.log('📤 Request payload:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${this.baseUrl}/transactional`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('❌ Failed to parse response JSON:', parseError);
        responseData = { error: 'Invalid JSON response' };
      }

      console.log('📥 Response:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });

      if (!response.ok) {
        console.error('❌ Loops transactional email failed:', {
          status: response.status,
          statusText: response.statusText,
          error: responseData
        });
        
        return {
          success: false,
          error: responseData?.message || responseData?.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      console.log('✅ Loops transactional email sent successfully:', responseData);

      return {
        success: true,
        messageId: responseData?.id || responseData?.messageId || 'unknown'
      };

    } catch (error) {
      console.error('❌ Loops transactional email error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send vote confirmation email to voter
   */
  async sendVoteConfirmationEmail(data: VoteConfirmationData): Promise<{
    success: boolean;
    error?: string;
    messageId?: string;
  }> {
    const transactionalId = 'cmfb0nmgv7ewn0p0i063876oq'; // Your provided transactional ID

    const dataVariables = {
      // Voter Information
      voterFirstName: data.voterFirstName,
      voterLastName: data.voterLastName,
      voterFullName: `${data.voterFirstName} ${data.voterLastName}`,
      voterEmail: data.voterEmail,
      voterLinkedIn: data.voterLinkedIn || '',
      voterCompany: data.voterCompany || '',
      voterJobTitle: data.voterJobTitle || '',
      voterCountry: data.voterCountry || '',
      
      // Nominee Information
      nomineeDisplayName: data.nomineeDisplayName,
      nomineeUrl: data.nomineeUrl,
      
      // Category Information
      categoryName: data.categoryName,
      subcategoryName: data.subcategoryName,
      
      // Vote Timestamp Information
      voteTimestamp: data.voteTimestamp,
      voteDate: new Date(data.voteTimestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      voteTime: new Date(data.voteTimestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };

    return this.sendTransactionalEmail({
      transactionalId,
      email: data.voterEmail,
      dataVariables
    });
  }

  /**
   * Send nomination confirmation email to nominator
   */
  async sendNominatorConfirmationEmail(data: NominatorConfirmationData): Promise<{
    success: boolean;
    error?: string;
    messageId?: string;
  }> {
    const transactionalId = 'cmfb0luwy8etkxg0i7i5ls8kt'; // Nominator confirmation email ID

    const dataVariables = {
      // Nominator Information
      nominatorFirstName: data.nominatorFirstName,
      nominatorLastName: data.nominatorLastName,
      nominatorFullName: `${data.nominatorFirstName} ${data.nominatorLastName}`,
      nominatorEmail: data.nominatorEmail,
      nominatorCompany: data.nominatorCompany || '',
      nominatorJobTitle: data.nominatorJobTitle || '',
      
      // Nominee Information
      nomineeDisplayName: data.nomineeDisplayName,
      
      // Category Information
      categoryName: data.categoryName,
      subcategoryName: data.subcategoryName,
      
      // Submission Timestamp Information
      submissionTimestamp: data.submissionTimestamp,
      submissionDate: new Date(data.submissionTimestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      submissionTime: new Date(data.submissionTimestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };

    return this.sendTransactionalEmail({
      transactionalId,
      email: data.nominatorEmail,
      dataVariables
    });
  }

  /**
   * Send approval notification email to nominee
   */
  async sendNomineeApprovalEmail(data: NomineeApprovalData): Promise<{
    success: boolean;
    error?: string;
    messageId?: string;
  }> {
    const transactionalId = 'cmfb0wo5t86yszw0iin0plrpc'; // Nominee approval email ID

    const dataVariables = {
      // Nominee Information
      nomineeFirstName: data.nomineeFirstName || '',
      nomineeLastName: data.nomineeLastName || '',
      nomineeFullName: data.nomineeFirstName && data.nomineeLastName 
        ? `${data.nomineeFirstName} ${data.nomineeLastName}` 
        : data.nomineeDisplayName,
      nomineeEmail: data.nomineeEmail,
      nomineeDisplayName: data.nomineeDisplayName,
      nomineeUrl: data.nomineePageUrl || '',
      
      // Category Information
      categoryName: data.categoryName,
      subcategoryName: data.subcategoryName,
      
      // Approval Timestamp Information
      approvalTimestamp: data.approvalTimestamp,
      approvalDate: new Date(data.approvalTimestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      approvalTime: new Date(data.approvalTimestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };

    return this.sendTransactionalEmail({
      transactionalId,
      email: data.nomineeEmail,
      dataVariables
    });
  }

  /**
   * Send approval notification email to nominator
   */
  async sendNominatorApprovalEmail(data: NominatorApprovalData): Promise<{
    success: boolean;
    error?: string;
    messageId?: string;
  }> {
    const transactionalId = 'cmfb0xhia0qnaxj0ig98plajz'; // Nominator approval email ID

    const dataVariables = {
      // Nominator Information
      nominatorFirstName: data.nominatorFirstName,
      nominatorLastName: data.nominatorLastName,
      nominatorFullName: `${data.nominatorFirstName} ${data.nominatorLastName}`,
      nominatorEmail: data.nominatorEmail,
      nominatorCompany: data.nominatorCompany || '',
      
      // Nominee Information
      nomineeDisplayName: data.nomineeDisplayName,
      nomineeUrl: data.nomineeUrl,
      
      // Category Information
      categoryName: data.categoryName,
      subcategoryName: data.subcategoryName,
      
      // Approval Timestamp Information
      approvalTimestamp: data.approvalTimestamp,
      approvalDate: new Date(data.approvalTimestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      approvalTime: new Date(data.approvalTimestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };

    return this.sendTransactionalEmail({
      transactionalId,
      email: data.nominatorEmail,
      dataVariables
    });
  }

  /**
   * Send direct nomination notification email to nominee (when nominated by admin)
   */
  async sendNomineeDirectNominationEmail(data: NomineeDirectNominationData): Promise<{
    success: boolean;
    error?: string;
    messageId?: string;
  }> {
    const transactionalId = 'cmfb0wo5t86yszw0iin0plrpc'; // Using the same nominee approval email ID

    const dataVariables = {
      // Nominee Information
      nomineeFirstName: data.nomineeFirstName || '',
      nomineeLastName: data.nomineeLastName || '',
      nomineeFullName: data.nomineeFirstName && data.nomineeLastName 
        ? `${data.nomineeFirstName} ${data.nomineeLastName}` 
        : data.nomineeDisplayName,
      nomineeEmail: data.nomineeEmail,
      nomineeDisplayName: data.nomineeDisplayName,
      
      // Category Information
      categoryName: data.categoryName,
      subcategoryName: data.subcategoryName,
      
      // Nomination Timestamp Information
      nominationTimestamp: data.nominationTimestamp,
      nominationDate: new Date(data.nominationTimestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      nominationTime: new Date(data.nominationTimestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };

    return this.sendTransactionalEmail({
      transactionalId,
      email: data.nomineeEmail,
      dataVariables
    });
  }
}

// Export singleton instance
export const loopsTransactional = new LoopsTransactionalService();