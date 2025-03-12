-- Create chat_participants table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    chat_id UUID NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT now(),
    left_at TIMESTAMPTZ,
    role TEXT DEFAULT 'member',
    UNIQUE(user_id, chat_id)
);

-- Create indices
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id);

-- Enable RLS
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view chat participants"
    ON chat_participants FOR SELECT
    USING (true);

CREATE POLICY "Users can join chats"
    ON chat_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT ON chat_participants TO authenticated;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';