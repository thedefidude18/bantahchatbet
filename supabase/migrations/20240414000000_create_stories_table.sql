-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read stories
CREATE POLICY "Allow users to read stories"
    ON stories FOR SELECT
    TO authenticated
    USING (true);

-- Allow only admins to insert/update/delete stories
CREATE POLICY "Allow admins to manage stories"
    ON stories FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true))
    WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

-- Create trigger to update updated_at on changes
CREATE TRIGGER set_stories_updated_at
    BEFORE UPDATE ON stories
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();