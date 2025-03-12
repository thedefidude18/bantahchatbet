-- Create private messages table
CREATE TABLE IF NOT EXISTS public.private_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES public.users(id),
    receiver_id UUID NOT NULL REFERENCES public.users(id),
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their private messages"
ON public.private_messages FOR SELECT
USING (
    auth.uid() IN (sender_id, receiver_id)
);

CREATE POLICY "Users can insert their own messages"
ON public.private_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
);

-- Add indexes for better performance
CREATE INDEX private_messages_sender_id_idx ON public.private_messages(sender_id);
CREATE INDEX private_messages_receiver_id_idx ON public.private_messages(receiver_id);
CREATE INDEX private_messages_created_at_idx ON public.private_messages(created_at);