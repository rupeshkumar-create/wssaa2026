# Loops Email Templates - World Staffing Awards Vote Confirmation

## 📧 Complete Email Templates with All Data Variables

### Template 1: Vote Confirmation with Summit Pass (Recommended)

#### Subject Line Options:
- `🎉 Thank you for voting, {{voterFirstName}}! Here's your World Staffing Summit pass`
- `Vote confirmed for {{nomineeDisplayName}} + Your Summit Pass Inside!`
- `{{voterFirstName}}, your vote is in! Plus exclusive Summit access 🎟️`

#### HTML Email Template:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vote Confirmation - World Staffing Awards</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .nominee-card { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .summit-pass { background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); color: #2d3436; padding: 25px; margin: 25px 0; border-radius: 12px; text-align: center; border: 2px dashed #fdcb6e; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 5px; }
        .vote-details { background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #2d3436; color: #b2bec3; padding: 20px; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🏆 Thank You for Voting!</h1>
            <p>World Staffing Awards 2025</p>
        </div>

        <!-- Main Content -->
        <div class="content">
            <h2>Hi {{voterFirstName}},</h2>
            
            <p>Thank you for participating in the World Staffing Awards! Your vote has been successfully recorded and is helping us recognize excellence in the staffing industry.</p>

            <!-- Nominee Card -->
            <div class="nominee-card">
                <h3>🎯 Your Vote Details</h3>
                <p><strong>You voted for:</strong> {{nomineeDisplayName}}</p>
                <p><strong>Category:</strong> {{categoryName}}</p>
                <p><strong>Vote cast on:</strong> {{voteDate}} at {{voteTime}}</p>
                
                <a href="{{nomineeUrl}}" class="button">
                    👤 View {{nomineeDisplayName}}'s Profile
                </a>
            </div>

            <!-- Summit Pass Section -->
            <div class="summit-pass">
                <h2>🎟️ Your World Staffing Summit Pass</h2>
                <p><strong>Congratulations {{voterFullName}}!</strong></p>
                <p>As a thank you for voting, you've earned exclusive access to the World Staffing Summit - the premier event for staffing professionals worldwide.</p>
                
                <div style="margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.3); border-radius: 8px;">
                    <p><strong>🎫 Pass Holder:</strong> {{voterFullName}}</p>
                    <p><strong>🏢 Company:</strong> {{voterCompany}}</p>
                    <p><strong>💼 Title:</strong> {{voterJobTitle}}</p>
                    <p><strong>🌍 Location:</strong> {{voterCountry}}</p>
                </div>

                <a href="#summit-registration" class="button" style="background: #00b894; font-size: 18px;">
                    🚀 Claim Your Summit Pass
                </a>
                
                <p style="font-size: 14px; margin-top: 15px;">
                    <em>This pass grants you access to exclusive networking sessions, industry insights, and recognition ceremonies.</em>
                </p>
            </div>

            <!-- Vote Summary -->
            <div class="vote-details">
                <h3>📊 Vote Summary</h3>
                <ul>
                    <li><strong>Voter:</strong> {{voterFullName}} ({{voterEmail}})</li>
                    <li><strong>LinkedIn:</strong> <a href="{{voterLinkedIn}}">{{voterLinkedIn}}</a></li>
                    <li><strong>Nominee:</strong> {{nomineeDisplayName}}</li>
                    <li><strong>Category:</strong> {{subcategoryName}}</li>
                    <li><strong>Timestamp:</strong> {{voteTimestamp}}</li>
                </ul>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
                <h3>🌟 What's Next?</h3>
                <p>Share your vote and help spread the word about excellence in staffing!</p>
                
                <a href="{{nomineeUrl}}" class="button">
                    📱 Share {{nomineeDisplayName}}'s Profile
                </a>
                
                <a href="#awards-ceremony" class="button" style="background: #fd79a8;">
                    🏆 Awards Ceremony Info
                </a>
            </div>

            <p>Your participation helps celebrate and recognize the outstanding professionals who are shaping the future of our industry.</p>
            
            <p>Thank you for being part of the World Staffing Awards community!</p>
            
            <p>Best regards,<br>
            <strong>The World Staffing Awards Team</strong></p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>© 2025 World Staffing Awards. All rights reserved.</p>
            <p>Vote cast on {{voteDate}} at {{voteTime}}</p>
            <p>
                <a href="#unsubscribe" style="color: #74b9ff;">Unsubscribe</a> | 
                <a href="#contact" style="color: #74b9ff;">Contact Us</a> | 
                <a href="#privacy" style="color: #74b9ff;">Privacy Policy</a>
            </p>
        </div>
    </div>
</body>
</html>
```

### Template 2: Simple & Clean Version

#### Subject Line:
`Thank you for voting for {{nomineeDisplayName}}, {{voterFirstName}}!`

#### HTML Email Template:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vote Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .nominee-info { background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .summit-badge { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 10px; text-align: center; margin: 25px 0; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 Vote Confirmed!</h1>
            <p>World Staffing Awards 2025</p>
        </div>

        <p>Hi {{voterFirstName}},</p>
        
        <p>Thank you for voting in the World Staffing Awards! Your vote has been successfully recorded.</p>

        <div class="nominee-info">
            <h3>Your Vote:</h3>
            <p><strong>Nominee:</strong> {{nomineeDisplayName}}</p>
            <p><strong>Category:</strong> {{categoryName}}</p>
            <p><strong>Date:</strong> {{voteDate}} at {{voteTime}}</p>
            
            <a href="{{nomineeUrl}}" class="button">View Nominee Profile</a>
        </div>

        <div class="summit-badge">
            <h2>🎟️ World Staffing Summit Pass</h2>
            <p><strong>{{voterFullName}}</strong>, you've earned exclusive access to our summit!</p>
            <p>Company: {{voterCompany}} | Role: {{voterJobTitle}}</p>
            <a href="#claim-pass" class="button" style="background: #28a745;">Claim Your Pass</a>
        </div>

        <p>Your participation helps recognize excellence in the staffing industry. Thank you for being part of our community!</p>

        <div class="footer">
            <p>Best regards,<br>The World Staffing Awards Team</p>
            <p>Vote ID: {{voteTimestamp}} | Voter: {{voterEmail}}</p>
        </div>
    </div>
</body>
</html>
```

### Template 3: Text-Only Version (Fallback)

```text
🏆 WORLD STAFFING AWARDS - VOTE CONFIRMATION

Hi {{voterFirstName}},

Thank you for voting in the World Staffing Awards 2025!

YOUR VOTE DETAILS:
✓ Nominee: {{nomineeDisplayName}}
✓ Category: {{categoryName}}  
✓ Date: {{voteDate}} at {{voteTime}}
✓ Voter: {{voterFullName}} ({{voterEmail}})

🎟️ WORLD STAFFING SUMMIT PASS
Congratulations! You've earned exclusive access to the World Staffing Summit.

Pass Details:
- Name: {{voterFullName}}
- Company: {{voterCompany}}
- Title: {{voterJobTitle}}
- Location: {{voterCountry}}

View nominee profile: {{nomineeUrl}}

Thank you for recognizing excellence in staffing!

Best regards,
The World Staffing Awards Team

---
Vote cast: {{voteTimestamp}}
LinkedIn: {{voterLinkedIn}}
```

## 📋 Complete Data Variables Reference

### Voter Information
```javascript
{
  "voterFirstName": "John",           // First name of voter
  "voterLastName": "Doe",             // Last name of voter  
  "voterFullName": "John Doe",        // Full name (first + last)
  "voterEmail": "john@example.com",   // Voter's email address
  "voterLinkedIn": "https://linkedin.com/in/johndoe", // LinkedIn profile
  "voterCompany": "Acme Corp",        // Voter's company
  "voterJobTitle": "CEO",             // Voter's job title
  "voterCountry": "United States"     // Voter's country
}
```

### Nominee Information
```javascript
{
  "nomineeDisplayName": "Jane Smith",  // Name of person/company voted for
  "nomineeUrl": "https://worldstaffingawards.com/nominee/jane-smith" // Direct link to nominee profile
}
```

### Category Information
```javascript
{
  "categoryName": "Top Recruiter",     // Award category name
  "subcategoryName": "Top Recruiter"  // Specific subcategory name
}
```

### Vote Timestamp Information
```javascript
{
  "voteTimestamp": "2025-01-09T10:30:00.000Z", // ISO timestamp
  "voteDate": "January 9, 2025",               // Formatted date
  "voteTime": "10:30 AM EST"                   // Formatted time with timezone
}
```

## 🎨 Customization Options

### Color Schemes
- **Primary**: `#667eea` (Purple-blue gradient)
- **Secondary**: `#ffeaa7` (Golden yellow for summit pass)
- **Success**: `#00b894` (Green for buttons)
- **Warning**: `#ffc107` (Yellow for badges)

### Font Recommendations
- **Headers**: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- **Body**: `Arial, sans-serif`
- **Buttons**: `font-weight: bold`

### Mobile Responsive
All templates include:
- `max-width: 600px` for email clients
- `viewport` meta tag for mobile
- Responsive button sizing
- Readable font sizes on mobile

## 🚀 Implementation Steps

1. **Copy Template**: Choose your preferred template above
2. **Customize Colors**: Update the CSS colors to match your brand
3. **Add Links**: Replace placeholder links with actual URLs
4. **Test Variables**: Use Loops preview with sample data
5. **Test Delivery**: Send test emails to verify rendering
6. **Go Live**: Activate the template in your Loops dashboard

## 📊 Template Performance Tips

- **Subject Line**: Keep under 50 characters for mobile
- **Preview Text**: First 90 characters are crucial
- **CTA Buttons**: Use action words like "View", "Claim", "Access"
- **Images**: Keep file sizes small, use alt text
- **Links**: Ensure all links work and track properly

---

**Ready to use!** These templates include all available data variables and are optimized for the World Staffing Summit pass concept you requested.