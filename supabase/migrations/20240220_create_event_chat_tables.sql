-- Create event_chat_messages table
CREATE TABLE IF NOT EXISTS public.event_chat_messages (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_event_chat_messages_event_id 
    ON public.event_chat_messages(event_id);

-- Create index for sender_id
CREATE INDEX IF NOT EXISTS idx_event_chat_messages_sender_id 
    ON public.event_chat_messages(sender_id);

-- Create the foreign key relationship view for sender details
CREATE OR REPLACE VIEW event_chat_messages_with_sender AS
SELECT 
    m.*,
    u.name as sender_name,
    u.avatar_url as sender_avatar_url,
    u.username as sender_username
FROM 
    public.event_chat_messages m
    LEFT JOIN auth.users u ON m.sender_id = u.id;

-- Enable RLS
ALTER TABLE public.event_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can insert messages to their events" ON public.event_chat_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
    );

CREATE POLICY "Users can view messages of their events" ON public.event_chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.event_participants
            WHERE event_id = event_chat_messages.event_id
            AND user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON public.event_chat_messages TO authenticated;
