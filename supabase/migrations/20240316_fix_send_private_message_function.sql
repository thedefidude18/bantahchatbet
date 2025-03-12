-- First, let's check if notification_type is an enum and create it if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'direct_message',
            'chat_message',
            'system_message'
        );
    END IF;
END $$;

-- First, drop ALL existing versions of the function
DROP FUNCTION IF EXISTS send_private_message(text, uuid, uuid);
DROP FUNCTION IF EXISTS send_private_message(text, uuid, uuid, text);
DROP FUNCTION IF EXISTS send_private_message(text, uuid, uuid, text, text);

-- Create the new function with a clear signature and return type
CREATE OR REPLACE FUNCTION send_private_message(
  p_content TEXT,
  p_sender_id UUID,
  p_receiver_id UUID,
  p_media_url TEXT DEFAULT NULL,
  p_notification_type TEXT DEFAULT 'direct_message'
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  sender_id UUID,
  receiver_id UUID,
  media_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_new_message private_messages;
BEGIN
  -- Insert the message and get the full record
  INSERT INTO private_messages (
    content,
    sender_id,
    receiver_id,
    media_url
  ) VALUES (
    p_content,
    p_sender_id,
    p_receiver_id,
    p_media_url
  )
  RETURNING * INTO v_new_message;

  -- Create notification for the receiver
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content,
    metadata
  ) VALUES (
    p_receiver_id,
    p_notification_type,  -- Use the notification_type parameter as the type value
    'New Message',
    p_content,
    jsonb_build_object(
      'message_id', v_new_message.id,
      'media_url', p_media_url,
      'sender_id', p_sender_id
    )
  );

  -- Return the created message
  RETURN QUERY
  SELECT 
    v_new_message.id,
    v_new_message.content,
    v_new_message.sender_id,
    v_new_message.receiver_id,
    v_new_message.media_url,
    v_new_message.created_at,
    v_new_message.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION send_private_message(TEXT, UUID, UUID, TEXT, TEXT) TO authenticated;
