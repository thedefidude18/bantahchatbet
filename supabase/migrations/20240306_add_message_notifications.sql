[plugin:vite:import-analysis] Failed to resolve import "../hooks/useSocket" from "src/components/EventChat.tsx". Does the file exist?
C:/Users/MIKKI/Documents/bantahchatbet/src/components/EventChat.tsx:2:26
17 |  var _s = $RefreshSig$();

18 | import { useEffect, useState, useRef } from "react";

19 | import { useSocket } from "../hooks/useSocket";

|                             ^
20 |  import { useSupabase } from "../hooks/useSupabase";

21 |  export const EventChat = ({ eventId, isParticipant }) => {
    at TransformPluginContext._formatError (file:///C:/Users/MIKKI/Documents/bantahchatbet/node_modules/vite/dist/node/chunks/dep-CHZK6zbr.js:49257:41)
    at TransformPluginContext.error (file:///C:/Users/MIKKI/Documents/bantahchatbet/node_modules/vite/dist/node/chunks/dep-CHZK6zbr.js:49252:16)
    at normalizeUrl (file:///C:/Users/MIKKI/Documents/bantahchatbet/node_modules/vite/dist/node/chunks/dep-CHZK6zbr.js:64199:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async file:///C:/Users/MIKKI/Documents/bantahchatbet/node_modules/vite/dist/node/chunks/dep-CHZK6zbr.js:64331:39
    at async Promise.all (index 4)
    at async TransformPluginContext.transform (file:///C:/Users/MIKKI/Documents/bantahchatbet/node_modules/vite/dist/node/chunks/dep-CHZK6zbr.js:64258:7)
    at async PluginContainer.transform (file:///C:/Users/MIKKI/Documents/bantahchatbet/node_modules/vite/dist/node/chunks/dep-CHZK6zbr.js:49098:18)
    at async loadAndTransform (file:///C:/Users/MIKKI/Documents/bantahchatbet/node_modules/vite/dist/node/chunks/dep-CHZK6zbr.js:51931:27)
    at async viteTransformMiddleware (file:///C:/Users/MIKKI/Documents/bantahchatbet/node_modules/vite/dist/node/chunks/dep-CHZK6zbr.js:62031:24
Click outside, press Esc key, or fix the code to dismiss.
You can also disable this overlay by setting server.hmr.overlay to false in vite.config.ts.-- Update private_messages table to include read status
ALTER TABLE private_messages
ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

-- Create friend_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    receiver_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- Add RLS policies for friend_requests
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friend requests"
    ON friend_requests
    FOR SELECT
    TO authenticated
    USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send friend requests"
    ON friend_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received friend requests"
    ON friend_requests
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = receiver_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for friend_requests
CREATE TRIGGER update_friend_requests_updated_at
    BEFORE UPDATE ON friend_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();