-- Create message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.event_chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id 
    ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id 
    ON public.message_reactions(user_id);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view message reactions"
    ON public.message_reactions
    FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own reactions"
    ON public.message_reactions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.message_reactions TO authenticated;