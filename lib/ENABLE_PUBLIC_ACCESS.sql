-- Enable public access for all tables in the app
-- Run this in your Supabase SQL Editor to allow anonymous access to all data

-- ================================================
-- PROFILES TABLE - Allow anonymous access
-- ================================================
DROP POLICY IF EXISTS "Public read access for profiles" ON profiles;
DROP POLICY IF EXISTS "Public insert access for profiles" ON profiles;
DROP POLICY IF EXISTS "Public update access for profiles" ON profiles;
DROP POLICY IF EXISTS "Public delete access for profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

CREATE POLICY "Allow anonymous read for profiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert for profiles"
  ON profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update for profiles"
  ON profiles FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete for profiles"
  ON profiles FOR DELETE USING (true);

-- ================================================
-- CHILDREN TABLE - Allow anonymous access
-- ================================================
DROP POLICY IF EXISTS "Public read access for children" ON children;
DROP POLICY IF EXISTS "Public insert access for children" ON children;
DROP POLICY IF EXISTS "Public update access for children" ON children;
DROP POLICY IF EXISTS "Public delete access for children" ON children;
DROP POLICY IF EXISTS "Users can manage their own children" ON children;
DROP POLICY IF EXISTS "Admins can delete children" ON children;

CREATE POLICY "Allow anonymous read for children"
  ON children FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert for children"
  ON children FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update for children"
  ON children FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete for children"
  ON children FOR DELETE USING (true);

-- ================================================
-- ANNOUNCEMENTS TABLE - Allow anonymous access
-- ================================================
DROP POLICY IF EXISTS "Public read access for announcements" ON announcements;
DROP POLICY IF EXISTS "Public update access for announcements" ON announcements;
DROP POLICY IF EXISTS "Public delete access for announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;

CREATE POLICY "Allow anonymous read for announcements"
  ON announcements FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert for announcements"
  ON announcements FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update for announcements"
  ON announcements FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete for announcements"
  ON announcements FOR DELETE USING (true);

-- ================================================
-- GALLERY ITEMS TABLE - Allow anonymous access
-- ================================================
DROP POLICY IF EXISTS "Public read access for gallery_items" ON gallery_items;
DROP POLICY IF EXISTS "Public update access for gallery_items" ON gallery_items;
DROP POLICY IF EXISTS "Public delete access for gallery_items" ON gallery_items;
DROP POLICY IF EXISTS "Admins can manage gallery_items" ON gallery_items;

CREATE POLICY "Allow anonymous read for gallery_items"
  ON gallery_items FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert for gallery_items"
  ON gallery_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update for gallery_items"
  ON gallery_items FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete for gallery_items"
  ON gallery_items FOR DELETE USING (true);

-- ================================================
-- COACHES TABLE - Allow anonymous access
-- ================================================
DROP POLICY IF EXISTS "Public read access for coaches" ON coaches;
DROP POLICY IF EXISTS "Public update access for coaches" ON coaches;
DROP POLICY IF EXISTS "Public delete access for coaches" ON coaches;
DROP POLICY IF EXISTS "Admins can manage coaches" ON coaches;

CREATE POLICY "Allow anonymous read for coaches"
  ON coaches FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert for coaches"
  ON coaches FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update for coaches"
  ON coaches FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete for coaches"
  ON coaches FOR DELETE USING (true);

-- ================================================
-- CLASSES TABLE - Allow anonymous access
-- ================================================
DROP POLICY IF EXISTS "Public read access for classes" ON classes;
DROP POLICY IF EXISTS "Public update access for classes" ON classes;
DROP POLICY IF EXISTS "Public delete access for classes" ON classes;
DROP POLICY IF EXISTS "Admins can manage classes" ON classes;

CREATE POLICY "Allow anonymous read for classes"
  ON classes FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert for classes"
  ON classes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update for classes"
  ON classes FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete for classes"
  ON classes FOR DELETE USING (true);

-- ================================================
-- EVENTS TABLE - Allow anonymous access
-- ================================================
DROP POLICY IF EXISTS "Public read access for events" ON events;
DROP POLICY IF EXISTS "Public update access for events" ON events;
DROP POLICY IF EXISTS "Public delete access for events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;

CREATE POLICY "Allow anonymous read for events"
  ON events FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert for events"
  ON events FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update for events"
  ON events FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete for events"
  ON events FOR DELETE USING (true);

-- ================================================
-- BOOKINGS TABLE - Allow anonymous access
-- ================================================
DROP POLICY IF EXISTS "Public read access for bookings" ON bookings;
DROP POLICY IF EXISTS "Public insert access for bookings" ON bookings;
DROP POLICY IF EXISTS "Public update access for bookings" ON bookings;
DROP POLICY IF EXISTS "Public delete access for bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON bookings;

CREATE POLICY "Allow anonymous read for bookings"
  ON bookings FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert for bookings"
  ON bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update for bookings"
  ON bookings FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete for bookings"
  ON bookings FOR DELETE USING (true);

-- ================================================
-- SESSIONS TABLE - Allow anonymous access
-- ================================================
DROP POLICY IF EXISTS "Public read access for sessions" ON sessions;
DROP POLICY IF EXISTS "Public insert access for sessions" ON sessions;
DROP POLICY IF EXISTS "Public update access for sessions" ON sessions;
DROP POLICY IF EXISTS "Public delete access for sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Admins can delete sessions" ON sessions;

CREATE POLICY "Allow anonymous read for sessions"
  ON sessions FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert for sessions"
  ON sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update for sessions"
  ON sessions FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete for sessions"
  ON sessions FOR DELETE USING (true);

-- ================================================
-- VERIFICATION
-- ================================================
SELECT 'All RLS policies updated to allow public access!' AS status;

-- Check all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
