# Setup Instructions

## Current Error: JSON Parse Error

You're seeing this error: `JSON Parse error: Unexpected character: N`

This happens because the booking system is trying to work but isn't properly configured.

## Option 1: Use Mock Data (No Supabase Required)

Your `.env` file currently has:
```
ENABLE_BOOKINGS=false
```

This should work with mock data, but if you're still seeing errors, the mock responses might have issues.

**To fix:**
1. Keep `ENABLE_BOOKINGS=false` in your `.env` file
2. Restart your dev server completely
3. Clear any cached data

## Option 2: Enable Full Supabase Integration

If you want real database functionality:

### Step 1: Set up Supabase Database

1. Go to your Supabase project: https://guqjjahmsjnhfiawxfsp.supabase.co
2. Navigate to the SQL Editor
3. Copy and paste the entire SQL schema from `SUPABASE_SETUP.md` (lines 28-275)
4. Run the SQL to create all tables, indexes, and policies

### Step 2: Disable Email Confirmation (for development)

1. In Supabase dashboard, go to **Authentication** > **Settings**
2. Under "Email Auth", toggle **OFF** "Enable email confirmations"
3. This allows you to test without verifying emails

### Step 3: Enable Bookings

Update your `.env` file:
```
ENABLE_BOOKINGS=true
```

### Step 4: Restart Your Server

```bash
bunx rork start -p eccik9b4bwcm4zxll5xy2 --tunnel --clear
```

## Verifying Setup

### Test Registration
1. Try registering a new user
2. Check Supabase dashboard > Authentication > Users to see if the user was created
3. Check Supabase dashboard > Table Editor > profiles to see if the profile was created

### Test Booking
1. Log in with your user
2. Try booking a class
3. Check Supabase dashboard > Table Editor > bookings to see if the booking was created

## Common Issues

### "Row Level Security" errors
- Make sure you ran ALL the SQL from SUPABASE_SETUP.md
- The RLS policies are required for the app to work

### "Profile not found" errors
- Make sure the user has a profile in the profiles table
- The registration process should create this automatically

### "Child not found" errors
- Users need to have children added to their profile
- Currently, the app expects users to have children to book classes

## Need Help?

If you're still seeing errors:
1. Check the console logs for detailed error messages
2. Check your Supabase dashboard for any failed queries
3. Make sure all environment variables are set correctly
