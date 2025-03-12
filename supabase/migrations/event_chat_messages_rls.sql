-- Enable RLS
alter table "public"."event_chat_messages" enable row level security;

-- Policy for reading messages
create policy "Users can read event messages"
  on "public"."event_chat_messages"
  for select
  using (true);  -- Anyone can read messages

-- Policy for creating messages
create policy "Users can create event messages"
  on "public"."event_chat_messages"
  for insert
  with check (
    auth.uid() = sender_id  -- Only authenticated user can create messages as themselves
  );