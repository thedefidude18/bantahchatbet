-- Ensure proper permissions for private messages
GRANT ALL ON public.private_messages TO authenticated;

-- Create policy for inserting messages
CREATE POLICY "Users can insert their own messages"
    ON public.private_messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Create policy for viewing messages
CREATE POLICY "Users can view messages they're involved in"
    ON public.private_messages
    FOR SELECT
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id
    );

-- Grant permissions for the views
GRANT SELECT ON public.users_view TO authenticated;
GRANT SELECT ON public.messages_with_users TO authenticated;