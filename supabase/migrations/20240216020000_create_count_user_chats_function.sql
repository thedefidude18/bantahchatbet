-- Create a function to count chats per user
CREATE OR REPLACE FUNCTION public.count_user_chats()
RETURNS TABLE (user_id uuid, count bigint) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        user_id,
        COUNT(*)::bigint as count
    FROM chat_participants
    GROUP BY user_id;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.count_user_chats() TO authenticated;