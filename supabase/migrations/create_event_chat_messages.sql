-- Create the event_chat_messages table with proper foreign key relationships
CREATE TABLE IF NOT EXISTS event_chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_sender
        FOREIGN KEY (sender_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

-- Create an index for faster queries
CREATE INDEX idx_event_chat_messages_event_id ON event_chat_messages(event_id);
CREATE INDEX idx_event_chat_messages_sender_id ON event_chat_messages(sender_id);

-- Enable RLS
ALTER TABLE event_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
    ON event_chat_messages
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users"
    ON event_chat_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (true);