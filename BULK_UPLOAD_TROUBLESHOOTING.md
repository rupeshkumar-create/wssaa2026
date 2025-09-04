# Bulk Upload Troubleshooting Guide

## 🔧 Common Issues and Solutions

### Issue 1: Invalid Category Errors
**Error**: `Invalid person category. Must be one of: top-recruiter, top-executive-leader...`

**Solution**: Use only these exact category values for person nominations:
- `top-recruiter`
- `top-executive-leader`
- `top-recruiting-leader-usa`
- `top-recruiter-usa`
- `top-recruiting-leader-europe`
- `top-recruiter-europe`
- `top-global-recruiter`
- `top-global-staffing-leader`
- `top-staffing-influencer`
- `top-thought-leader`
- `top-staffing-educator`
- `rising-star-under-30`

### Issue 2: Invalid Email Format (Nominator)
**Error**: `Invalid nominator email format`

**Solution**: 
- ✅ **FIXED**: Nominator email is now optional - you can leave it empty
- If you provide an email, use valid format: `user@domain.com`
- Empty values are now allowed

### Issue 3: Invalid URL Format
**Error**: `Invalid headshot URL format` or `Invalid LinkedIn URL format`

**Solution**: 
- ✅ **FIXED**: URLs are now optional - you can leave them empty
- If you provide URLs, include `http://` or `https://`
- Empty values are now allowed

## 🚀 Quick Fix Applied

I've just fixed the validation logic! The system now:
- ✅ Allows empty nominator emails
- ✅ Allows empty URLs (headshot, LinkedIn, website, logo)
- ✅ Only validates when fields have actual content
- ✅ Supports all valid categories

## 📋 Updated CSV Template

Use the new fixed template: `templates/person_nominations_fixed.csv`

Key changes:
- Empty `headshot_url` fields (no validation errors)
- Valid categories only
- Optional nominator fields
- Last row shows minimal required fields

## 🔍 Validation Rules (Updated)

### Required Fields (Person):
- `first_name` - Person's first name
- `last_name` - Person's last name
- `job_title` - Current job title
- `email` - Valid email format
- `country` - Country name
- `why_vote_for_me` - Reason to vote (max 1000 chars)
- `category` - Must be from valid list above

### Optional Fields:
- `company_name` - Current company
- `phone` - Phone number
- `linkedin` - LinkedIn URL (if provided, must be valid)
- `bio` - Biography (max 2000 chars)
- `achievements` - Key achievements (max 2000 chars)
- `headshot_url` - Image URL (if provided, must be valid)
- `nominator_*` - All nominator fields are optional

## 🎯 Test Your Upload

1. **Download**: Use `templates/person_nominations_fixed.csv`
2. **Modify**: Add your data following the examples
3. **Upload**: Try the upload again
4. **Verify**: Check for any remaining validation errors

## 📞 Still Having Issues?

If you're still getting errors:

1. **Check Categories**: Ensure exact spelling from the list above
2. **Email Format**: Use `user@domain.com` format if providing emails
3. **URL Format**: Include `http://` or `https://` if providing URLs
4. **Empty Fields**: Leave optional fields completely empty if not needed

## 🔧 Manual Fix Commands

If needed, you can run these commands:

```bash
# Apply the validation fix
node scripts/fix-validation-logic.js

# Test the system
node scripts/test-separated-system.js
```

The validation logic has been updated to be more flexible with optional fields while maintaining data quality for required fields!