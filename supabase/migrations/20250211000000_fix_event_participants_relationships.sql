-- Create bet_matches table if it doesn't exist
CREATE TABLE IF NOT EXISTS bet_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key to event_participants table
ALTER TABLE event_participants
    ADD COLUMN IF NOT EXISTS bet_match_id UUID REFERENCES bet_matches(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_event_participants_bet_match_id ON event_participants(bet_match_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);

-- Update the event_participants view to include bet_matches
CREATE OR REPLACE VIEW event_participants_with_details AS
SELECT 
    ep.*,
    bm.status as bet_match_status,
    e.name as event_name,
    e.start_time as event_start_time
FROM event_participants ep
LEFT JOIN bet_matches bm ON ep.bet_match_id = bm.id
LEFT JOIN events e ON bm.event_id = e.id;