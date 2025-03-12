-- Test the exact same search pattern we're using in the code
SELECT id, username, name, avatar_url
FROM users_view
WHERE username ILIKE '%er%' OR name ILIKE '%er%'
LIMIT 5;

-- Check for any non-null usernames or names
SELECT id, username, name
FROM users_view
WHERE username IS NOT NULL OR name IS NOT NULL
LIMIT 5;