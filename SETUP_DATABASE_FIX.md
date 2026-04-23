# Database Setup Fix for tRPC Errors

## Problem
You're seeing these errors:
- `TRPCClientError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

This means your database tables either don't exist or RLS (Row Level Security) policies are blocking access.

## Solution

Follow these steps to fix the database:

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `guqjjahmsjnhfiawxfsp`
3. Click on "SQL Editor" in the left sidebar
4. Click "+ New query"

### Step 2: Run the Migration Script

1. Open the file `SUPABASE_MIGRATION.sql` in this project
2. Copy the **entire contents** of the file
3. Paste it into the Supabase SQL Editor
4. Click "Run" button (or press Cmd/Ctrl + Enter)

### Step 3: Verify Tables Were Created

After running the migration, you should see output at the bottom showing:
- `Profiles table created`
- `Children table created`
- `Bookings table created`
- `Sessions table created`

You should also see the column structures for each table.

### Step 4: Create Your First Admin User

1. **Register a new user through your app** (or use an existing user)
2. Go to Supabase Dashboard → Authentication → Users
3. Find the user you want to make admin
4. Copy their `user_id` (the UUID in the ID column)
5. Go back to SQL Editor and run:

```sql
UPDATE profiles
SET role = 'admin'
WHERE user_id = 'PASTE_USER_ID_HERE';
```

Replace `PASTE_USER_ID_HERE` with the actual user ID you copied.

6. Verify the update:
```sql
SELECT * FROM profiles WHERE role = 'admin';
```

### Step 5: Test the Fix

1. Restart your development server:
   ```bash
   bunx rork start --clear
   ```

2. Open your app and navigate to the admin panel
3. You should now see:
   - Users list loading correctly
   - Bookings list loading correctly
   - Sessions list loading correctly
   - No more JSON parsing errors

## What Was Fixed

1. **Created all required tables** with proper schema:
   - `profiles` - User profile information
   - `children` - Children associated with parent profiles
   - `bookings` - Class bookings
   - `sessions` - Private training sessions

2. **Fixed the `attended` column**:
   - Changed from `BOOLEAN DEFAULT FALSE` to `BOOLEAN DEFAULT NULL`
   - This allows three states:
     - `NULL` = attendance not marked yet
     - `true` = attended
     - `false` = marked absent

3. **Set up permissive RLS policies for development**:
   - Public read access for all tables
   - Users can update their own data
   - Admins can manage everything
   - **Note**: For production, you should implement more restrictive policies

4. **Added proper indexes** for performance
5. **Added automatic `updated_at` triggers**

## Troubleshooting

### Still seeing errors after running migration?

1. **Check if tables exist**:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **Check RLS policies**:
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies
   WHERE schemaname = 'public';
   ```

3. **Check if you have any data**:
   ```sql
   SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
   UNION ALL
   SELECT 'children', COUNT(*) FROM children
   UNION ALL
   SELECT 'bookings', COUNT(*) FROM bookings
   UNION ALL
   SELECT 'sessions', COUNT(*) FROM sessions;
   ```

### "relation does not exist" error?

Run the migration script again. Make sure you're in the correct project.

### "permission denied" error?

The user may not have proper permissions. Check that you're logged in with the project owner account in Supabase.

### Authentication issues?

1. Go to Supabase Dashboard → Authentication → Settings
2. Under "Email Auth", make sure "Enable email confirmations" is **OFF** for development
3. Under "Auth Providers", make sure "Email" is enabled

## Next Steps After Fix

1. ✅ Verify admin panel loads without errors
2. ✅ Test creating bookings through the app
3. ✅ Test marking attendance
4. ✅ Test user management features

## Production Security (TODO for later)

For production, replace the permissive policies with more restrictive ones:

```sql
-- Example: More restrictive profile policy
DROP POLICY IF EXISTS "Public read access for profiles" ON profiles;

CREATE POLICY "Users and admins can view profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'coach')
    )
  );
```

Apply similar restrictions to other tables based on your security requirements.
