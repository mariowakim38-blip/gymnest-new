# Admin Content Management Setup

## Step 1: Run the SQL in Supabase SQL Editor

Copy and paste the contents of `ADMIN_CONTENT_MANAGEMENT.sql` into your Supabase SQL Editor and run it.

This will create three new tables:
- `announcements` - For managing announcement/promotions
- `gallery_items` - For managing gallery images
- `coaches` - For managing coach profiles

## Step 2: Update Frontend Pages

The admin panel has been updated to include three new tabs:
- **Announcements** - Create, edit, and delete announcements
- **Gallery** - Manage gallery images
- **Coaches** - Manage coach profiles

### Features Added:

1. **Announcements Management**
   - Create new announcements with title, message, type (promotion/event/info), and date
   - Edit existing announcements
   - Delete announcements
   - View all announcements

2. **Gallery Management**
   - Add new gallery items with URL and caption
   - Edit gallery item captions and URLs
   - Delete gallery items
   - View all gallery items in a grid

3. **Coaches Management**
   - Add new coaches with name, specialization, experience, bio, image URL, and rating
   - Edit coach information
   - Delete coaches
   - View all coaches with their details

## Step 3: Access Admin Panel

1. Login with an admin account
2. Navigate to the Admin Panel (button visible in profile tab for admins)
3. You'll see 6 tabs: Users, Bookings, Attendance, Announcements, Gallery, Coaches
4. Click on Announcements, Gallery, or Coaches to manage content

## API Endpoints Created

### Announcements
- `trpc.announcements.getAll.useQuery()` - Get all announcements
- `trpc.announcements.create.useMutation()` - Create announcement
- `trpc.announcements.update.useMutation()` - Update announcement
- `trpc.announcements.delete.useMutation()` - Delete announcement

### Gallery
- `trpc.gallery.getAll.useQuery()` - Get all gallery items
- `trpc.gallery.create.useMutation()` - Create gallery item
- `trpc.gallery.update.useMutation()` - Update gallery item
- `trpc.gallery.delete.useMutation()` - Delete gallery item

### Coaches
- `trpc.coaches.getAll.useQuery()` - Get all coaches
- `trpc.coaches.create.useMutation()` - Create coach
- `trpc.coaches.update.useMutation()` - Update coach
- `trpc.coaches.delete.useMutation()` - Delete coach

## Frontend Integration

The following pages now fetch data from the database instead of mockData:
- Home page (`app/(tabs)/(home)/index.tsx`) - Fetches announcements from database
- Gallery page (`app/(tabs)/(home)/gallery.tsx`) - Fetches gallery items from database
- Coaches page (`app/(tabs)/coaches/index.tsx`) - Fetches coaches from database

## Notes

- All content management routes require admin authentication
- Anyone can view the content (public access)
- The SQL script includes sample data migration from mockData
- RLS (Row Level Security) policies are configured for security
