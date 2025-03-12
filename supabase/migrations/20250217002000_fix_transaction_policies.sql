-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;

-- Create policies for transactions table
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR 
    wallet_id IN (
        SELECT id FROM wallets WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their own transactions"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid() AND
    wallet_id IN (
        SELECT id FROM wallets WHERE user_id = auth.uid()
    )
);

-- Grant necessary permissions
GRANT SELECT, INSERT ON transactions TO authenticated;