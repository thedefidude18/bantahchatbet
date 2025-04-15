-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow users to read stories" ON stories;
DROP POLICY IF EXISTS "Allow admins to manage stories" ON stories;

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper admin checks
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

-- Grant necessary permissions
GRANT ALL ON stories TO authenticated;