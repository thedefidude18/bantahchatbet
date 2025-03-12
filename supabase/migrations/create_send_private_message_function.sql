CREATE OR REPLACE FUNCTION send_private_message(
  p_content TEXT,
  p_sender_id UUID,
  p_receiver_id UUID,
  p_media_url TEXT DEFAULT NULL,
  p_notification_type TEXT DEFAULT 'direct_message'
)
RETURNS TABLE (LIKE private_messages) AS $$
DECLARE
  v_message_id UUID;
BEGIN
  -- Insert the message
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
  RETURNING id INTO v_message_id;

  -- Create notification for the receiver
  INSERT INTO notifications (
    user_id,
    notification_type,
    related_id,
    content
  ) VALUES (
    p_receiver_id,
    p_notification_type,
    v_message_id,
    p_content
  );

  -- Return the created message
  RETURN QUERY
  SELECT *
  FROM private_messages
  WHERE id = v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION send_private_message TO authenticated;