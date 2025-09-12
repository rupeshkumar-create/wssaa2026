# Loops Vote Confirmation Email Template

## Overview
This document outlines the transactional email template for vote confirmations in the World Staffing Awards application.

## Transactional Email ID
- **ID**: `cmfb0nmgv7ewn0p0i063876oq`
- **Purpose**: Send confirmation email to voters after they cast their vote
- **Trigger**: Automatically sent when someone votes for a nominee

## API Endpoint
- **URL**: `https://app.loops.so/api/v1/transactional`
- **Method**: POST
- **Authentication**: Bearer token (LOOPS_API_KEY)

## Payload Structure
```json
{
  "transactionalId": "cmfb0nmgv7ewn0p0i063876oq",
  "email": "voter@example.com",
  "dataVariables": {
    "voterFirstName": "John",
    "voterLastName": "Doe",
    "voterFullName": "John Doe",
    "nomineeDisplayName": "Jane Smith",
    "nomineeUrl": "https://worldstaffingawards.com/nominee/jane-smith",
    "categoryName": "Top Recruiter",
    "subcategoryName": "Top Recruiter",
    "voteTimestamp": "2025-01-09T10:30:00.000Z",
    "voteDate": "January 9, 2025",
    "voteTime": "10:30 AM EST"
  }
}
```

## Available Data Variables

### Voter Information
- `voterFirstName` - Voter's first name
- `voterLastName` - Voter's last name  
- `voterFullName` - Full name (first + last)

### Nominee Information
- `nomineeDisplayName` - Name of the person/company voted for
- `nomineeUrl` - Direct link to the nominee's profile page

### Category Information
- `categoryName` - The award category name
- `subcategoryName` - The specific subcategory name

### Vote Details
- `voteTimestamp` - ISO timestamp when vote was cast
- `voteDate` - Formatted date (e.g., "January 9, 2025")
- `voteTime` - Formatted time with timezone (e.g., "10:30 AM EST")

## Email Template Suggestions

### Subject Line Options
- "Thank you for voting in the World Staffing Awards!"
- "Your vote for {{nomineeDisplayName}} has been confirmed"
- "Vote confirmed: {{categoryName}}"

### Email Body Template
```html
<h1>Thank you for your vote!</h1>

<p>Hi {{voterFirstName}},</p>

<p>Thank you for participating in the World Staffing Awards! Your vote has been successfully recorded.</p>

<div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3>Vote Details:</h3>
  <ul>
    <li><strong>Category:</strong> {{categoryName}}</li>
    <li><strong>Your Vote:</strong> {{nomineeDisplayName}}</li>
    <li><strong>Date:</strong> {{voteDate}} at {{voteTime}}</li>
  </ul>
</div>

<p>
  <a href="{{nomineeUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
    View {{nomineeDisplayName}}'s Profile
  </a>
</p>

<p>Your vote helps recognize excellence in the staffing industry. Thank you for being part of this important recognition program!</p>

<p>Best regards,<br>
The World Staffing Awards Team</p>

<hr>
<p style="font-size: 12px; color: #666;">
  This email was sent because you voted in the World Staffing Awards. 
  If you have any questions, please contact us at support@worldstaffingawards.com
</p>
```

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Loops API Configuration
LOOPS_API_KEY=your_loops_api_key_here
LOOPS_TRANSACTIONAL_ENABLED=true

# Optional: Disable transactional emails by setting to false
# LOOPS_TRANSACTIONAL_ENABLED=false
```

## Testing the Integration

1. **Test Payload**: Use the example payload above with a test email
2. **Preview**: Use Loops dashboard to preview the email template
3. **Test Vote**: Cast a test vote in your application to trigger the email

## Implementation Notes

- The email is sent asynchronously and won't block the voting process if it fails
- All email sending errors are logged but don't affect the vote recording
- The nominee URL is automatically generated if not already set in the database
- Timestamps are formatted for better readability in emails

## Loops Dashboard Setup

1. Go to your Loops dashboard
2. Navigate to Transactional Emails
3. Find the email with ID `cmfb0nmgv7ewn0p0i063876oq`
4. Use the data variables listed above in your email template
5. Test the template with sample data before going live

## Error Handling

The system handles these scenarios gracefully:
- Missing LOOPS_API_KEY (emails disabled)
- Loops API errors (logged, vote still recorded)
- Missing nominee URL (auto-generated)
- Invalid email addresses (logged error)
- Network timeouts (non-blocking)