-- Add last_seen column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);

-- Create function to update last_seen
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET last_seen = NOW()
    WHERE id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function for client heartbeat
CREATE OR REPLACE FUNCTION update_user_heartbeat()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE users
    SET last_seen = NOW()
    WHERE id = auth.uid();
END;
$$;

-- Grant execute permission on the heartbeat function
GRANT EXECUTE ON FUNCTION update_user_heartbeat() TO authenticated;

-- Create triggers for various user activities
CREATE TRIGGER update_user_last_seen_messages
AFTER INSERT OR UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_last_seen();

CREATE TRIGGER update_user_last_seen_events
AFTER INSERT OR UPDATE ON event_participants
FOR EACH ROW
EXECUTE FUNCTION update_last_seen();

CREATE TRIGGER update_user_last_seen_chats
AFTER INSERT OR UPDATE ON chat_participants
FOR EACH ROW
EXECUTE FUNCTION update_last_seen();

CREATE TRIGGER update_user_last_seen_notifications
AFTER INSERT OR UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_last_seen();

CREATE TRIGGER update_user_last_seen_withdrawals
AFTER INSERT OR UPDATE ON withdrawals
FOR EACH ROW
EXECUTE FUNCTION update_last_seen();

CREATE TRIGGER update_user_last_seen_wallet
AFTER INSERT OR UPDATE ON wallets
FOR EACH ROW
EXECUTE FUNCTION update_last_seen();

-- Create trigger for auth.users to update last_seen on login
CREATE OR REPLACE FUNCTION update_last_seen_on_auth()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET last_seen = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_last_seen_auth
AFTER UPDATE OF last_sign_in_at ON auth.users
FOR EACH ROW
EXECUTE FUNCTION update_last_seen_on_auth();
