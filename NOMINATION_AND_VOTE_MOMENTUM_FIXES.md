# Nomination Form and Vote Momentum Fixes

## Issues Fixed

### 1. Nomination Form Validation Error
**Problem**: Users were getting "Invalid nomination data" error when submitting nominations.

**Root Cause**: The Zod validation schema was too strict and required many fields that the form doesn't actually collect.

**Solution**: Updated the Zod schema in `src/lib/zod/nomination.ts` to match the actual form fields:
- Made most nominator fields optional (linkedin, company, jobTitle, phone, country)
- Made most nominee fields optional except the core required ones
- Simplified validation to match what the form actually collects

**Files Changed**:
- `src/lib/zod/nomination.ts` - Updated NominatorSchema, PersonNomineeSchema, and CompanyNomineeSchema

### 2. Vote Momentum Showing +0
**Problem**: The Vote Momentum section on nominee pages was always showing "+0 this week" even when there should be votes.

**Root Cause**: The stats API had incorrect database column references:
- Using `status = 'approved'` instead of `state = 'approved'`
- Using `nominee_id` instead of `nomination_id` for votes table
- Using `category` instead of `subcategory_id` for category filtering

**Solution**: Fixed the database queries in `src/app/api/nominees/[id]/stats/route.ts`:
- Changed `status` to `state` for nomination filtering
- Changed `nominee_id` to `nomination_id` for votes queries
- Changed `category` to `subcategory_id` for category ranking

**Files Changed**:
- `src/app/api/nominees/[id]/stats/route.ts` - Fixed database column references

## How Vote Momentum Works

The Vote Momentum feature calculates votes received in the last 7 days (including today) by:

1. Fetching all votes for a nomination from the `votes` table
2. Filtering votes where `created_at > (current_date - 7 days)`
3. Counting the filtered votes
4. Displaying as "+X this week" in the Vote Momentum section

## Testing Results

After the fixes:
- ✅ Nomination form validation now works correctly
- ✅ Vote Momentum API returns accurate data
- ✅ Vote Momentum displays real-time weekly vote counts
- ✅ Stats API correctly calculates category rankings and trending status

## Example API Response

```json
{
  "totalVotes": 258,
  "realVotes": 7,
  "additionalVotes": 251,
  "recentVotes": 7,
  "categoryRank": 1,
  "totalInCategory": 8,
  "daysSinceCreated": 7,
  "trendingPercentile": "Top 10%",
  "voteMomentum": 7,
  "supporters": 258
}
```

The Vote Momentum now correctly shows "+7 this week" instead of "+0".

## Database Schema Notes

The fixes revealed the correct database relationships:
- `nominations.state` (not `status`) for approval status
- `votes.nomination_id` references `nominations.id`
- `nominations.subcategory_id` for category grouping
- Vote momentum counts real votes from `votes` table, not `additional_votes`