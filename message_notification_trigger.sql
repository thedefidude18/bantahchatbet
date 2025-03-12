-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS message_notification_trigger ON messages;
DROP FUNCTION IF EXISTS handle_message_notification;

-- Create a function to handle message notifications
CREATE OR REPLACE FUNCTION handle_message_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a notification for the message recipient
    INSERT INTO notifications (
        user_id,
        message_id,
        type,
        read,
        created_at
    )
    VALUES (
        NEW.receiver_id,
        NEW.id,
        'new_message',
        false,
        CURRENT_TIMESTAMP
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the messages table
CREATE TRIGGER message_notification_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION handle_message_notification();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_message_notification() TO authenticated;