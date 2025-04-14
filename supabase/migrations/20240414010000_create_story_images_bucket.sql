-- Create story-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-images', 'story-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies for story-images bucket
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

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;