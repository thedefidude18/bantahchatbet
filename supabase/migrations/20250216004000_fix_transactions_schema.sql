-- First, let's check if the table exists and recreate if needed
DO $$ 
BEGIN
    -- Drop existing table if it exists
    DROP TABLE IF EXISTS transactions CASCADE;
    
    -- Recreate the table
    CREATE TABLE transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        wallet_id UUID NOT NULL,
        user_id UUID NOT NULL,
        type TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        reference TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Add constraints
    ALTER TABLE transactions 
        ADD CONSTRAINT fk_wallet 
        FOREIGN KEY (wallet_id) 
        REFERENCES wallets(id);

    ALTER TABLE transactions 
        ADD CONSTRAINT fk_user 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id);

    ALTER TABLE transactions 
        ADD CONSTRAINT check_type 
        CHECK (type IN ('deposit', 'withdrawal', 'transfer'));

    ALTER TABLE transactions 
        ADD CONSTRAINT check_status 
        CHECK (status IN ('pending', 'completed', 'failed'));

    ALTER TABLE transactions 
        ADD CONSTRAINT check_amount 
        CHECK (amount > 0);

    -- Create indices
    CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id 
        ON transactions(wallet_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id 
        ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_reference 
        ON transactions(reference);

    -- Enable RLS
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

END $$;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;

-- Recreate policies
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own transactions"
    ON transactions FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Grant necessary permissions
GRANT ALL ON transactions TO postgres;
GRANT SELECT, INSERT, UPDATE ON transactions TO authenticated;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';

-- Verify the structure
DO $$ 
BEGIN
    RAISE NOTICE 'Verifying transactions table structure...';
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'user_id'
    ) THEN
        RAISE EXCEPTION 'user_id column is missing!';
    END IF;
END $$;