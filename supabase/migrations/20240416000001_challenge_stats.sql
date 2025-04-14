-- Get comprehensive challenge statistics
CREATE OR REPLACE FUNCTION get_challenge_stats()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    result json;
BEGIN
    WITH challenge_metrics AS (
        SELECT 
            COUNT(*) as total_challenges,
            COUNT(*) FILTER (WHERE status = 'accepted') as active_challenges,
            COUNT(*) FILTER (WHERE status = 'completed') as completed_challenges,
            COALESCE(SUM(amount), 0) as total_volume,
            COALESCE(AVG(amount), 0) as avg_amount
        FROM challenges
    ),
    game_stats AS (
        SELECT 
            game_type,
            COUNT(*) as count
        FROM challenges
        GROUP BY game_type
        ORDER BY count DESC
        LIMIT 5
    ),
    recent_outcomes AS (
        SELECT 
            c.id,
            c.title,
            c.winner_id,
            c.amount,
            c.completed_at,
            profiles.name as winner_name
        FROM challenges c
        JOIN profiles ON profiles.id = c.winner_id
        WHERE c.status = 'completed'
        ORDER BY c.completed_at DESC
        LIMIT 5
    )
    SELECT json_build_object(
        'totalChallenges', cm.total_challenges,
        'activeChallenges', cm.active_challenges,
        'completedChallenges', cm.completed_challenges,
        'totalVolume', cm.total_volume,
        'avgAmount', cm.avg_amount,
        'popularGameTypes', (
            SELECT json_agg(
                json_build_object(
                    'game_type', game_type,
                    'count', count
                )
            )
            FROM game_stats
        ),
        'recentOutcomes', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'title', title,
                    'winner_id', winner_id,
                    'amount', amount,
                    'completed_at', completed_at,
                    'winner', json_build_object('name', winner_name)
                )
            )
            FROM recent_outcomes
        )
    )
    INTO result
    FROM challenge_metrics cm;

    RETURN result;
END;
$$;