-- Create or replace the view for event participants with details
CREATE OR REPLACE VIEW public.event_participants_with_details AS
SELECT 
    ep.*,
    e.title as event_title,
    e.description as event_description,
    e.category as event_category,
    e.start_time as event_start_time,
    e.end_time as event_end_time,
    e.wager_amount,
    e.status as event_status,
    u.username as creator_username,
    u.raw_user_meta_data->>'avatar_url' as creator_avatar_url
FROM 
    public.event_participants ep
    JOIN public.events e ON ep.event_id = e.id
    JOIN auth.users u ON e.creator_id = u.id;

-- Grant access to the view
GRANT SELECT ON public.event_participants_with_details TO authenticated;

-- Create policy for the view
CREATE POLICY "Users can view their own event participation details"
    ON public.event_participants_with_details
    FOR SELECT
    USING (user_id = auth.uid());

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';