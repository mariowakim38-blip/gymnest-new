-- Sample Data for Testing
-- Run this in your Supabase SQL Editor AFTER running the migration script
-- This will populate your database with test data

-- IMPORTANT: First, you need to create test users in Supabase Auth
-- Go to Supabase Dashboard > Authentication > Users > Add User
-- Create users and note down their user_id (UUID) from auth.users table

-- ============================================
-- STEP 1: Check existing auth users
-- ============================================
-- Run this query first to see available auth users:
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- ============================================
-- STEP 2: Insert profiles for existing auth users
-- ============================================
-- Replace the UUID below with actual user_id from auth.users
-- Example: If you have a user with email 'admin@test.com', get their id from the query above

-- Example admin profile (replace UUID with your actual auth user id)
INSERT INTO profiles (user_id, name, username, phone_number, role)
SELECT 
  id,
  'Admin User',
  'admin',
  '+1234567890',
  'admin'
FROM auth.users
WHERE email = 'admin@test.com'
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  phone_number = EXCLUDED.phone_number,
  role = EXCLUDED.role;

-- Example parent profiles (replace emails with your actual auth user emails)
INSERT INTO profiles (user_id, name, username, phone_number, role)
SELECT 
  id,
  'John Smith',
  'johnsmith',
  '+1234567891',
  'parent'
FROM auth.users
WHERE email = 'john@test.com'
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  phone_number = EXCLUDED.phone_number,
  role = EXCLUDED.role;

INSERT INTO profiles (user_id, name, username, phone_number, role)
SELECT 
  id,
  'Sarah Johnson',
  'sarahjohnson',
  '+1234567892',
  'parent'
FROM auth.users
WHERE email = 'sarah@test.com'
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  phone_number = EXCLUDED.phone_number,
  role = EXCLUDED.role;

INSERT INTO profiles (user_id, name, username, phone_number, role)
SELECT 
  id,
  'Mike Williams',
  'mikewilliams',
  '+1234567893',
  'parent'
FROM auth.users
WHERE email = 'mike@test.com'
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  phone_number = EXCLUDED.phone_number,
  role = EXCLUDED.role;

-- Coach profile
INSERT INTO profiles (user_id, name, username, phone_number, role)
SELECT 
  id,
  'Coach David',
  'coachdavid',
  '+1234567894',
  'coach'
FROM auth.users
WHERE email = 'coach@test.com'
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  phone_number = EXCLUDED.phone_number,
  role = EXCLUDED.role;

-- ============================================
-- STEP 3: Insert children for parent profiles
-- ============================================
-- Add children for John Smith
INSERT INTO children (profile_id, name, age)
SELECT 
  p.id,
  'Emma Smith',
  8
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'john@test.com';

INSERT INTO children (profile_id, name, age)
SELECT 
  p.id,
  'Liam Smith',
  10
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'john@test.com';

-- Add children for Sarah Johnson
INSERT INTO children (profile_id, name, age)
SELECT 
  p.id,
  'Olivia Johnson',
  7
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'sarah@test.com';

INSERT INTO children (profile_id, name, age)
SELECT 
  p.id,
  'Noah Johnson',
  9
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'sarah@test.com';

-- Add child for Mike Williams
INSERT INTO children (profile_id, name, age)
SELECT 
  p.id,
  'Sophia Williams',
  6
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'mike@test.com';

-- ============================================
-- STEP 4: Insert sample bookings
-- ============================================
-- Note: class_id values should match your mockData.ts classes
-- Common class IDs: 'ninja-warriors-6-9', 'parkour-basics-6-9', 'advanced-parkour-10-14', etc.

-- Bookings for Emma Smith (John's daughter)
INSERT INTO bookings (profile_id, class_id, child_id, booking_date, status, attended)
SELECT 
  p.id,
  'ninja-warriors-6-9',
  c.id,
  '2025-10-20',
  'confirmed',
  true
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
INNER JOIN children c ON c.profile_id = p.id AND c.name = 'Emma Smith'
WHERE au.email = 'john@test.com';

INSERT INTO bookings (profile_id, class_id, child_id, booking_date, status, attended)
SELECT 
  p.id,
  'ninja-warriors-6-9',
  c.id,
  '2025-10-22',
  'confirmed',
  NULL
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
INNER JOIN children c ON c.profile_id = p.id AND c.name = 'Emma Smith'
WHERE au.email = 'john@test.com';

-- Bookings for Liam Smith (John's son)
INSERT INTO bookings (profile_id, class_id, child_id, booking_date, status, attended)
SELECT 
  p.id,
  'advanced-parkour-10-14',
  c.id,
  '2025-10-21',
  'confirmed',
  true
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
INNER JOIN children c ON c.profile_id = p.id AND c.name = 'Liam Smith'
WHERE au.email = 'john@test.com';

-- Bookings for Olivia Johnson (Sarah's daughter)
INSERT INTO bookings (profile_id, class_id, child_id, booking_date, status, attended)
SELECT 
  p.id,
  'parkour-basics-6-9',
  c.id,
  '2025-10-20',
  'confirmed',
  false
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
INNER JOIN children c ON c.profile_id = p.id AND c.name = 'Olivia Johnson'
WHERE au.email = 'sarah@test.com';

INSERT INTO bookings (profile_id, class_id, child_id, booking_date, status, attended)
SELECT 
  p.id,
  'parkour-basics-6-9',
  c.id,
  '2025-10-22',
  'confirmed',
  NULL
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
INNER JOIN children c ON c.profile_id = p.id AND c.name = 'Olivia Johnson'
WHERE au.email = 'sarah@test.com';

-- Bookings for Noah Johnson (Sarah's son)
INSERT INTO bookings (profile_id, class_id, child_id, booking_date, status, attended)
SELECT 
  p.id,
  'ninja-warriors-6-9',
  c.id,
  '2025-10-20',
  'confirmed',
  true
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
INNER JOIN children c ON c.profile_id = p.id AND c.name = 'Noah Johnson'
WHERE au.email = 'sarah@test.com';

-- Bookings for Sophia Williams (Mike's daughter)
INSERT INTO bookings (profile_id, class_id, child_id, booking_date, status, attended)
SELECT 
  p.id,
  'parkour-basics-6-9',
  c.id,
  '2025-10-21',
  'confirmed',
  NULL
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
INNER JOIN children c ON c.profile_id = p.id AND c.name = 'Sophia Williams'
WHERE au.email = 'mike@test.com';

-- ============================================
-- STEP 5: Insert sample private sessions
-- ============================================
-- Note: coach_id values should match your mockData.ts coaches
-- Common coach IDs: 'coach-1', 'coach-2', 'coach-3', etc.

-- Private session for Emma Smith
INSERT INTO sessions (profile_id, coach_id, child_id, session_date, duration, status)
SELECT 
  p.id,
  'coach-1',
  c.id,
  '2025-10-25T14:00:00Z',
  60,
  'scheduled'
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
INNER JOIN children c ON c.profile_id = p.id AND c.name = 'Emma Smith'
WHERE au.email = 'john@test.com';

-- Private session for Liam Smith
INSERT INTO sessions (profile_id, coach_id, child_id, session_date, duration, status)
SELECT 
  p.id,
  'coach-2',
  c.id,
  '2025-10-23T15:30:00Z',
  90,
  'completed'
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
INNER JOIN children c ON c.profile_id = p.id AND c.name = 'Liam Smith'
WHERE au.email = 'john@test.com';

-- Private session for Noah Johnson
INSERT INTO sessions (profile_id, coach_id, child_id, session_date, duration, status)
SELECT 
  p.id,
  'coach-1',
  c.id,
  '2025-10-24T10:00:00Z',
  60,
  'scheduled'
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
INNER JOIN children c ON c.profile_id = p.id AND c.name = 'Noah Johnson'
WHERE au.email = 'sarah@test.com';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the data was inserted correctly

-- Check profiles
SELECT 
  p.id,
  p.name,
  p.username,
  p.role,
  au.email,
  p.created_at
FROM profiles p
INNER JOIN auth.users au ON p.user_id = au.id
ORDER BY p.created_at DESC;

-- Check children with their parents
SELECT 
  c.id as child_id,
  c.name as child_name,
  c.age,
  p.name as parent_name,
  au.email as parent_email
FROM children c
INNER JOIN profiles p ON c.profile_id = p.id
INNER JOIN auth.users au ON p.user_id = au.id
ORDER BY p.name, c.name;

-- Check bookings with details
SELECT 
  b.id,
  p.name as parent_name,
  c.name as child_name,
  b.class_id,
  b.booking_date,
  b.status,
  b.attended,
  b.created_at
FROM bookings b
INNER JOIN profiles p ON b.profile_id = p.id
INNER JOIN children c ON b.child_id = c.id
ORDER BY b.booking_date DESC, p.name;

-- Check sessions with details
SELECT 
  s.id,
  p.name as parent_name,
  c.name as child_name,
  s.coach_id,
  s.session_date,
  s.duration,
  s.status,
  s.created_at
FROM sessions s
INNER JOIN profiles p ON s.profile_id = p.id
INNER JOIN children c ON s.child_id = c.id
ORDER BY s.session_date DESC;

-- Count summary
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM profiles WHERE role = 'parent') as total_parents,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM profiles WHERE role = 'coach') as total_coaches,
  (SELECT COUNT(*) FROM children) as total_children,
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM sessions) as total_sessions;

-- ============================================
-- ALTERNATIVE: Quick test data without auth users
-- ============================================
-- If you don't have auth users yet, you can manually insert test data
-- UNCOMMENT THE SECTION BELOW to insert dummy data:

/*
-- Create a dummy UUID for testing (you'll need to create actual auth users later)
DO $$
DECLARE
  admin_user_id UUID := gen_random_uuid();
  parent1_user_id UUID := gen_random_uuid();
  parent2_user_id UUID := gen_random_uuid();
  parent1_profile_id UUID;
  parent2_profile_id UUID;
  child1_id UUID;
  child2_id UUID;
BEGIN
  -- Insert profiles with dummy user_ids (THIS WILL NOT WORK FOR LOGIN!)
  -- You'll need to update these with real auth.users IDs later
  
  -- Note: This approach creates profiles without valid auth users
  -- Users won't be able to login until you create actual auth users
  -- and update the user_id values in the profiles table
  
  INSERT INTO profiles (id, user_id, name, username, phone_number, role)
  VALUES 
    (gen_random_uuid(), admin_user_id, 'Admin User', 'admin', '+1234567890', 'admin'),
    (gen_random_uuid(), parent1_user_id, 'John Smith', 'johnsmith', '+1234567891', 'parent'),
    (gen_random_uuid(), parent2_user_id, 'Sarah Johnson', 'sarahjohnson', '+1234567892', 'parent');
  
  -- Get parent profile IDs
  SELECT id INTO parent1_profile_id FROM profiles WHERE username = 'johnsmith';
  SELECT id INTO parent2_profile_id FROM profiles WHERE username = 'sarahjohnson';
  
  -- Insert children
  INSERT INTO children (profile_id, name, age)
  VALUES 
    (parent1_profile_id, 'Emma Smith', 8),
    (parent1_profile_id, 'Liam Smith', 10),
    (parent2_profile_id, 'Olivia Johnson', 7);
  
  -- Get child IDs
  SELECT id INTO child1_id FROM children WHERE name = 'Emma Smith';
  SELECT id INTO child2_id FROM children WHERE name = 'Olivia Johnson';
  
  -- Insert bookings
  INSERT INTO bookings (profile_id, class_id, child_id, booking_date, status, attended)
  VALUES 
    (parent1_profile_id, 'ninja-warriors-6-9', child1_id, '2025-10-20', 'confirmed', true),
    (parent2_profile_id, 'parkour-basics-6-9', child2_id, '2025-10-20', 'confirmed', false);
  
  -- Insert sessions
  INSERT INTO sessions (profile_id, coach_id, child_id, session_date, duration, status)
  VALUES 
    (parent1_profile_id, 'coach-1', child1_id, '2025-10-25T14:00:00Z', 60, 'scheduled');
  
  RAISE NOTICE 'Test data created successfully!';
  RAISE NOTICE 'IMPORTANT: These are dummy profiles without real auth users.';
  RAISE NOTICE 'Create real users in Supabase Auth and update the user_id values.';
END $$;
*/
