CREATE OR REPLACE FUNCTION send_private_message(
  p_content TEXT,
  p_sender_id UUID,
  p_receiver_id UUID,
  p_media_url TEXT,
  p_notification_type TEXT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  sender_id UUID,
  receiver_id UUID,
  created_at TIMESTAMPTZ,
  media_url TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  new_message_id UUID;
BEGIN
  -- Insert the new message into private_messages
  INSERT INTO private_messages (content, sender_id, receiver_id, media_url)
  VALUES (p_content, p_sender_id, p_receiver_id, p_media_url)
  RETURNING id INTO new_message_id;

  -- Insert a notification
  INSERT INTO notifications (user_id, sender_id, content, type, reference_id)
  VALUES (p_receiver_id, p_sender_id, p_content, p_notification_type, new_message_id);

  -- Return the data of the created message
  RETURN QUERY
  SELECT
    pm.id,
    pm.content,
    pm.sender_id,
    pm.receiver_id,
    pm.created_at,
    pm.media_url
  FROM private_messages pm
  WHERE pm.id = new_message_id;
END;
$$;