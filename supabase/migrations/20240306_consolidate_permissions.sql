-- First, drop all existing policies and views to start clean
DROP VIEW IF EXISTS public.messages_with_users;
DROP VIEW IF EXISTS public.users_view;
DROP POLICY IF EXISTS "allow_all_authenticated_operations" ON users;
DROP POLICY IF EXISTS "allow_select_all_users" ON users;
DROP POLICY IF EXISTS "allow_insert_own_user" ON users;
DROP POLICY IF EXISTS "allow_update_own_user" ON users;
DROP POLICY IF EXISTS "Users can insert their own messages" ON private_messages;
DROP POLICY IF EXISTS "Users can view messages they're involved in" ON private_messages;

-- Create base users view
CREATE VIEW public.users_view AS
SELECT 
    id,
    email,
    raw_user_meta_data->>'name' as name,
    raw_user_meta_data->>'avatar_url' as avatar_url,
    raw_user_meta_data->>'username' as username
FROM auth.users;

-- Create messages view
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

-- Set up clear permissions
GRANT SELECT ON public.users_view TO authenticated;
GRANT SELECT ON public.messages_with_users TO authenticated;
GRANT ALL ON public.private_messages TO authenticated;

-- Create clear, specific policies
CREATE POLICY "allow_select_all_users"
    ON users
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "allow_update_own_user"
    ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own messages"
    ON private_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their messages"
    ON private_messages
    FOR SELECT
    TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);