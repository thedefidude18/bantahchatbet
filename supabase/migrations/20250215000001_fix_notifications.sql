-- Modify notifications table to match TypeScript interface
ALTER TABLE public.notifications 
    ALTER COLUMN type TYPE TEXT,  -- Change from notification_type to TEXT
    ADD COLUMN IF NOT EXISTS link TEXT,
    DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new check constraint for notification types
ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_type_check 
    CHECK (type IN (
        'event_win', 'event_loss', 'new_event', 'event_update',
        'event_created', 'event_participation', 'event_joined',
        'event_milestone', 'join_request_received',
        'event_join_request_accepted', 'event_join_request_declined',
        'earnings', 'follow', 'group_message', 'direct_message',
        'group_mention', 'leaderboard_update', 'challenge',
        'challenge_response', 'group_achievement', 'group_role',
        'referral', 'welcome_bonus', 'system'
    ));