-- Fix invalid notifications
BEGIN;

-- Create notification_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'event_win', 'event_loss', 'new_event', 'event_update',
            'event_created', 'event_participation', 'event_joined',
            'event_milestone', 'join_request_received',
            'event_join_request_accepted', 'event_join_request_declined',
            'earnings', 'follow', 'group_message', 'direct_message',
            'group_mention', 'leaderboard_update', 'challenge',
            'challenge_response', 'group_achievement', 'group_role',
            'referral', 'welcome_bonus', 'deposit_initiated',
            'deposit_success', 'deposit_failed', 'withdrawal_initiated',
            'withdrawal_success', 'withdrawal_failed', 'transfer_initiated',
            'transfer_success', 'transfer_failed', 'system'
        );
    END IF;
END $$;

-- Rename column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'notifications'
        AND column_name = 'type'
    ) THEN
        ALTER TABLE notifications RENAME COLUMN type TO notification_type;
    END IF;
END $$;

-- Add notification_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'notifications'
        AND column_name = 'notification_type'
    ) THEN
        ALTER TABLE notifications ADD COLUMN notification_type text;
    END IF;
END $$;

-- Update notifications with null values to have default values
UPDATE notifications
SET title = 'System Notification'
WHERE title IS NULL OR title = '';

UPDATE notifications
SET content = 'No content provided'
WHERE content IS NULL OR content = '';

-- Update invalid notification types
UPDATE notifications
SET notification_type = 'system'
WHERE notification_type IS NULL 
   OR notification_type = ''
   OR notification_type NOT IN (
    'event_win', 'event_loss', 'new_event', 'event_update',
    'event_created', 'event_participation', 'event_joined',
    'event_milestone', 'join_request_received',
    'event_join_request_accepted', 'event_join_request_declined',
    'earnings', 'follow', 'group_message', 'direct_message',
    'group_mention', 'leaderboard_update', 'challenge',
    'challenge_response', 'group_achievement', 'group_role',
    'referral', 'welcome_bonus', 'deposit_initiated',
    'deposit_success', 'deposit_failed', 'withdrawal_initiated',
    'withdrawal_success', 'withdrawal_failed', 'transfer_initiated',
    'transfer_success', 'transfer_failed', 'system'
);

-- Set created_at for notifications where it's missing
UPDATE notifications
SET created_at = NOW()
WHERE created_at IS NULL;

-- Clean up metadata
UPDATE notifications
SET metadata = '{}'::jsonb
WHERE metadata IS NULL;

-- Add NOT NULL constraints after fixing data
ALTER TABLE notifications
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN content SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;

-- Convert back to enum type and set NOT NULL constraint
ALTER TABLE notifications
ALTER COLUMN notification_type TYPE notification_type USING notification_type::notification_type;
ALTER TABLE notifications
ALTER COLUMN notification_type SET NOT NULL;

-- Add type constraint (not needed since enum type already enforces valid values)
-- But we'll keep it for documentation purposes
COMMENT ON COLUMN notifications.notification_type IS 'Valid types: event_win, event_loss, new_event, event_update, event_created, event_participation, event_joined, event_milestone, join_request_received, event_join_request_accepted, event_join_request_declined, earnings, follow, group_message, direct_message, group_mention, leaderboard_update, challenge, challenge_response, group_achievement, group_role, referral, welcome_bonus, deposit_initiated, deposit_success, deposit_failed, withdrawal_initiated, withdrawal_success, withdrawal_failed, transfer_initiated, transfer_success, transfer_failed, system';

COMMIT;
