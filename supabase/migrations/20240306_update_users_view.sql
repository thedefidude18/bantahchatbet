CREATE OR REPLACE VIEW users_view AS
SELECT 
    id,
    raw_user_meta_data->>'name' as name,
    raw_user_meta_data->>'avatar_url' as avatar_url,
    raw_user_meta_data->>'username' as username
FROM auth.users;

-- Add status and last_seen columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
ADD COLUMN IF NOT EXISTS last_seen timestamptz DEFAULT now();

-- Create function to update last_seen
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS trigger AS $$
BEGIN
  NEW.last_seen = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_seen
CREATE TRIGGER update_user_last_seen
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_seen();
