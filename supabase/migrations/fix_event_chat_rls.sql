-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert messages to their events" ON public.event_chat_messages;
DROP POLICY IF EXISTS "Users can view messages of their events" ON public.event_chat_messages;

-- Create new RLS policies
CREATE POLICY "Allow chat access for public events"
ON public.event_chat_messages
FOR SELECT
USING (
    -- Allow if it's a public event
    EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = event_chat_messages.event_id
        AND e.is_private = false
    )
);

CREATE POLICY "Allow message creation for authenticated users"
ON public.event_chat_messages
FOR INSERT
WITH CHECK (
    -- User must be authenticated
    auth.uid() IS NOT NULL
    AND
    -- Event must be public
    EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = event_id
        AND e.is_private = false
    )
);

-- Grant necessary permissions
GRANT ALL ON public.event_chat_messages TO authenticated;
GRANT ALL ON public.event_chat_messages_with_sender TO authenticated;
