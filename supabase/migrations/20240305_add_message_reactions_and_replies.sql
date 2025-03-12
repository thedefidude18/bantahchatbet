-- Add reply_to column to private_messages
ALTER TABLE private_messages
ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES private_messages(id) ON DELETE SET NULL;

-- Create private message reactions table
CREATE TABLE IF NOT EXISTS private_message_reactions (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES private_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE private_message_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view message reactions"
    ON private_message_reactions
    FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own reactions"
    ON private_message_reactions
    FOR ALL
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_private_message_reactions_message_id 
    ON private_message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_private_message_reactions_user_id 
    ON private_message_reactions(user_id);