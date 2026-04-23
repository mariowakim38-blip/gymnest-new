-- ================================================
-- RECREATE CLASSES TABLE WITH ALL REQUIRED COLUMNS
-- Run this in your Supabase SQL Editor
-- ================================================

-- Drop the existing classes table completely
DROP TABLE IF EXISTS classes CASCADE;

-- Recreate the classes table with ALL required columns
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age_group TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  duration TEXT NOT NULL,
  coach_id TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 30,
  enrolled INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_classes_day_of_week ON classes(day_of_week);
CREATE INDEX idx_classes_level ON classes(level);
CREATE INDEX idx_classes_coach_id ON classes(coach_id);
CREATE INDEX idx_classes_age_group ON classes(age_group);

-- Enable Row Level Security (RLS)
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Full access for classes" ON classes;
DROP POLICY IF EXISTS "Public read access for classes" ON classes;
DROP POLICY IF EXISTS "Admins can manage classes" ON classes;

-- Create full access policy (for tRPC communication)
CREATE POLICY "Full access for classes"
  ON classes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions to anon and authenticated roles
GRANT ALL ON classes TO anon;
GRANT ALL ON classes TO authenticated;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_classes_updated_at ON classes;
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data to verify the table works
INSERT INTO classes (name, age_group, level, day, time, duration, coach_id, capacity, enrolled, description, day_of_week) VALUES
('Mini Kickers', '3-5 years', 'Beginner', 'Monday', '4:00 PM', '45 min', '1', 15, 8, 'Fun introduction to football for our youngest players', 1),
('Junior Skills', '6-8 years', 'Beginner', 'Tuesday', '4:30 PM', '60 min', '2', 20, 15, 'Building fundamental football skills', 2),
('Youth Academy', '9-12 years', 'Intermediate', 'Wednesday', '5:00 PM', '90 min', '1', 25, 20, 'Developing advanced techniques and tactics', 3),
('Teen Elite', '13-16 years', 'Advanced', 'Thursday', '5:30 PM', '90 min', '3', 20, 18, 'Competitive training for serious players', 4);

-- Verify table creation and data
SELECT 'Classes table recreated successfully!' AS status;
SELECT * FROM classes ORDER BY day_of_week;
SELECT COUNT(*) AS total_classes FROM classes;
