-- Ensure notification_type column exists and has correct data
BEGIN;

-- Add notification_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'notifications'
        AND column_name = 'notification_type'
    ) THEN
        ALTER TABLE notifications ADD COLUMN notification_type text NOT NULL DEFAULT 'system';
    END IF;
END $$;

-- Copy data from type to notification_type if type exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'notifications'
        AND column_name = 'type'
    ) THEN
        UPDATE notifications
        SET notification_type = type
        WHERE notification_type IS NULL;
        
        ALTER TABLE notifications DROP COLUMN type;
    END IF;
END $$;

-- Set default value for any null notification_type
UPDATE notifications
SET notification_type = 'system'
WHERE notification_type IS NULL;

-- Add NOT NULL constraint
ALTER TABLE notifications
ALTER COLUMN notification_type SET NOT NULL;

COMMIT;