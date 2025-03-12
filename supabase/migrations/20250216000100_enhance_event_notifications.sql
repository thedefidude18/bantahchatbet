-- Create or replace function to handle event participation notifications
CREATE OR REPLACE FUNCTION handle_event_participation()
RETURNS TRIGGER AS $$
DECLARE
    event_record RECORD;
    participant_count INTEGER;
BEGIN
    -- Get event details
    SELECT e.*, u.username 
    INTO event_record 
    FROM events e 
    JOIN auth.users u ON e.creator_id = u.id 
    WHERE e.id = NEW.event_id;

    -- Get current participant count
    SELECT COUNT(*) 
    INTO participant_count 
    FROM event_participants 
    WHERE event_id = NEW.event_id;

    -- Notify creator about new participant
    IF (TG_OP = 'INSERT') THEN
        -- Notification for event creator
        INSERT INTO notifications (
            user_id,
            type,
            title,
            content,
            metadata
        ) VALUES (
            event_record.creator_id,
            'event_participation'::notification_type,
            'New Event Participant',
            format('%s joined your event: %s', (SELECT username FROM auth.users WHERE id = NEW.user_id), event_record.title),
            jsonb_build_object(
                'event_id', NEW.event_id,
                'participant_id', NEW.user_id,
                'participant_count', participant_count
            )
        );

        -- Notification for participant
        INSERT INTO notifications (
            user_id,
            type,
            title,
            content,
            metadata
        ) VALUES (
            NEW.user_id,
            'event_joined'::notification_type,
            'Successfully Joined Event',
            format('You have joined the event: %s', event_record.title),
            jsonb_build_object(
                'event_id', NEW.event_id,
                'creator_id', event_record.creator_id,
                'event_title', event_record.title
            )
        );

        -- Check for milestones
        IF participant_count IN (10, 50, 100) THEN
            INSERT INTO notifications (
                user_id,
                type,
                title,
                content,
                metadata
            ) VALUES (
                event_record.creator_id,
                'event_milestone'::notification_type,
                'Event Milestone Reached! 🎉',
                format('Your event "%s" has reached %s participants!', event_record.title, participant_count),
                jsonb_build_object(
                    'event_id', NEW.event_id,
                    'participant_count', participant_count
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for event participation
DROP TRIGGER IF EXISTS on_event_participation ON event_participants;
CREATE TRIGGER on_event_participation
    AFTER INSERT ON event_participants
    FOR EACH ROW
    EXECUTE FUNCTION handle_event_participation();
