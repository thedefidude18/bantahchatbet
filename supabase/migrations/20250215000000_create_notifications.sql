-- First, drop existing types and tables
DROP TABLE IF EXISTS public.notifications CASCADE;
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
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Add RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON public.notifications TO authenticated;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
