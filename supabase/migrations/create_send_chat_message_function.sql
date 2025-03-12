-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Add trigger for notifications
CREATE OR REPLACE FUNCTION handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for the recipient with explicit notification_type
  INSERT INTO notifications (
    user_id,
    notification_type,
    related_id,
    content
  )
  SELECT 
    p.user_id,
    'direct_message'::text, -- Explicit default value
    NEW.id,
    NEW.content
  FROM chat_participants p
  WHERE p.chat_id = NEW.chat_id 
    AND p.user_id != NEW.sender_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_message();
