-- Create or replace the trigger function for private messages
CREATE OR REPLACE FUNCTION handle_private_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    content,
    metadata
  ) VALUES (
    NEW.receiver_id,
    'direct_message'::notification_type,
    'New Message',
    NEW.content,
    jsonb_build_object(
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'chat_type', 'private'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_private_message_created ON private_messages;

-- Create the trigger
CREATE TRIGGER on_private_message_created
  AFTER INSERT ON private_messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_private_message_notification();