-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS event_changes_trigger ON events;

-- Recreate the trigger
CREATE TRIGGER event_changes_trigger
    AFTER INSERT OR UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION handle_event_changes();

-- Update the function to ensure notifications are created
CREATE OR REPLACE FUNCTION handle_event_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- For new events
    IF (TG_OP = 'INSERT') THEN
        -- Notify creator
        INSERT INTO notifications (
            user_id,
            type,
            title,
            content,
            metadata,
            created_at
        ) VALUES (
            NEW.creator_id,
            'event_created',
            'Event Created Successfully',
            format('Your event "%s" has been created and is now live', NEW.title),
            jsonb_build_object(
                'event_id', NEW.id,
                'event_title', NEW.title,
                'wager_amount', NEW.wager_amount,
                'category', NEW.category
            ),
            NOW()
        );

        -- Notify followers
        INSERT INTO notifications (
            user_id,
            type,
            title,
            content,
            metadata,
            created_at
        )
        SELECT 
            f.follower_id,
            'new_event'::text,
            'New Event Available',
            format('%s created a new event: %s', (SELECT username FROM auth.users WHERE id = NEW.creator_id), NEW.title),
            jsonb_build_object(
                'event_id', NEW.id,
                'creator_id', NEW.creator_id,
                'event_title', NEW.title,
                'wager_amount', NEW.wager_amount,
                'category', NEW.category
            ),
            NOW()
        FROM followers f
        WHERE f.following_id = NEW.creator_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
