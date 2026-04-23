-- Create tables for admin content management

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('promotion', 'event', 'info')),
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery items table
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  caption TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coaches table
CREATE TABLE IF NOT EXISTS coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  experience TEXT NOT NULL,
  bio TEXT NOT NULL,
  image_url TEXT NOT NULL,
  rating NUMERIC(2, 1) DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert existing data from mockData
INSERT INTO announcements (id, title, message, type, date) VALUES
  ('1', 'Lebanese Competition', 'Lebanese Competition December 12-13-14. Join us for this exciting competition event!', 'event', '2025-10-01'),
  ('2', 'November Free Trial Week and Body Composition', 'Try any class for free during November! Plus get a free body composition assessment from November 1-8.', 'promotion', '2025-11-01'),
  ('3', 'Family Discount', 'Special family promotion! Get 25% discount on the second kid and 50% discount on the 3rd kid.', 'promotion', '2025-10-20');

INSERT INTO gallery_items (id, url, caption) VALUES
  ('1', 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800', 'Advanced beam routine'),
  ('2', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800', 'Team training session'),
  ('3', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800', 'Competition day'),
  ('4', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', 'Floor exercise practice'),
  ('5', 'https://images.unsplash.com/photo-1518310952931-b1de897abd40?w=800', 'Flexibility training'),
  ('6', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800', 'Tiny Tumblers class');

INSERT INTO coaches (id, name, specialization, experience, bio, image_url, rating) VALUES
  ('1', 'Celine El Cheikh', 'Artistic Gymnastics Coach', '3 years coaching, 5 years as gymnast', 'Dedicated artistic gymnastics coach with 3 years of coaching experience and 5 years as a competitive gymnast.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 4.9),
  ('2', 'Ramy Safi', 'Artistic Gymnastics Coach', '6 years coaching, 8 years as gymnast', 'Experienced artistic gymnastics coach with 6 years of coaching and 8 years as a competitive gymnast. Expert in tumbling techniques.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 4.8),
  ('3', 'Lynn Joy Laffe', 'Artistic Gymnastics Coach', '3 years coaching, 10 years as gymnast, FIG Level 1', 'FIG Coaching Level 1 certified artistic gymnastics coach with 3 years of coaching experience and 10 years as a gymnast.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 4.9),
  ('4', 'Pamela El Beyrouthy', 'Artistic Gymnastics Coach', '5 years', 'Experienced artistic gymnastics coach with 5 years of coaching expertise in strength and conditioning.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 4.7),
  ('5', 'Lynn Abou El Khoudoud', 'Artistic Gymnastics Coach', '3 years', 'Passionate artistic gymnastics coach with 3 years of experience working with young athletes.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 4.8),
  ('6', 'Diva Haydar', 'Artistic Gymnastics & Aerial Silk Coach', '4 years', 'Dedicated coach with 4 years of experience in artistic gymnastics and aerial silk training.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 4.8);

-- Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;

-- Create policies for announcements
CREATE POLICY "Anyone can view announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Admins can insert announcements" ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update announcements" ON announcements FOR UPDATE USING (true);
CREATE POLICY "Admins can delete announcements" ON announcements FOR DELETE USING (true);

-- Create policies for gallery_items
CREATE POLICY "Anyone can view gallery items" ON gallery_items FOR SELECT USING (true);
CREATE POLICY "Admins can insert gallery items" ON gallery_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update gallery items" ON gallery_items FOR UPDATE USING (true);
CREATE POLICY "Admins can delete gallery items" ON gallery_items FOR DELETE USING (true);

-- Create policies for coaches
CREATE POLICY "Anyone can view coaches" ON coaches FOR SELECT USING (true);
CREATE POLICY "Admins can insert coaches" ON coaches FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update coaches" ON coaches FOR UPDATE USING (true);
CREATE POLICY "Admins can delete coaches" ON coaches FOR DELETE USING (true);
