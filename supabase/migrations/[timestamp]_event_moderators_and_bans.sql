-- Create event moderators table
CREATE TABLE IF NOT EXISTS event_moderators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create event bans table
CREATE TABLE IF NOT EXISTS event_bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Add RLS policies
ALTER TABLE event_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bans ENABLE ROW LEVEL SECURITY;

-- Policies for event_moderators
CREATE POLICY "Event creators can add moderators" ON event_moderators
  FOR INSERT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id
      AND events.creator_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view moderators" ON event_moderators
  FOR SELECT TO authenticated
  USING (true);

-- Policies for event_bans
CREATE POLICY "Event creators and moderators can ban users" ON event_bans
  FOR INSERT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_id
      AND (
        events.creator_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM event_moderators
          WHERE event_moderators.event_id = event_id
          AND event_moderators.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Anyone can view bans" ON event_bans
  FOR SELECT TO authenticated
  USING (true);