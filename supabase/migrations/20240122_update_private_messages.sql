-- First, ensure we have all the needed columns and constraints
ALTER TABLE public.private_messages
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Drop existing constraints if they exist
ALTER TABLE public.private_messages
  DROP CONSTRAINT IF EXISTS private_messages_sender_id_fkey,
  DROP CONSTRAINT IF EXISTS private_messages_receiver_id_fkey;

-- Add constraints back with proper references
ALTER TABLE public.private_messages
  ADD CONSTRAINT private_messages_sender_id_fkey 
    FOREIGN KEY (sender_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT private_messages_receiver_id_fkey 
    FOREIGN KEY (receiver_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_private_messages_sender_id ON public.private_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_receiver_id ON public.private_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_created_at ON public.private_messages(created_at);

-- Update RLS policies
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their private messages" ON public.private_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.private_messages;

CREATE POLICY "Users can read their private messages"
ON public.private_messages FOR SELECT
TO authenticated
USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
);

CREATE POLICY "Users can insert their own messages"
ON public.private_messages FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = sender_id
);

-- Grant necessary permissions
GRANT ALL ON public.private_messages TO authenticated;