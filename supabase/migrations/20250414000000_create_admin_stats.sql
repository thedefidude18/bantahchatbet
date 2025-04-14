-- Create function to get admin dashboard stats
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
    total_events int;
    active_users int;
    total_groups int;
    pending_reports int;
    stats json;
BEGIN
    -- Get total active events
    SELECT COUNT(*) INTO total_events
    FROM events
    WHERE status = 'active';

    -- Get count of users active in last 7 days
    SELECT COUNT(DISTINCT user_id) INTO active_users
    FROM (
        SELECT user_id FROM events WHERE created_at > NOW() - INTERVAL '7 days'
        UNION
        SELECT user_id FROM event_participants WHERE joined_at > NOW() - INTERVAL '7 days'
        UNION
        SELECT sender_id FROM messages WHERE created_at > NOW() - INTERVAL '7 days'
    ) active_users;

    -- Get total active groups
    SELECT COUNT(*) INTO total_groups
    FROM events
    WHERE type = 'group' AND status = 'active';

    -- Get count of pending reports
    SELECT COUNT(*) INTO pending_reports
    FROM reports
    WHERE status = 'pending';

    -- Construct the stats JSON
    stats := json_build_object(
        'totalEvents', total_events,
        'activeUsers', active_users,
        'totalGroups', total_groups,
        'pendingReports', pending_reports
    );

    RETURN stats;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;

-- Create RLS policy to ensure only admins can execute this function
CREATE OR REPLACE FUNCTION public.check_is_admin() RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the current user has admin privileges
    RETURN EXISTS (
        SELECT 1 
        FROM users 
        WHERE id = auth.uid() 
        AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;