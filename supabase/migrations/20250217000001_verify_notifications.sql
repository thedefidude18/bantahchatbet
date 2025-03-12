-- Verify the notifications table structure and permissions
DO $$
BEGIN
  -- Check if the table exists and has the correct structure
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications'
  ) THEN
    CREATE TABLE public.notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      read_at TIMESTAMPTZ,
      CONSTRAINT valid_notification_type CHECK (
        type IN (
          'system', 'event_win', 'event_loss', 'new_event', 
          'event_update', 'event_created', 'event_participation',
          'event_joined', 'event_milestone', 'earnings', 'follow',
          'group_message', 'direct_message', 'group_mention',
          'leaderboard_update', 'challenge', 'challenge_response',
          'group_achievement', 'group_role', 'referral',
          'welcome_bonus', 'deposit_initiated', 'deposit_success',
          'deposit_failed', 'withdrawal_initiated', 'withdrawal_success',
          'withdrawal_failed'
        )
      )
    );
  END IF;

  -- Ensure indexes exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'notifications' 
    AND indexname = 'idx_notifications_user_id'
  ) THEN
    CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'notifications' 
    AND indexname = 'idx_notifications_created_at'
  ) THEN
    CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
  END IF;

  -- Ensure RLS is enabled
  ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if any
  DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
  DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

  -- Create fresh policies
  CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

  CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

END $$;

-- Insert test notification
INSERT INTO notifications (
  user_id,
  type,
  title,
  content
) VALUES (
  'd61a43d6-a405-43f0-a5bb-4e1beaec39bd',
  'system',
  'Database Test Notification',
  'This notification was created directly in the database.'
) ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
