-- Create a public view of auth.users for easier access
CREATE OR REPLACE VIEW public.users_view AS
SELECT 
    id,
    email,
    raw_user_meta_data->>'name' as name,
    raw_user_meta_data->>'avatar_url' as avatar_url,
    raw_user_meta_data->>'username' as username
FROM auth.users;

-- Grant permissions on the view
GRANT SELECT ON public.users_view TO authenticated;

-- Update private_messages table structure
CREATE TABLE IF NOT EXISTS public.private_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    media_url TEXT,
    reply_to UUID REFERENCES private_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for private_messages
CREATE POLICY "Users can insert their own messages"
    ON public.private_messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view messages they're involved in"
    ON public.private_messages
    FOR SELECT
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id
    );

-- Grant permissions on private_messages
GRANT ALL ON public.private_messages TO authenticated;

-- Add reply_to column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'private_messages' 
        AND column_name = 'reply_to'
    ) THEN
        ALTER TABLE public.private_messages 
        ADD COLUMN reply_to UUID REFERENCES private_messages(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create messages view with user details
CREATE OR REPLACE VIEW public.messages_with_users AS
SELECT 
    pm.*,
    s.name as sender_name,
    s.avatar_url as sender_avatar_url,
    s.username as sender_username,
    r.name as receiver_name,
    r.avatar_url as receiver_avatar_url,
    r.username as receiver_username
FROM private_messages pm
JOIN users_view s ON pm.sender_id = s.id
JOIN users_view r ON pm.receiver_id = r.id;

-- Grant permissions on the messages view
GRANT SELECT ON public.messages_with_users TO authenticated;
