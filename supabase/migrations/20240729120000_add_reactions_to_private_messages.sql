-- Add reactions column to private_messages table
ALTER TABLE public.private_messages
ADD COLUMN reactions JSONB DEFAULT '{}'::jsonb;

-- Optional: Add GIN index for better performance querying the JSONB column
-- CREATE INDEX idx_private_messages_reactions ON public.private_messages USING GIN (reactions);