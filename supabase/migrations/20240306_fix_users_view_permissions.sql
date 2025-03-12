-- Ensure the view exists with correct structure
CREATE OR REPLACE VIEW public.users_view AS
SELECT 
    id,
    raw_user_meta_data->>'name' as name,
    raw_user_meta_data->>'avatar_url' as avatar_url,
    raw_user_meta_data->>'username' as username
FROM auth.users;

-- Grant proper permissions
GRANT SELECT ON public.users_view TO authenticated;

-- Enable RLS
ALTER VIEW users_view ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read
CREATE POLICY "Allow authenticated users to read users_view"
ON users_view
FOR SELECT
TO authenticated
USING (true);

-- Create the messages_with_users view
CREATE VIEW public.messages_with_users AS
SELECT 
    pm.*,
    s.name as sender_name,
    s.avatar_url as sender_avatar_url,
    s.username as sender_username,
    r.name as receiver_name,
    r.avatar_url as receiver_avatar_url,
    r.username as receiver_username
FROM public.private_messages pm
LEFT JOIN public.users_view s ON pm.sender_id = s.id
LEFT JOIN public.users_view r ON pm.receiver_id = r.id;

-- Grant permissions on the messages view
GRANT SELECT ON public.messages_with_users TO authenticated;

-- Check if the view has data
SELECT COUNT(*) FROM users_view;

-- Check a sample of users
SELECT * FROM users_view LIMIT 5;

-- Verify the structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users_view';
