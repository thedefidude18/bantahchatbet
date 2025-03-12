alter table "public"."event_chat_messages"
  add constraint "event_chat_messages_sender_id_fkey" 
  foreign key ("sender_id") 
  references "public"."users"("id");