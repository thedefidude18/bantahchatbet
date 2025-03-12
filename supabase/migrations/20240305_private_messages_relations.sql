-- Create private_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS private_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    reply_to UUID REFERENCES private_messages(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    media_url TEXT,
    reactions JSONB DEFAULT '{}'::jsonb
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_private_messages_sender ON private_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_receiver ON private_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_reply ON private_messages(reply_to);

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'private_messages_sender_id_fkey'
    ) THEN
        ALTER TABLE private_messages
        ADD CONSTRAINT private_messages_sender_id_fkey
        FOREIGN KEY (sender_id) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'private_messages_receiver_id_fkey'
    ) THEN
        ALTER TABLE private_messages
        ADD CONSTRAINT private_messages_receiver_id_fkey
        FOREIGN KEY (receiver_id) REFERENCES users(id);
    END IF;
END $$;

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

  -- Create notification for receiver with correct column names
  INSERT INTO notifications (
    user_id,
    type,           -- Changed from notification_type to type
    title,          -- Added required title field
    content,
    metadata
  ) VALUES (
    p_receiver_id,
    'direct_message'::notification_type,
    'New Message',  -- Added title
    p_content,
    jsonb_build_object(
      'sender_id', p_sender_id,
      'message_id', v_message_id
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

-- Add trigger for notifications on private messages
CREATE OR REPLACE FUNCTION handle_private_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,           -- Changed from notification_type to type
    title,          -- Added required title field
    content,
    metadata
  ) VALUES (
    NEW.receiver_id,
    'direct_message'::notification_type,
    'New Message',  -- Added title
    NEW.content,
    jsonb_build_object(
      'sender_id', NEW.sender_id,
      'message_id', NEW.id
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS on_private_message_insert ON private_messages;
CREATE TRIGGER on_private_message_insert
  AFTER INSERT ON private_messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_private_message();
