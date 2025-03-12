-- Drop existing table and type if they exist
DROP TABLE IF EXISTS notifications CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
    'event_win', 
    'event_loss', 
    'new_event', 
    'event_update',
    'event_created',
    'event_participation',
    'event_joined',
    'event_milestone',
    'join_request_received',
    'event_join_request_accepted',
    'event_join_request_declined',
    'earnings',
    'follow',
    'group_message',
    'direct_message',
    'group_mention',
    'leaderboard_update',
    'challenge',
    'challenge_response',
    'group_achievement',
    'group_role',
    'referral',
    'welcome_bonus',
    'system'
);

-- Create notifications table
CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());
