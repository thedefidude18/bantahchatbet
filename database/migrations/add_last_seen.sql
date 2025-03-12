-- Add last_seen column
ALTER TABLE user_profiles 
ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for better performance
CREATE INDEX idx_user_profiles_last_seen ON user_profiles(last_seen);

-- Update existing rows with current timestamp
UPDATE user_profiles SET last_seen = NOW();
