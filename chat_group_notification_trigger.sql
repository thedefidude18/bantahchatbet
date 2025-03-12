-- Create a function to handle chat group notifications
CREATE OR REPLACE FUNCTION handle_chat_group_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- For new chat group members
    IF TG_OP = 'INSERT' THEN
        -- Notify the user that they've been added to the group
        INSERT INTO notifications (
            user_id,
            notification_type,
            title,
            content,
            metadata
        )
        VALUES (
            NEW.user_id,
            'group_invitation',
            'Added to Chat Group',
            'You have been added to a new chat group',
            jsonb_build_object(
                'chat_id', NEW.chat_id,
                'action', 'added_to_group'
            )
        );
    
    -- For updates to chat group settings
    ELSIF TG_OP = 'UPDATE' THEN
        -- Notify all group members about the changes
        INSERT INTO notifications (
            user_id,
            notification_type,
            title,
            content,
            metadata
        )
        SELECT 
            cm.user_id,
            'group_update',
            'Group Settings Updated',
            'The chat group settings have been updated',
            jsonb_build_object(
                'chat_id', NEW.id,
                'action', 'settings_updated'
            )
        FROM chat_members cm
        WHERE cm.chat_id = NEW.id
        AND cm.user_id != auth.uid(); -- Don't notify the user who made the changes
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for chat group notifications
CREATE TRIGGER chat_member_notification_trigger
    AFTER INSERT ON chat_members
    FOR EACH ROW
    EXECUTE FUNCTION handle_chat_group_notification();

CREATE TRIGGER chat_update_notification_trigger
    AFTER UPDATE ON chats
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION handle_chat_group_notification();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_chat_group_notification() TO authenticated;