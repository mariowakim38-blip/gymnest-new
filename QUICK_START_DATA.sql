-- ============================================
-- QUICK START: Create Admin User
-- ============================================
-- This script will help you create an admin user quickly
-- Run this AFTER setting up the database with SUPABASE_MIGRATION.sql

-- ============================================
-- STEP 1: Create Auth User First
-- ============================================
-- Go to Supabase Dashboard:
-- Authentication > Users > Add User (via email)
-- Create a user with:
--   Email: admin@test.com
--   Password: admin123 (or your choice)
--   Auto Confirm: YES

-- After creating the user, go to SQL Editor and run this query to get the user_id:
SELECT id, email, created_at FROM auth.users WHERE email = 'admin@test.com';

-- ============================================
-- STEP 2: Copy the UUID from Step 1 and replace below
-- ============================================
-- Replace 'YOUR_AUTH_USER_ID_HERE' with the actual UUID from Step 1

-- Create admin profile
INSERT INTO profiles (user_id, name, username, phone_number, role)
VALUES (
  'YOUR_AUTH_USER_ID_HERE'::uuid,  -- Replace with your auth user id
  'Admin User',
  'admin',
  '+1234567890',
  'admin'
)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  role = 'admin';

-- ============================================
-- STEP 3: Verify the admin user was created
-- ============================================
SELECT 
  p.id as profile_id,
  p.name,
  p.username,
  p.role,
  au.email,
  au.id as auth_user_id
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'admin@test.com';

-- If you see a result, the admin is ready!
-- Login credentials:
-- Email: admin@test.com
-- Password: (whatever you set in Step 1)

-- ============================================
-- ALTERNATIVE: One-Step Process (Advanced)
-- ============================================
-- If you want to do everything in one go, uncomment below:
-- Note: This requires the pgcrypto extension and admin access

/*
-- Enable required extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create auth user and profile in one transaction
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert into auth.users (requires service_role access)
  -- This may not work in SQL Editor - you might need to use Supabase Auth API
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@test.com',
    crypt('admin123', gen_salt('bf')),  -- Password: admin123
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;
  
  -- Create profile for the admin user
  INSERT INTO profiles (user_id, name, username, phone_number, role)
  VALUES (
    new_user_id,
    'Admin User',
    'admin',
    '+1234567890',
    'admin'
  );
  
  RAISE NOTICE 'Admin user created successfully!';
  RAISE NOTICE 'Email: admin@test.com';
  RAISE NOTICE 'Password: admin123';
  RAISE NOTICE 'User ID: %', new_user_id;
END $$;
*/

-- ============================================
-- Create Sample Parent Users (After Admin)
-- ============================================
-- Follow the same process as Step 1-2 for each parent:

-- Parent 1: john@test.com
-- 1. Create auth user via Supabase Dashboard
-- 2. Get user_id from: SELECT id FROM auth.users WHERE email = 'john@test.com';
-- 3. Run this insert (replace UUID):

/*
INSERT INTO profiles (user_id, name, username, phone_number, role)
VALUES (
  'JOHN_AUTH_USER_ID_HERE'::uuid,
  'John Smith',
  'johnsmith',
  '+1234567891',
  'parent'
);

-- Add children for John
INSERT INTO children (profile_id, name, age)
SELECT p.id, 'Emma Smith', 8
FROM profiles p
WHERE p.username = 'johnsmith';

INSERT INTO children (profile_id, name, age)
SELECT p.id, 'Liam Smith', 10
FROM profiles p
WHERE p.username = 'johnsmith';

-- Add sample bookings for John's children
INSERT INTO bookings (profile_id, class_id, child_id, booking_date, status, attended)
SELECT 
  p.id,
  'ninja-warriors-6-9',
  c.id,
  '2025-10-20',
  'confirmed',
  true
FROM profiles p
INNER JOIN children c ON c.profile_id = p.id
WHERE p.username = 'johnsmith' AND c.name = 'Emma Smith';
*/

-- ============================================
-- VERIFICATION: Check what's in the database
-- ============================================
-- Run these queries to see your data:

-- View all profiles
SELECT 
  p.name,
  p.username,
  p.role,
  p.phone_number,
  au.email
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
ORDER BY p.role, p.name;

-- Count everything
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM children) as children,
  (SELECT COUNT(*) FROM bookings) as bookings,
  (SELECT COUNT(*) FROM sessions) as sessions;
