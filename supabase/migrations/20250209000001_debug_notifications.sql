-- Update the event changes function
CREATE OR REPLACE FUNCTION handle_event_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the operation
    RAISE NOTICE 'Event change trigger fired. Operation: %, Event ID: %', TG_OP, NEW.id;

    -- For new events
    IF (TG_OP = 'INSERT') THEN
        -- Log notification creation attempt
        RAISE NOTICE 'Creating notification for creator_id: %', NEW.creator_id;
        
        -- Create notification
        INSERT INTO notifications (
            user_id,
            type,
            title,
            content,
            metadata,
            created_at
        ) VALUES (
            NEW.creator_id,
            'event_created'::notification_type,
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
        
        RAISE NOTICE 'Notification created successfully';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;