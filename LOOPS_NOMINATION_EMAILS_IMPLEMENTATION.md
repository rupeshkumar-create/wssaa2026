# Loops Nomination Transactional Emails Implementation

## Overview

This implementation adds comprehensive Loops transactional email support for the nomination workflow. Three new email types have been implemented:

1. **Nominator Confirmation Email** - Sent when someone submits a nomination
2. **Nominee Approval Email** - Sent to the nominee when their profile goes live
3. **Nominator Approval Email** - Sent to the nominator when their nominee's profile goes live

## Email Templates & IDs

| Email Type | Transactional ID | Trigger | Recipient |
|------------|------------------|---------|-----------|
| Nominator Confirmation | `cmfb0luwy8etkxg0i7i5ls8kt` | Nomination submission | Nominator |
| Nominee Approval | `cmfb0wo5t86yszw0iin0plrpc` | Admin approves nomination | Nominee |
| Nominator Approval | `cmfb0xhia0qnaxj0ig98plajz` | Admin approves nomination | Nominator |

## Implementation Details

### 1. Enhanced Transactional Service

**File:** `src/server/loops/transactional.ts`

Added new interfaces and methods:
- `NominatorConfirmationData` interface
- `NomineeApprovalData` interface  
- `NominatorApprovalData` interface
- `sendNominatorConfirmationEmail()` method
- `sendNomineeApprovalEmail()` method
- `sendNominatorApprovalEmail()` method

### 2. Nomination Submission Integration

**File:** `src/app/api/nomination/submit/route.ts`

- Added nominator confirmation email sending after successful nomination submission
- Includes category information and nominee details
- Non-blocking email sending (won't fail nomination if email fails)
- Returns email status in API response

### 3. Nomination Approval Integration

**File:** `src/app/api/nomination/approve/route.ts`

- Added nominee approval email (if nominee has email address)
- Added nominator approval email with live URL
- Only sends emails for approved nominations
- Includes live URL and category information
- Non-blocking email sending
- Returns email status in API response

## Email Data Variables

### Nominator Confirmation Email
```typescript
{
  nominatorFirstName: string;
  nominatorLastName: string;
  nominatorFullName: string;
  nominatorEmail: string;
  nominatorCompany?: string;
  nominatorJobTitle?: string;
  nomineeDisplayName: string;
  categoryName: string;
  subcategoryName: string;
  submissionTimestamp: string;
  submissionDate: string;
  submissionTime: string;
}
```

### Nominee Approval Email
```typescript
{
  nomineeFirstName?: string;
  nomineeLastName?: string;
  nomineeFullName: string;
  nomineeEmail: string;
  nomineeDisplayName: string;
  nomineeUrl: string;
  categoryName: string;
  subcategoryName: string;
  approvalTimestamp: string;
  approvalDate: string;
  approvalTime: string;
}
```

### Nominator Approval Email
```typescript
{
  nominatorFirstName: string;
  nominatorLastName: string;
  nominatorFullName: string;
  nominatorEmail: string;
  nominatorCompany?: string;
  nomineeDisplayName: string;
  nomineeUrl: string;
  categoryName: string;
  subcategoryName: string;
  approvalTimestamp: string;
  approvalDate: string;
  approvalTime: string;
}
```

## Testing

### Test API Endpoint
**Endpoint:** `/api/test/loops-nomination-emails`

**GET Parameters:**
- `type`: Email type to test (`nominator`, `nominee`, `nominator-approval`, `all`)
- `email`: Test email address (default: `test@example.com`)

**POST Body:**
```json
{
  "emailType": "nominator-confirmation|nominee-approval|nominator-approval",
  "emailData": { /* email data object */ }
}
```

### Test Scripts

1. **Email Testing Script**
   ```bash
   node scripts/test-loops-nomination-emails.js
   ```
   Tests all three email types with sample data.

2. **Complete Flow Testing Script**
   ```bash
   node scripts/test-complete-nomination-flow-with-emails.js
   ```
   Tests the entire nomination flow including email sending.

## Configuration

### Environment Variables Required
```env
LOOPS_API_KEY=your_loops_api_key
LOOPS_SYNC_ENABLED=true
```

### Loops API Endpoint
```
POST https://app.loops.so/api/v1/transactional
```

## Error Handling

- All email sending is non-blocking - nomination/approval will succeed even if emails fail
- Comprehensive error logging for debugging
- Email status included in API responses
- Graceful fallback if Loops API is unavailable

## Email Flow Diagram

```
1. User submits nomination
   ↓
2. Nomination saved to database
   ↓
3. Nominator confirmation email sent ✉️
   ↓
4. Admin reviews nomination
   ↓
5. Admin approves nomination
   ↓
6. Nomination status updated + Live URL generated
   ↓
7. Nominee approval email sent ✉️
   ↓
8. Nominator approval email sent ✉️
```

## API Response Examples

### Nomination Submission Response
```json
{
  "nominationId": "123",
  "nominatorId": "456",
  "nomineeId": "789",
  "state": "submitted",
  "emails": {
    "nominatorConfirmationSent": true
  }
}
```

### Nomination Approval Response
```json
{
  "success": true,
  "nominationId": "123",
  "action": "approve",
  "liveUrl": "http://localhost:3000/nominee/jane-smith",
  "emails": {
    "nomineeApprovalSent": true,
    "nominatorApprovalSent": true
  }
}
```

## Monitoring & Debugging

- Check server logs for email sending status
- Use test endpoints to verify email functionality
- Monitor Loops dashboard for email delivery status
- Email failures are logged but don't block the nomination process

## Next Steps

1. Set up email templates in Loops dashboard with the provided transactional IDs
2. Configure environment variables
3. Test with the provided test scripts
4. Monitor email delivery in production

## Notes

- All timestamps are formatted for both machine processing and human readability
- Email addresses are validated before sending
- Company nominees use company email if available
- Live URLs are automatically generated during approval process
- All email data includes category and subcategory information for context