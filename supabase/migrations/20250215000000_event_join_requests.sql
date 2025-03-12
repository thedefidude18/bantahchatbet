-- Drop existing triggers and functions first
DROP TRIGGER IF EXISTS on_join_request_changes ON public.event_join_requests;
DROP FUNCTION IF EXISTS handle_join_request_changes CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create join requests" ON public.event_join_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.event_join_requests;
DROP POLICY IF EXISTS "Event creators can update requests" ON public.event_join_requests;

-- Drop existing notifications table and type
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

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
    'welcome_bonus'
);

-- Create notifications table (not IF NOT EXISTS, to ensure fresh creation)
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Add notification policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create event_join_requests table
CREATE TABLE IF NOT EXISTS public.event_join_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    message TEXT,
    response_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Add RLS policies
ALTER TABLE public.event_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create join requests"
ON public.event_join_requests
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM events
        WHERE id = event_id
        AND status = 'active'
        -- Allow requests for both private and public events
        -- The application logic will handle the distinction
    )
);

CREATE POLICY "Users can view their own requests"
ON public.event_join_requests
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM events
        WHERE id = event_id
        AND creator_id = auth.uid()
    )
);

CREATE POLICY "Event creators can update requests"
ON public.event_join_requests
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM events
        WHERE id = event_id
        AND creator_id = auth.uid()
    )
);

-- Create trigger function with corrected notification type
CREATE OR REPLACE FUNCTION handle_join_request_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Notify event creator of new request
        INSERT INTO notifications (
            user_id,
            type,
            title,
            content,
            metadata,
            created_at,
            updated_at,
            read
        )
        VALUES (
            (SELECT creator_id FROM events WHERE id = NEW.event_id),
            'join_request_received',  -- Changed from notification_type cast
            'New Join Request',
            format('A user has requested to join your event'),
            jsonb_build_object(
                'event_id', NEW.event_id,
                'request_id', NEW.id,
                'user_id', NEW.user_id
            ),
            NOW(),
            NOW(),
            false
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_join_request_changes
    AFTER INSERT OR UPDATE ON public.event_join_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_join_request_changes();

-- Add necessary grants
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.event_join_requests TO authenticated;
