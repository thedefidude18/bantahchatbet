-- Create wallet types enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE wallet_balance_type AS ENUM ('real', 'bonus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    real_balance DECIMAL(10,2) DEFAULT 0,
    bonus_balance DECIMAL(10,2) DEFAULT 1000,
    currency TEXT DEFAULT 'NGN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_type wallet_balance_type NOT NULL,
    reference TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own wallet"
    ON wallets FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions"
    ON wallet_transactions FOR SELECT
    TO authenticated
    USING (wallet_id IN (
        SELECT id FROM wallets WHERE user_id = auth.uid()
    ));

-- Create function to handle wallet deductions
CREATE OR REPLACE FUNCTION deduct_from_wallet(
    p_wallet_id UUID,
    p_amount DECIMAL,
    p_type TEXT,
    p_reference TEXT,
    p_description TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_wallet wallets%ROWTYPE;
    v_remaining DECIMAL;
BEGIN
    -- Get wallet with row lock
    SELECT * FROM wallets 
    WHERE id = p_wallet_id 
    FOR UPDATE;

    -- Try bonus balance first
    IF v_wallet.bonus_balance >= p_amount THEN
        UPDATE wallets 
        SET bonus_balance = bonus_balance - p_amount
        WHERE id = p_wallet_id;
        
        INSERT INTO wallet_transactions (
            wallet_id, type, amount, balance_type, reference, description
        ) VALUES (
            p_wallet_id, p_type, p_amount, 'bonus', p_reference, p_description
        );
        
        RETURN TRUE;
    END IF;

    -- Calculate remaining amount needed from real balance
    v_remaining := p_amount - v_wallet.bonus_balance;
    
    IF v_wallet.real_balance >= v_remaining THEN
        -- Use all bonus balance and partial real balance
        UPDATE wallets 
        SET bonus_balance = 0,
            real_balance = real_balance - v_remaining
        WHERE id = p_wallet_id;
        
        INSERT INTO wallet_transactions (
            wallet_id, type, amount, balance_type, reference, description
        ) VALUES 
        (p_wallet_id, p_type, v_wallet.bonus_balance, 'bonus', p_reference, p_description),
        (p_wallet_id, p_type, v_remaining, 'real', p_reference, p_description);
        
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create function to add funds to wallet
CREATE OR REPLACE FUNCTION add_to_wallet(
    p_wallet_id UUID,
    p_amount DECIMAL,
    p_balance_type wallet_balance_type,
    p_type TEXT,
    p_reference TEXT,
    p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_wallet wallets%ROWTYPE;
BEGIN
    -- Get wallet with row lock
    SELECT * INTO v_wallet 
    FROM wallets 
    WHERE id = p_wallet_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Update appropriate balance
    IF p_balance_type = 'real' THEN
        UPDATE wallets 
        SET real_balance = real_balance + p_amount
        WHERE id = p_wallet_id;
    ELSE
        UPDATE wallets 
        SET bonus_balance = bonus_balance + p_amount
        WHERE id = p_wallet_id;
    END IF;

    -- Record transaction
    INSERT INTO wallet_transactions (
        wallet_id, 
        type, 
        amount, 
        balance_type, 
        reference, 
        description
    ) VALUES (
        p_wallet_id, 
        p_type, 
        p_amount, 
        p_balance_type, 
        p_reference, 
        p_description
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create additional wallet policies for security
CREATE POLICY "Users can update their own wallet"
    ON wallets FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert transactions for their wallet"
    ON wallet_transactions FOR INSERT
    TO authenticated
    WITH CHECK (
        wallet_id IN (
            SELECT id FROM wallets 
            WHERE user_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference ON wallet_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
