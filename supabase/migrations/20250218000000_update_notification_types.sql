-- First, temporarily convert enum to text to allow modifications
ALTER TABLE notifications 
ALTER COLUMN notification_type TYPE TEXT;

-- Drop the existing enum type
DROP TYPE IF EXISTS notification_type;

-- Create the new enum type with all notification types
CREATE TYPE notification_type AS ENUM (
    -- Public Event Notifications
    'public_event_joined',
    'public_event_participation',
    
    -- Private Event Notifications
    'private_event_join_request',
    'private_event_join_request_received',
    'private_event_join_request_accepted',
    'private_event_join_request_declined',
    
    -- Challenge Event Notifications
    'challenge_created',
    'challenge_accepted',
    'challenge_declined',
    'challenge_matched',
    
    -- Common Notifications
    'event_win',
    'event_loss',
    'event_ended',
    'event_cancelled',
    'event_milestone',
    'earnings',
    'follow',
    'group_message',
    'direct_message',
    'group_mention',
    'leaderboard_update'
);

-- Update any existing notifications to valid types
UPDATE notifications
SET notification_type = 'event_ended'
WHERE notification_type NOT IN (
    'public_event_joined',
    'public_event_participation',
    'private_event_join_request',
    'private_event_join_request_received',
    'private_event_join_request_accepted',
    'private_event_join_request_declined',
    'challenge_created',
    'challenge_accepted',
    'challenge_declined',
    'challenge_matched',
    'event_win',
    'event_loss',
    'event_ended',
    'event_cancelled',
    'event_milestone',
    'earnings',
    'follow',
    'group_message',
    'direct_message',
    'group_mention',
    'leaderboard_update'
);

-- Convert the column back to enum type
ALTER TABLE notifications 
ALTER COLUMN notification_type TYPE notification_type USING notification_type::notification_type;

-- Ensure notifications table has all required columns
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN content SET NOT NULL,
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN user_id SET NOT NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Update RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';