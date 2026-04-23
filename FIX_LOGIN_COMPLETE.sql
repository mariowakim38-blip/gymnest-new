-- ============================================
-- COMPLETE LOGIN FIX SCRIPT
-- ============================================
-- This script will help diagnose and fix login issues
-- Run each section step by step

-- ============================================
-- SECTION 1: DIAGNOSTIC - Check Current State
-- ============================================

-- 1.1: Check all auth users
SELECT 
  'AUTH USERS' as check_type,
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 1.2: Check all profiles
SELECT 
  'PROFILES' as check_type,
  p.id as profile_id,
  p.user_id,
  p.name,
  p.username,
  p.role,
  p.phone_number
FROM profiles p
ORDER BY p.created_at DESC;

-- 1.3: Check for orphaned profiles (profiles without auth users)
SELECT 
  'ORPHANED PROFILES (NO AUTH USER)' as check_type,
  p.id as profile_id,
  p.name,
  p.username,
  p.role
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
WHERE au.id IS NULL;

-- 1.4: Check for auth users without profiles
SELECT 
  'AUTH USERS WITHOUT PROFILES' as check_type,
  au.id as auth_user_id,
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- 1.5: Check children
SELECT 
  'CHILDREN' as check_type,
  c.id,
  c.name,
  c.age,
  p.name as parent_name
FROM children c
LEFT JOIN profiles p ON c.profile_id = p.id
ORDER BY p.name, c.name;

-- ============================================
-- SECTION 2: FIX ORPHANED DATA
-- ============================================

-- 2.1: Delete orphaned profiles (profiles without auth users)
-- CAUTION: This will delete profiles that don't have valid auth users
DELETE FROM profiles
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Verify deletion
SELECT 'Orphaned profiles deleted' as status;

-- ============================================
-- SECTION 3: CREATE MISSING PROFILES
-- ============================================

-- 3.1: Create profiles for auth users that don't have one
-- This will create basic "parent" profiles for any auth user without a profile
INSERT INTO profiles (user_id, name, username, phone_number, role)
SELECT 
  au.id,
  COALESCE(au.email, 'User'),  -- Use email as name if no name available
  LOWER(SPLIT_PART(au.email, '@', 1)),  -- Use email prefix as username
  '+0000000000',  -- Placeholder phone number
  'parent'  -- Default role
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Verify creation
SELECT 'Missing profiles created' as status;

-- ============================================
-- SECTION 4: CREATE ADMIN USER (IF NEEDED)
-- ============================================

-- 4.1: Check if admin exists
SELECT 
  'ADMIN CHECK' as check_type,
  COUNT(*) as admin_count
FROM profiles
WHERE role = 'admin';

-- 4.2: If no admin exists, you need to create one manually:
-- STEP A: Go to Supabase Dashboard > Authentication > Users > Add User
--         Email: admin@gymnest.com
--         Password: (your choice)
--         Auto Confirm: YES
-- 
-- STEP B: After creating the auth user, run this query to get the user_id:
--         SELECT id FROM auth.users WHERE email = 'admin@gymnest.com';
--
-- STEP C: Replace 'YOUR_ADMIN_AUTH_USER_ID' below with the actual UUID and run:

/*
INSERT INTO profiles (user_id, name, username, phone_number, role)
VALUES (
  'YOUR_ADMIN_AUTH_USER_ID'::uuid,  -- Replace with actual UUID
  'Admin User',
  'admin',
  '+9611234567',
  'admin'
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'admin',
  name = 'Admin User',
  username = 'admin';
*/

-- ============================================
-- SECTION 5: FIX DUPLICATE USERNAMES
-- ============================================

-- 5.1: Check for duplicate usernames
SELECT 
  'DUPLICATE USERNAMES' as check_type,
  username,
  COUNT(*) as count
FROM profiles
GROUP BY username
HAVING COUNT(*) > 1;

-- 5.2: Fix duplicate usernames by appending user_id
UPDATE profiles
SET username = username || '_' || SUBSTRING(user_id::text, 1, 8)
WHERE username IN (
  SELECT username
  FROM profiles
  GROUP BY username
  HAVING COUNT(*) > 1
)
AND id NOT IN (
  SELECT MIN(id)
  FROM profiles
  GROUP BY username
);

-- Verify fix
SELECT 'Duplicate usernames fixed' as status;

-- ============================================
-- SECTION 6: CREATE SAMPLE TEST USER
-- ============================================

-- 6.1: Create a test parent user that you can use for testing
-- STEP A: Go to Supabase Dashboard > Authentication > Users > Add User
--         Email: test@test.com
--         Password: test123
--         Auto Confirm: YES
--
-- STEP B: Get the user_id:
--         SELECT id FROM auth.users WHERE email = 'test@test.com';
--
-- STEP C: Replace 'YOUR_TEST_USER_AUTH_ID' below and run:

/*
-- Create test parent profile
INSERT INTO profiles (user_id, name, username, phone_number, role)
VALUES (
  'YOUR_TEST_USER_AUTH_ID'::uuid,  -- Replace with actual UUID
  'Test Parent',
  'testparent',
  '+9611111111',
  'parent'
)
ON CONFLICT (user_id) DO NOTHING;

-- Add a test child
INSERT INTO children (profile_id, name, age)
SELECT p.id, 'Test Child', 8
FROM profiles p
WHERE p.username = 'testparent'
AND NOT EXISTS (
  SELECT 1 FROM children c 
  WHERE c.profile_id = p.id AND c.name = 'Test Child'
);
*/

-- ============================================
-- SECTION 7: FINAL VERIFICATION
-- ============================================

-- 7.1: Show complete user list with profiles
SELECT 
  'FINAL USER LIST' as report,
  au.email as email,
  p.name as name,
  p.username as username,
  p.role as role,
  p.phone_number as phone,
  (SELECT COUNT(*) FROM children WHERE profile_id = p.id) as children_count
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
ORDER BY p.role, au.email;

-- 7.2: Show summary statistics
SELECT 
  'SUMMARY' as report,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as admins,
  (SELECT COUNT(*) FROM profiles WHERE role = 'parent') as parents,
  (SELECT COUNT(*) FROM profiles WHERE role = 'coach') as coaches,
  (SELECT COUNT(*) FROM children) as total_children,
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM sessions) as total_sessions;

-- ============================================
-- SECTION 8: QUICK ADMIN CREATION (ALTERNATIVE)
-- ============================================
-- If you want to quickly check if an email can be made admin:

-- 8.1: Show all existing users that could be promoted to admin
SELECT 
  'USERS THAT CAN BE ADMIN' as info,
  au.id as user_id,
  au.email,
  p.name,
  p.username,
  p.role as current_role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
ORDER BY au.created_at DESC;

-- 8.2: To promote an existing user to admin, replace the email and run:
/*
UPDATE profiles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE'
);
*/

-- ============================================
-- TROUBLESHOOTING TIPS
-- ============================================
/*
ISSUE: "Invalid email or password"
FIX: The auth credentials are wrong. Go to Supabase Dashboard > Authentication 
     and verify the user exists and the password is correct.

ISSUE: "Profile not found"
FIX: The auth user exists but doesn't have a profile. Run SECTION 3 to create profiles.

ISSUE: "User can't login"
FIX: Run SECTION 1 diagnostics to identify the problem, then run appropriate fixes.

ISSUE: Need admin access
FIX: Follow SECTION 4 to create an admin user properly.

REMEMBER: 
1. You must create users in Supabase Auth FIRST
2. Then create their profiles in the profiles table
3. The user_id in profiles MUST match the id in auth.users
4. Without a profile, users can't login even if auth credentials are correct
*/
