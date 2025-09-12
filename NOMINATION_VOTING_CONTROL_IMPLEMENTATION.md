# Nomination and Voting Date Control Implementation

This implementation adds comprehensive admin control over nomination and voting phases for the World Staffing Awards.

## 🎯 Features Implemented

### Admin Panel Controls
- **Nomination Toggle**: Enable/disable nominations globally
- **Voting Toggle**: Enable/disable voting globally  
- **Voting Dates**: Set specific start and end dates for voting
- **Custom Messages**: Configure messages shown when phases are closed
- **Real-time Status**: Live updates across all components

### Frontend Behavior
- **Homepage Button**: Shows "Nominate Now" during nomination phase, "Vote Now" during voting phase
- **Nominee Pages**: Vote buttons show voting closed message when voting is disabled
- **Date-based Control**: Voting automatically opens/closes based on admin-set dates
- **Graceful Fallbacks**: Safe defaults when settings can't be loaded

## 📁 Files Created/Modified

### New Files
- `src/hooks/useVotingStatus.ts` - Hook for voting status management
- `src/components/VotingClosedDialog.tsx` - Dialog shown when voting is closed
- `NOMINATION_AND_VOTING_DATE_SCHEMA.sql` - Database schema updates
- `scripts/test-nomination-voting-control.js` - Test script

### Modified Files
- `src/components/admin/NominationToggle.tsx` - Enhanced with voting controls
- `src/app/api/settings/route.ts` - Added voting settings to public API
- `src/components/VoteDialog.tsx` - Added voting status checks
- `src/app/nominee/[slug]/NomineeProfileClient.tsx` - Updated vote buttons
- `src/hooks/useNominationStatus.ts` - Already existed, no changes needed

## 🗄️ Database Schema

Run this SQL in your Supabase SQL editor:

```sql
-- Add voting date control settings
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES 
  ('voting_enabled', 'false', 'Controls whether voting is currently enabled'),
  ('voting_start_date', '', 'Date when voting will open (ISO format)'),
  ('voting_end_date', '', 'Date when voting will close (ISO format)'),
  ('voting_closed_message', 'Voting will open soon. Please check back later.', 'Message shown when voting is closed')
ON CONFLICT (setting_key) DO NOTHING;
```

## 🎮 How to Use

### Admin Panel
1. Go to `/admin` and login
2. Navigate to the "Settings" tab
3. Use the **Nomination Phase** section to:
   - Toggle nominations on/off
   - Set custom closed message
4. Use the **Voting Phase** section to:
   - Toggle voting on/off
   - Set voting start/end dates
   - Set custom voting closed message

### Behavior Matrix

| Nominations | Voting | Homepage Button | Vote Buttons | Nomination Form |
|-------------|--------|----------------|--------------|-----------------|
| ✅ Open     | ❌ Closed | "Nominate Now" | Show closed message | Accepts submissions |
| ❌ Closed   | ✅ Open   | "Vote Now"     | Allow voting | Shows closed message |
| ✅ Open     | ✅ Open   | "Nominate Now" | Allow voting | Accepts submissions |
| ❌ Closed   | ❌ Closed | "Vote Now"     | Show closed message | Shows closed message |

## 🔧 Technical Details

### Voting Status Logic
The system checks multiple conditions to determine if voting is allowed:
1. `voting_enabled` must be `true`
2. If `voting_start_date` is set, current time must be >= start date
3. If `voting_end_date` is set, current time must be <= end date
4. All conditions must be met for voting to be allowed

### Real-time Updates
- Settings are polled every 30 seconds
- Changes in admin panel are reflected across the site within 30 seconds
- Focus events trigger immediate refresh

### Error Handling
- Safe defaults when database is unavailable
- Graceful degradation if APIs fail
- Loading states during status checks

## 🧪 Testing

Run the test script to verify everything works:

```bash
cd world-staffing-awards
node scripts/test-nomination-voting-control.js
```

### Manual Testing Checklist

1. **Admin Panel**
   - [ ] Can toggle nominations on/off
   - [ ] Can toggle voting on/off
   - [ ] Can set voting dates
   - [ ] Can update custom messages
   - [ ] Status summary shows correct info

2. **Homepage**
   - [ ] Button shows "Nominate Now" when nominations open
   - [ ] Button shows "Vote Now" when nominations closed
   - [ ] Button links work correctly

3. **Nominee Pages**
   - [ ] Vote buttons work when voting enabled
   - [ ] Vote buttons show closed dialog when voting disabled
   - [ ] Closed dialog shows custom message and dates
   - [ ] Vote dialog prevents submission when voting closed

4. **Nomination Form**
   - [ ] Form works when nominations enabled
   - [ ] Form shows closed message when nominations disabled

## 🚀 Deployment Notes

1. **Database First**: Apply the SQL schema before deploying code
2. **Default Settings**: The system defaults to nominations enabled, voting disabled
3. **Environment**: Test in staging before production
4. **Monitoring**: Watch for any API errors in logs

## 🔒 Security Considerations

- Only authenticated admins can change settings
- Public APIs only expose necessary settings
- Settings changes are logged with timestamps
- Safe defaults prevent accidental exposure

## 📈 Future Enhancements

Potential improvements for future versions:
- Email notifications when phases change
- Scheduled phase transitions
- Analytics on voting patterns
- Bulk nominee management during voting
- Integration with external calendar systems

## 🆘 Troubleshooting

### Common Issues

**Settings not updating**
- Check database connection
- Verify system_settings table exists
- Check browser console for API errors

**Vote buttons not working**
- Verify voting status hook is loading
- Check API responses in network tab
- Ensure voting_enabled setting exists

**Admin panel errors**
- Check authentication middleware
- Verify admin credentials
- Check server logs for errors

### Debug Commands

```bash
# Check current settings
curl http://localhost:3000/api/settings

# Check admin settings (requires auth)
curl http://localhost:3000/api/admin/settings

# Test database connection
node scripts/test-supabase-connection.js
```

## ✅ Implementation Complete

This implementation provides comprehensive control over the nomination and voting phases while maintaining a smooth user experience. The admin can easily manage the awards timeline, and users receive clear feedback about the current phase status.