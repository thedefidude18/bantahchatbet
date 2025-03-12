CREATE TABLE withdrawals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_id UUID REFERENCES wallets(id) NOT NULL,
    amount DECIMAL NOT NULL,
    balance_type TEXT NOT NULL CHECK (balance_type IN ('real', 'bonus')),
    reference TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own withdrawals"
    ON withdrawals FOR SELECT
    USING (wallet_id IN (
        SELECT id FROM wallets WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create withdrawal requests"
    ON withdrawals FOR INSERT
    WITH CHECK (wallet_id IN (
        SELECT id FROM wallets WHERE user_id = auth.uid()
    ));

-- Create trigger to update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();