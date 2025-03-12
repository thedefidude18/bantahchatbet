-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_participants CASCADE;
DROP TABLE IF EXISTS public.private_chats CASCADE;

-- Create private_chats table
CREATE TABLE IF NOT EXISTS public.private_chats (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_participants table
CREATE TABLE IF NOT EXISTS public.chat_participants (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    chat_id UUID NOT NULL REFERENCES public.private_chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chat_id, user_id)
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    chat_id UUID NOT NULL REFERENCES public.private_chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create helpful view for last messages
CREATE OR REPLACE VIEW public.chat_last_messages AS
SELECT DISTINCT ON (chat_id)
    chat_id,
    id as message_id,
    content,
    created_at,
    sender_id
FROM public.chat_messages
ORDER BY chat_id, created_at DESC;

-- Grant access to the view
GRANT SELECT ON public.chat_last_messages TO authenticated;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON public.chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON public.chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);

-- Enable RLS
ALTER TABLE public.private_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their chats" ON public.private_chats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants
            WHERE chat_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert into their chats" ON public.private_chats
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view chat participants" ON public.chat_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants cp
            WHERE cp.chat_id = chat_participants.chat_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert chat participants" ON public.chat_participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view messages" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants
            WHERE chat_id = chat_messages.chat_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages" ON public.chat_messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Grant permissions
GRANT ALL ON public.private_chats TO authenticated;
GRANT ALL ON public.chat_participants TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;
GRANT SELECT ON public.chat_last_messages TO authenticated;
