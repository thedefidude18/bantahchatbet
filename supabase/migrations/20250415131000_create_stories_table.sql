-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stories table if it doesn't exist
CREATE TABLE IF NOT EXISTS stories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_stories_updated_at ON stories;
CREATE TRIGGER set_stories_updated_at
    BEFORE UPDATE ON stories
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Stories - Public read access"
    ON stories FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Stories - Admin insert access"
    ON stories FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'is_admin' = 'true'
        )
    );

CREATE POLICY "Stories - Admin update access"
    ON stories FOR UPDATE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'is_admin' = 'true'
        )
    );

CREATE POLICY "Stories - Admin delete access"
    ON stories FOR DELETE
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- Grant permissions
GRANT ALL ON stories TO authenticated;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';