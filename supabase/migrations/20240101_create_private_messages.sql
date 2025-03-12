-- Create private messages table
CREATE TABLE IF NOT EXISTS public.private_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    receiver_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_private_messages_sender_id ON public.private_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_receiver_id ON public.private_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_created_at ON public.private_messages(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own messages
CREATE POLICY "Users can insert their own messages"
ON public.private_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Policy to allow users to read messages they've sent or received
CREATE POLICY "Users can view their own messages"
ON public.private_messages FOR SELECT
TO authenticated
USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
);

-- Grant access to authenticated users
GRANT ALL ON public.private_messages TO authenticated;

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';