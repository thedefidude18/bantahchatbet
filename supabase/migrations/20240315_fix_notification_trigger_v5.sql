BEGIN;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS create_message_notification_trigger ON private_messages;
DROP FUNCTION IF EXISTS create_message_notification();

-- Create updated function with exact column matching
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_username TEXT;
BEGIN
    -- Get sender's username
    SELECT username INTO sender_username
    FROM users
    WHERE id = NEW.sender_id;

    -- Insert notification matching exact table structure
    INSERT INTO notifications (
        -- Required fields
        id,                  -- uuid NOT NULL DEFAULT gen_random_uuid()
        notification_type,   -- varchar NOT NULL
        title,              -- text NOT NULL
        content,            -- text NOT NULL
        
        -- Optional fields
        user_id,           -- uuid
        sender_id,         -- uuid
        metadata,          -- jsonb DEFAULT '{}'
        created_at         -- timestamptz DEFAULT now()
        -- read_at and deleted_at will use their defaults (null)
    )
    VALUES (
        gen_random_uuid(),
        'direct_message',   -- notification_type (required)
        COALESCE(sender_username, 'Someone') || ' sent you a message',
        COALESCE(NEW.content, 'New message'),
        
        NEW.receiver_id,    -- user_id
        NEW.sender_id,      -- sender_id
        jsonb_build_object(
            'message_id', NEW.id,
            'chat_id', NEW.receiver_id,
            'sender_username', sender_username
        ),
        NOW()              -- created_at
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in create_message_notification: %, SQLSTATE: %', SQLERRM, SQLSTATE;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER create_message_notification_trigger
    AFTER INSERT ON private_messages
    FOR EACH ROW
    EXECUTE FUNCTION create_message_notification();

COMMIT;
