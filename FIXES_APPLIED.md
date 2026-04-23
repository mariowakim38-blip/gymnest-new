# Fixes applied to the Gymnest app

## Backend and admin fixes
- Removed the frontend admin backdoor that granted admin by registering with username `admin` and password `admin`.
- Removed hardcoded fallback Supabase keys from the server context.
- Added authenticated tRPC requests by forwarding the Supabase access token in the `Authorization` header.
- Locked sensitive admin procedures behind authenticated admin-only guards:
  - list users
  - update user
  - delete user
  - list all bookings
  - mark attendance
  - list all sessions
  - class bookings lookup
- Restricted parent-facing booking/session procedures so users can only act on their own profile unless they are admins.
- Replaced server routes that imported the client-side Supabase singleton with routes that use the request server context.
- Replaced Bun/Rork-only start scripts with normal Expo scripts so the app can be tested without Rork.

## Fraud / security issues found in the exported project
These files are dangerous and should NOT be run in production as-is:
- `ENABLE_PUBLIC_ACCESS.sql`
- `ENABLE_TRPC_SUPABASE_FEEDBACK.sql`

Why they are dangerous:
- they open broad anonymous access
- they grant excessive table permissions
- they undermine row-level security

## Testing recommendation
Use one of these:
1. Local development: `npm install --legacy-peer-deps` then `npx expo start --web`
2. Mobile testing: `npx expo start` and open in Expo Go
3. Quick web deployment: Vercel or Netlify after confirming env vars

## Required env vars
Create `.env` from `.env.example` and set:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ENABLE_BOOKINGS=true`

## Important note
I fixed the app code that was inside the zip, but I cannot repair your live Supabase project from here. If your Supabase database currently has unsafe RLS policies from those SQL files, they still need to be corrected inside Supabase.
