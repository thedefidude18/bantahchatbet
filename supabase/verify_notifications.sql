-- First verify the table structure
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'notifications'
ORDER BY 
    ordinal_position;

-- Insert a test notification
INSERT INTO notifications (
    user_id,
    type,  -- or notification_type depending on the actual column name
    title,
    content,
    metadata
)
VALUES (
    '12585be1-2eae-4640-91a2-401b92a4b45d',
    'system_update',
    'Test Notification',
    'This is a test notification',
    '{"source": "verification_test"}'::jsonb
)
RETURNING *;

-- Verify the notification was inserted and is visible to the user
SELECT 
    id,
    user_id,
    type,  -- or notification_type
    title,
    content,
    created_at,
    read_at
FROM 
    notifications
WHERE 
    user_id = '12585be1-2eae-4640-91a2-401b92a4b45d'
ORDER BY 
    created_at DESC;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM 
    pg_policies
WHERE 
    tablename = 'notifications';
