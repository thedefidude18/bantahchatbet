-- Insert a test notification
INSERT INTO notifications (
  user_id,
  type,
  title,
  content,
  metadata
)
VALUES (
  'd61a43d6-a405-43f0-a5bb-4e1beaec39bd',  -- Your user ID
  'system',
  'Welcome to the Platform',
  'This is a test notification to verify the notification system.',
  jsonb_build_object(
    'test', true,
    'timestamp', CURRENT_TIMESTAMP
  )
)
ON CONFLICT DO NOTHING;

-- Verify RLS policies are correct
DO $$
BEGIN
  -- Verify notifications table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications'
  ) THEN
    RAISE EXCEPTION 'notifications table does not exist';
  END IF;

  -- Verify RLS is enabled
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Ensure policies exist
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications'
  ) THEN
    -- Recreate basic policies if none exist
    CREATE POLICY "notifications_view_policy_v2"
      ON notifications
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid()::uuid);

    CREATE POLICY "notifications_update_policy_v2"
      ON notifications
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid()::uuid);
  END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT, UPDATE ON notifications TO authenticated;