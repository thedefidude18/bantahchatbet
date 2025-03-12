-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can update their own wallet" ON wallets;

-- Create policies for wallets table
CREATE POLICY "Users can view their own wallet"
ON wallets FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
ON wallets FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS on wallets table
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;