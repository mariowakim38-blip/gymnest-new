-- ============================================
-- ADD SAMPLE USERS FOR TESTING
-- ============================================
-- Run this in your Supabase SQL Editor to add sample users
-- NOTE: This assumes you've already run COMPLETE_DATABASE_SETUP.sql

-- ============================================
-- IMPORTANT: Create Auth Users First!
-- ============================================
-- You MUST create these auth users in Supabase Dashboard first:
-- Go to: Authentication > Users > Add User
-- 
-- Create these users (with "Auto Confirm" checked):
-- 1. admin@test.com (password: admin123)
-- 2. john@test.com (password: parent123)
-- 3. sarah@test.com (password: parent123)
-- 
-- After creating them, run this query to get their IDs:
SELECT id, email FROM auth.users ORDER BY email;

-- Copy the UUIDs and replace them below in the INSERT statements

-- ============================================
-- Create Admin Profile
-- ============================================
-- Replace 'ADMIN_USER_ID_HERE' with the actual UUID from auth.users
INSERT INTO profiles (user_id, name, username, phone_number, role)
VALUES (
  'ADMIN_USER_ID_HERE'::uuid,
  'Admin User',
  'admin',
  '+1234567890',
  'admin'
)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  role = 'admin';

-- ============================================
-- Create Parent 1: John Smith
-- ============================================
-- Replace 'JOHN_USER_ID_HERE' with the actual UUID from auth.users
INSERT INTO profiles (user_id, name, username, phone_number, role)
VALUES (
  'JOHN_USER_ID_HERE'::uuid,
  'John Smith',
  'johnsmith',
  '+1234567891',
  'parent'
)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username;

-- ============================================
-- Create Parent 2: Sarah Johnson
-- ============================================
-- Replace 'SARAH_USER_ID_HERE' with the actual UUID from auth.users
INSERT INTO profiles (user_id, name, username, phone_number, role)
VALUES (
  'SARAH_USER_ID_HERE'::uuid,
  'Sarah Johnson',
  'sarahjohnson',
  '+1234567892',
  'parent'
)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username;

-- ============================================
-- Add Children for John Smith
-- ============================================
INSERT INTO children (profile_id, name, age)
SELECT p.id, 'Emma Smith', 8
FROM profiles p
WHERE p.username = 'johnsmith'
ON CONFLICT DO NOTHING;

INSERT INTO children (profile_id, name, age)
SELECT p.id, 'Liam Smith', 10
FROM profiles p
WHERE p.username = 'johnsmith'
ON CONFLICT DO NOTHING;

-- ============================================
-- Add Children for Sarah Johnson
-- ============================================
INSERT INTO children (profile_id, name, age)
SELECT p.id, 'Sophie Johnson', 6
FROM profiles p
WHERE p.username = 'sarahjohnson'
ON CONFLICT DO NOTHING;

-- ============================================
-- Verify Users Were Created
-- ============================================
SELECT 
  p.id as profile_id,
  p.name,
  p.username,
  p.role,
  p.phone_number,
  au.email,
  (SELECT COUNT(*) FROM children c WHERE c.profile_id = p.id) as children_count
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
ORDER BY p.role DESC, p.name;

-- You should see:
-- 1. Admin User (admin role)
-- 2. John Smith (parent role, 2 children)
-- 3. Sarah Johnson (parent role, 1 child)

-- ============================================
-- Quick Summary
-- ============================================
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as admin_count,
  (SELECT COUNT(*) FROM profiles WHERE role = 'parent') as parent_count,
  (SELECT COUNT(*) FROM children) as total_children;
