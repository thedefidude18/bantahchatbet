-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create buckets table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.buckets (
    id text PRIMARY KEY,
    name text NOT NULL,
    owner uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);

-- Create objects table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.objects (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    last_accessed_at timestamptz DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED,
    version text,
    owner_id text,
    size bigint,
    FOREIGN KEY (bucket_id) REFERENCES storage.buckets (id)
);

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Drop existing policies for story-images bucket
    DROP POLICY IF EXISTS "Allow admin users to upload story images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public to read story images" ON storage.objects;
    DROP POLICY IF EXISTS "Public Access to story images" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can upload story images" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can update story images" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can delete story images" ON storage.objects;

    -- Delete and recreate bucket to ensure clean state
    DELETE FROM storage.buckets WHERE id = 'story-images';
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('story-images', 'story-images', true);

    -- Create storage policies
    CREATE POLICY "Stories - Public read access"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'story-images');

    CREATE POLICY "Stories - Admin upload access"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'story-images'
            AND auth.uid() IN (
                SELECT id FROM auth.users 
                WHERE raw_user_meta_data->>'is_admin' = 'true'
            )
        );

    CREATE POLICY "Stories - Admin update access"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (
            bucket_id = 'story-images'
            AND auth.uid() IN (
                SELECT id FROM auth.users 
                WHERE raw_user_meta_data->>'is_admin' = 'true'
            )
        );

    CREATE POLICY "Stories - Admin delete access"
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

-- Grant necessary permissions
GRANT ALL ON storage.objects TO postgres, authenticated;
GRANT ALL ON storage.buckets TO postgres, authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.buckets TO anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS bname ON storage.buckets (name);
CREATE INDEX IF NOT EXISTS object_bucketid_index ON storage.objects (bucket_id);
CREATE INDEX IF NOT EXISTS objects_path_tokens_idx ON storage.objects USING GIN (path_tokens);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';