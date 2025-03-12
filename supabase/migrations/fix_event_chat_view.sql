-- Drop existing view
DROP VIEW IF EXISTS public.event_chat_messages_with_sender;

-- Create the view with proper schema references
CREATE OR REPLACE VIEW public.event_chat_messages_with_sender AS
SELECT 
    m.*,
    u.id as sender_id,
    COALESCE(u.raw_user_meta_data->>'name', 'Unknown User') as sender_name,
    u.raw_user_meta_data->>'avatar_url' as sender_avatar_url,
    u.raw_user_meta_data->>'username' as sender_username
FROM 
    public.event_chat_messages m
    LEFT JOIN auth.users u ON m.sender_id = u.id;

-- Grant access to authenticated users
GRANT SELECT ON public.event_chat_messages_with_sender TO authenticated;
