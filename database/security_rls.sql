-- Step 1: Enable Row Level Security (RLS) on all active tables
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_notifications_log ENABLE ROW LEVEL SECURITY;

-- Step 2: Define Policies for `movies` table
-- Allow anyone (including unauthenticated users with the anon key) to read movies
CREATE POLICY "Allow public read access on movies" 
ON movies 
FOR SELECT 
USING (true);

-- The backend (using the service_role key) bypasses RLS automatically.
-- No explicit policies are needed for insert/update/delete on movies 
-- because the public anon key won't have those permissions by default once RLS is enabled!

-- Step 3: Define Policies for `guest_subscriptions` and `guest_notifications_log`
-- Since all subscriptions and emails are handled securely via your FastAPI backend (which uses the service_role key),
-- we DO NOT want to give the public `anon` key any access to these tables.
-- By simply enabling RLS and creating ZERO policies for the anon role, these tables are completely locked down from the frontend.
