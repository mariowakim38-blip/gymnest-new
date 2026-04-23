# Fix Login Issue After Database Migration

## The Problem
After running the database migration, existing users or new admin users cannot login because:
1. The user exists in Supabase Auth
2. BUT no corresponding profile exists in the `profiles` table

## Solution Steps

### Step 1: Create Admin User in Supabase Auth

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to **Authentication** > **Users**
3. Click **Add User** > **Create new user**
4. Enter:
   - Email: `admin@gymnest.com` (or your preferred admin email)
   - Password: Choose a strong password
   - Check "Auto Confirm User"
5. Click **Create user**
6. **COPY THE USER ID** (uuid format like: `550e8400-e29b-41d4-a716-446655440000`)

### Step 2: Create Profile in Database

1. Go to **SQL Editor** in Supabase
2. Run this SQL (replace `YOUR_USER_ID_HERE` with the ID from Step 1):

```sql
-- Create admin profile
INSERT INTO profiles (user_id, name, username, phone_number, role)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with actual user ID from Step 1
  'Admin User',
  'admin',
  '+961123456789',
  'admin'
);

-- Verify the profile was created
SELECT * FROM profiles WHERE role = 'admin';
```

### Step 3: Try Logging In

Now you can login with:
- Email: `admin@gymnest.com` (or whatever email you used)
- Password: (the password you set)

## For New User Registration

If you want to create a regular parent account, you can:

1. Use the **Sign Up** button in the app
2. Fill in all the fields
3. This will automatically create both the auth user AND the profile

## Troubleshooting

### "Profile not found" Error

This means the user exists in Auth but not in profiles table. Follow Step 2 above.

### "Invalid email or password" Error

This means:
- The email doesn't exist in Supabase Auth, OR
- The password is incorrect

### Check What Users Exist

Run this SQL to see all auth users and their profiles:

```sql
-- See all auth users
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- See all profiles
SELECT p.id, p.user_id, p.name, p.username, p.role, p.created_at
FROM profiles p
ORDER BY p.created_at DESC;

-- See auth users WITHOUT profiles (these will fail to login)
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.id IS NULL;
```

If you see users without profiles, create profiles for them using the INSERT statement from Step 2.

## Quick Fix SQL Template

Use this if you have an existing auth user that needs a profile:

```sql
-- Get the user ID from auth.users
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL_HERE';

-- Create profile for that user
INSERT INTO profiles (user_id, name, username, phone_number, role)
VALUES (
  'USER_ID_FROM_ABOVE',
  'Display Name',
  'unique_username',
  '+961123456789',
  'admin'  -- or 'parent' or 'coach'
);
```

## Prevention

Going forward, always use the app's registration flow which creates both:
1. Auth user (via Supabase Auth)
2. Profile entry (via app's register procedure)

This ensures consistency between auth.users and profiles tables.
