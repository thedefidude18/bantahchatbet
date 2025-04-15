-- First fix the storage policies
DROP POLICY IF EXISTS "Stories - Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Stories - Admin upload access" ON storage.objects;
DROP POLICY IF EXISTS "Stories - Admin update access" ON storage.objects;
DROP POLICY IF EXISTS "Stories - Admin delete access" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to upload story images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read story images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to story images" ON storage.objects;

-- Create new storage policies with correct admin check
CREATE POLICY "Stories - Public read access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'story-images');

CREATE POLICY "Stories - Admin upload access"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'story-images'
        AND EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
        )
    );

CREATE POLICY "Stories - Admin update access"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'story-images'
        AND EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
        )
    );

CREATE POLICY "Stories - Admin delete access"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'story-images'
        AND EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- Now fix the stories table policies
DROP POLICY IF EXISTS "Stories - Public read access" ON stories;
DROP POLICY IF EXISTS "Stories - Admin insert access" ON stories;
DROP POLICY IF EXISTS "Stories - Admin update access" ON stories;
DROP POLICY IF EXISTS "Stories - Admin delete access" ON stories;

-- Create new stories policies with correct admin check
CREATE POLICY "Stories - Public read access"
    ON stories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Stories - Admin insert access"
    ON stories FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
        )
    );

CREATE POLICY "Stories - Admin update access"
    ON stories FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
        )
    );

CREATE POLICY "Stories - Admin delete access"
    ON stories FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';