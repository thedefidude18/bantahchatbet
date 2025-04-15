-- Enable storage
CREATE EXTENSION IF NOT EXISTS "storage" SCHEMA "storage";

-- Create storage bucket for story images
DO $$
BEGIN
    -- Create the bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name)
    VALUES ('story-images', 'story-images')
    ON CONFLICT (id) DO NOTHING;

    -- Make bucket public
    UPDATE storage.buckets
    SET public = true
    WHERE id = 'story-images';

    -- Drop any existing policies for this bucket
    DROP POLICY IF EXISTS "Public Access to story images" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can upload story images" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can update story images" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can delete story images" ON storage.objects;

    -- Create new policies
    CREATE POLICY "Public Access to story images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'story-images');

    CREATE POLICY "Admins can upload story images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'story-images' 
        AND auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'is_admin' = 'true'
        )
    );

    CREATE POLICY "Admins can update story images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'story-images'
        AND auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'is_admin' = 'true'
        )
    );

    CREATE POLICY "Admins can delete story images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'story-images'
        AND auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'is_admin' = 'true'
        )
    );
END $$;