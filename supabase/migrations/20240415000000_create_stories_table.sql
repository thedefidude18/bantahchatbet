-- Create stories table
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    admin_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read stories
CREATE POLICY "Allow users to read stories"
    ON stories FOR SELECT
    TO authenticated
    USING (true);

-- Allow only admins to manage stories
CREATE POLICY "Allow admins to manage stories"
    ON stories FOR ALL
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'is_admin' = 'true'
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- Create updated_at trigger
CREATE TRIGGER set_stories_updated_at
    BEFORE UPDATE ON stories
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();