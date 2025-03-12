CREATE OR REPLACE FUNCTION send_private_message(
  p_content text,
  p_receiver_id uuid,
  p_sender_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_id uuid;
BEGIN
  -- Insert the message
  INSERT INTO private_messages (
    content,
    sender_id,
    receiver_id
  ) VALUES (
    p_content,
    p_sender_id,
    p_receiver_id
  )
  RETURNING id INTO v_message_id;

  -- Create notification
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content,
    metadata
  ) VALUES (
    p_receiver_id,
    'direct_message'::notification_type,
    'New Message',
    p_content,
    jsonb_build_object(
      'message_id', v_message_id,
      'sender_id', p_sender_id,
      'chat_type', 'private'
    )
  );

  RETURN (
    SELECT json_build_object(
      'message', msg,
      'sender', sender
    )
    FROM (
      SELECT m.*, 
        (SELECT row_to_json(u) 
         FROM (SELECT id, name, avatar_url, username 
               FROM users 
               WHERE id = m.sender_id) u
        ) as sender
      FROM private_messages m 
      WHERE m.id = v_message_id
    ) msg
  );
END;
$$;