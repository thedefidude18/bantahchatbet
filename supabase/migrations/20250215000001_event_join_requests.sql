CREATE OR REPLACE FUNCTION handle_join_request_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Notify event creator of new request
        INSERT INTO notifications (
            user_id,
            notification_type, -- Changed from 'type'
            title,
            content,
            metadata,
            created_at,
            updated_at,
            read
        )
        VALUES (
            (SELECT creator_id FROM events WHERE id = NEW.event_id),
            'join_request_received',
            'New Join Request',
            format('A user has requested to join your event'),
            jsonb_build_object(
                'event_id', NEW.event_id,
                'request_id', NEW.id,
                'user_id', NEW.user_id
            ),
            NOW(),
            NOW(),
            false
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_join_request_changes
    AFTER INSERT ON event_join_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_join_request_changes();
