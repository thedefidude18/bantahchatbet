-- Create a new storage bucket for story images
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-images', 'story-images', true);

-- Allow authenticated admins to upload images
CREATE POLICY "Allow admin users to upload story images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'story-images' 
    AND auth.uid() IN (
        SELECT id FROM auth.users 
        WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
);

-- Allow public access to read story images
CREATE POLICY "Allow public to read story images"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-images');