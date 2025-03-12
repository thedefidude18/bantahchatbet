-- Update private messages table and policies
ALTER TABLE public.private_messages DROP POLICY IF EXISTS "Users can read their private messages";
ALTER TABLE public.private_messages DROP POLICY IF EXISTS "Users can insert their own messages";

-- Create simpler, non-recursive policies
CREATE POLICY "Users can read their private messages"
ON public.private_messages FOR SELECT
TO authenticated
USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
);

CREATE POLICY "Users can insert their own messages"
ON public.private_messages FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = sender_id
);

-- Add foreign key references explicitly
ALTER TABLE public.private_messages DROP CONSTRAINT IF EXISTS private_messages_sender_id_fkey;
ALTER TABLE public.private_messages DROP CONSTRAINT IF EXISTS private_messages_receiver_id_fkey;

ALTER TABLE public.private_messages
    ADD CONSTRAINT private_messages_sender_id_fkey 
    FOREIGN KEY (sender_id) 
    REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.private_messages
    ADD CONSTRAINT private_messages_receiver_id_fkey 
    FOREIGN KEY (receiver_id) 
    REFERENCES public.users(id) ON DELETE CASCADE;

-- Create or replace function to get unread count
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id UUID, p_other_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM private_messages
        WHERE 
            receiver_id = p_user_id 
            AND sender_id = p_other_user_id
            AND read_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;