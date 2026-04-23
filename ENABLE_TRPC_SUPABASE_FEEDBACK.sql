-- ================================================
-- ENABLE TRPC AND SUPABASE FEEDBACK
-- Complete schema to enable full communication
-- ================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- STEP 1: DISABLE RLS TEMPORARILY FOR SETUP
-- ================================================
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS children DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gallery_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coaches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sessions DISABLE ROW LEVEL SECURITY;

-- ================================================
-- STEP 2: DROP ALL EXISTING POLICIES
-- ================================================

-- Profiles policies
DROP POLICY IF EXISTS "Public read access for profiles" ON profiles;
DROP POLICY IF EXISTS "Public insert access for profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Allow anonymous read for profiles" ON profiles;
DROP POLICY IF EXISTS "Allow anonymous insert for profiles" ON profiles;
DROP POLICY IF EXISTS "Allow anonymous update for profiles" ON profiles;
DROP POLICY IF EXISTS "Allow anonymous delete for profiles" ON profiles;

-- Children policies
DROP POLICY IF EXISTS "Public read access for children" ON children;
DROP POLICY IF EXISTS "Public insert access for children" ON children;
DROP POLICY IF EXISTS "Users can manage their own children" ON children;
DROP POLICY IF EXISTS "Admins can delete children" ON children;
DROP POLICY IF EXISTS "Allow anonymous read for children" ON children;
DROP POLICY IF EXISTS "Allow anonymous insert for children" ON children;
DROP POLICY IF EXISTS "Allow anonymous update for children" ON children;
DROP POLICY IF EXISTS "Allow anonymous delete for children" ON children;

-- Announcements policies
DROP POLICY IF EXISTS "Public read access for announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
DROP POLICY IF EXISTS "Allow anonymous read for announcements" ON announcements;
DROP POLICY IF EXISTS "Allow anonymous insert for announcements" ON announcements;
DROP POLICY IF EXISTS "Allow anonymous update for announcements" ON announcements;
DROP POLICY IF EXISTS "Allow anonymous delete for announcements" ON announcements;

-- Gallery policies
DROP POLICY IF EXISTS "Public read access for gallery_items" ON gallery_items;
DROP POLICY IF EXISTS "Admins can manage gallery_items" ON gallery_items;
DROP POLICY IF EXISTS "Allow anonymous read for gallery_items" ON gallery_items;
DROP POLICY IF EXISTS "Allow anonymous insert for gallery_items" ON gallery_items;
DROP POLICY IF EXISTS "Allow anonymous update for gallery_items" ON gallery_items;
DROP POLICY IF EXISTS "Allow anonymous delete for gallery_items" ON gallery_items;

-- Coaches policies
DROP POLICY IF EXISTS "Public read access for coaches" ON coaches;
DROP POLICY IF EXISTS "Admins can manage coaches" ON coaches;
DROP POLICY IF EXISTS "Allow anonymous read for coaches" ON coaches;
DROP POLICY IF EXISTS "Allow anonymous insert for coaches" ON coaches;
DROP POLICY IF EXISTS "Allow anonymous update for coaches" ON coaches;
DROP POLICY IF EXISTS "Allow anonymous delete for coaches" ON coaches;

-- Classes policies
DROP POLICY IF EXISTS "Public read access for classes" ON classes;
DROP POLICY IF EXISTS "Admins can manage classes" ON classes;
DROP POLICY IF EXISTS "Allow anonymous read for classes" ON classes;
DROP POLICY IF EXISTS "Allow anonymous insert for classes" ON classes;
DROP POLICY IF EXISTS "Allow anonymous update for classes" ON classes;
DROP POLICY IF EXISTS "Allow anonymous delete for classes" ON classes;

-- Events policies
DROP POLICY IF EXISTS "Public read access for events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Allow anonymous read for events" ON events;
DROP POLICY IF EXISTS "Allow anonymous insert for events" ON events;
DROP POLICY IF EXISTS "Allow anonymous update for events" ON events;
DROP POLICY IF EXISTS "Allow anonymous delete for events" ON events;

-- Bookings policies
DROP POLICY IF EXISTS "Public read access for bookings" ON bookings;
DROP POLICY IF EXISTS "Public insert access for bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON bookings;
DROP POLICY IF EXISTS "Allow anonymous read for bookings" ON bookings;
DROP POLICY IF EXISTS "Allow anonymous insert for bookings" ON bookings;
DROP POLICY IF EXISTS "Allow anonymous update for bookings" ON bookings;
DROP POLICY IF EXISTS "Allow anonymous delete for bookings" ON bookings;

-- Sessions policies
DROP POLICY IF EXISTS "Public read access for sessions" ON sessions;
DROP POLICY IF EXISTS "Public insert access for sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;
DROP POLICY IF EXISTS "Admins can delete sessions" ON sessions;
DROP POLICY IF EXISTS "Allow anonymous read for sessions" ON sessions;
DROP POLICY IF EXISTS "Allow anonymous insert for sessions" ON sessions;
DROP POLICY IF EXISTS "Allow anonymous update for sessions" ON sessions;
DROP POLICY IF EXISTS "Allow anonymous delete for sessions" ON sessions;

-- ================================================
-- STEP 3: CREATE FULL ACCESS POLICIES FOR ALL ROLES
-- ================================================

-- PROFILES TABLE
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access for profiles"
  ON profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- CHILDREN TABLE
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access for children"
  ON children FOR ALL
  USING (true)
  WITH CHECK (true);

-- ANNOUNCEMENTS TABLE
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access for announcements"
  ON announcements FOR ALL
  USING (true)
  WITH CHECK (true);

-- GALLERY_ITEMS TABLE
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access for gallery_items"
  ON gallery_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- COACHES TABLE
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access for coaches"
  ON coaches FOR ALL
  USING (true)
  WITH CHECK (true);

-- CLASSES TABLE
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access for classes"
  ON classes FOR ALL
  USING (true)
  WITH CHECK (true);

-- EVENTS TABLE
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access for events"
  ON events FOR ALL
  USING (true)
  WITH CHECK (true);

-- BOOKINGS TABLE
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access for bookings"
  ON bookings FOR ALL
  USING (true)
  WITH CHECK (true);

-- SESSIONS TABLE
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access for sessions"
  ON sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ================================================
-- STEP 4: GRANT PERMISSIONS TO ANON AND AUTHENTICATED ROLES
-- ================================================

-- Grant all permissions on all tables to anon role
GRANT ALL ON profiles TO anon;
GRANT ALL ON children TO anon;
GRANT ALL ON announcements TO anon;
GRANT ALL ON gallery_items TO anon;
GRANT ALL ON coaches TO anon;
GRANT ALL ON classes TO anon;
GRANT ALL ON events TO anon;
GRANT ALL ON bookings TO anon;
GRANT ALL ON sessions TO anon;

-- Grant all permissions on all tables to authenticated role
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON children TO authenticated;
GRANT ALL ON announcements TO authenticated;
GRANT ALL ON gallery_items TO authenticated;
GRANT ALL ON coaches TO authenticated;
GRANT ALL ON classes TO authenticated;
GRANT ALL ON events TO authenticated;
GRANT ALL ON bookings TO authenticated;
GRANT ALL ON sessions TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ================================================
-- STEP 5: CREATE API FEEDBACK LOGGING TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_data JSONB,
  response_data JSONB,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_logs(status);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);

ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access for api_logs"
  ON api_logs FOR ALL
  USING (true)
  WITH CHECK (true);

GRANT ALL ON api_logs TO anon;
GRANT ALL ON api_logs TO authenticated;

-- ================================================
-- STEP 6: CREATE FUNCTION TO LOG API REQUESTS
-- ================================================

CREATE OR REPLACE FUNCTION log_api_request(
  p_endpoint TEXT,
  p_method TEXT,
  p_request_data JSONB DEFAULT NULL,
  p_response_data JSONB DEFAULT NULL,
  p_status TEXT DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO api_logs (endpoint, method, request_data, response_data, status, error_message)
  VALUES (p_endpoint, p_method, p_request_data, p_response_data, p_status, p_error_message)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION log_api_request TO anon;
GRANT EXECUTE ON FUNCTION log_api_request TO authenticated;

-- ================================================
-- STEP 7: CREATE TRIGGER FOR BOOKING UPDATES
-- ================================================

CREATE OR REPLACE FUNCTION notify_booking_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_api_request('bookings', 'INSERT', to_jsonb(NEW), NULL, 'success', NULL);
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_api_request('bookings', 'UPDATE', to_jsonb(NEW), to_jsonb(OLD), 'success', NULL);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_api_request('bookings', 'DELETE', to_jsonb(OLD), NULL, 'success', NULL);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_change_trigger ON bookings;
CREATE TRIGGER booking_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_change();

-- ================================================
-- STEP 8: VERIFY SETUP
-- ================================================

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check grants
SELECT 
  table_schema,
  table_name,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
SELECT 'Supabase and tRPC feedback enabled successfully!' AS status;
SELECT 'All tables now have full RLS policies for anon and authenticated roles' AS info;
SELECT 'API logging table created for tracking all requests' AS info;
