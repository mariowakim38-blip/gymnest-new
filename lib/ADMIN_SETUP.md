# Admin Account Setup Guide

## Problem: Can't Login to Admin Account

If you're unable to login to an admin account, it's likely because the user exists in Supabase Auth but doesn't have a corresponding profile in the `profiles` table.

## Solution 1: Create Admin Through App Registration (Recommended)

1. Register a new user through the app's registration screen
2. After registration, go to Supabase Dashboard > SQL Editor
3. Run this SQL to upgrade the user to admin:

```sql
UPDATE profiles
SET role = 'admin'
WHERE username = 'YOUR_USERNAME';
```

Replace `YOUR_USERNAME` with the username you registered with.

## Solution 2: Create Admin Manually in Supabase

If you already created a user directly in Supabase Auth, you need to create a profile for them:

### Step 1: Find the User ID

1. Go to Supabase Dashboard > Authentication > Users
2. Find your user and copy their User ID (UUID)

### Step 2: Create Profile

Go to SQL Editor and run:

```sql
-- Replace these values with your actual data
INSERT INTO profiles (user_id, name, username, phone_number, role)
VALUES (
  'YOUR_USER_ID_HERE',  -- The UUID from auth.users
  'Admin Name',          -- Full name
  'admin',               -- Username (must be unique)
  '+9611234567',         -- Phone number
  'admin'                -- Role
);
```

### Step 3: Verify

Check that the profile was created:

```sql
SELECT p.*, u.email
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.role = 'admin';
```

## Solution 3: Add RLS Policy for Profile Creation

If you're getting RLS errors when trying to create profiles, add this policy:

```sql
-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Troubleshooting

### Error: "Cannot coerce the result to a single JSON object"
This means no profile exists for the authenticated user. Follow Solution 1 or 2 above.

### Error: "new row violates row-level security policy"
This means RLS is blocking the insert. Follow Solution 3 above.

### Error: "duplicate key value violates unique constraint"
This means a profile already exists. Check if:
- The username is already taken
- A profile already exists for this user_id

Run this to check:
```sql
SELECT * FROM profiles WHERE user_id = 'YOUR_USER_ID';
SELECT * FROM profiles WHERE username = 'YOUR_USERNAME';
```

## Testing Admin Login

After creating the admin profile:

1. Restart your dev server
2. Go to the login screen
3. Login with the email and password from Supabase Auth
4. You should now be logged in as admin

## Quick Admin Creation Script

Run this complete script to create an admin account from scratch:

```sql
-- Step 1: Create auth user (if not exists)
-- Do this in Supabase Dashboard > Authentication > Users > Add User
-- Email: admin@gymnest.com
-- Password: (set a secure password)
-- Confirm email: Yes (toggle on)

-- Step 2: Create profile (replace USER_ID with the ID from step 1)
INSERT INTO profiles (user_id, name, username, phone_number, role)
VALUES (
  'USER_ID_FROM_AUTH_USERS',
  'Admin User',
  'admin',
  '+9611234567',
  'admin'
)
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin';

-- Step 3: Verify
SELECT p.*, u.email
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.role = 'admin';
```
