-- 1. Create the 'teams' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('teams', 'teams', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to read files (Public Read Access)
-- This is needed even if the bucket is 'public' for certain RLS configurations
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'teams');

-- 3. Allow public uploads (Public Insert Access)
-- WARNING: In a production environment, you should restrict this to authenticated users
CREATE POLICY "Public Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'teams');

-- 4. Allow users to update their own uploads (Optional)
CREATE POLICY "Public Update Access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'teams');

-- 5. Allow users to delete their own uploads (Optional)
CREATE POLICY "Public Delete Access"
ON storage.objects FOR DELETE
USING (bucket_id = 'teams');
