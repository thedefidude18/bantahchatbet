CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    real_balance INTEGER NOT NULL DEFAULT 0,
    bonus_balance INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'NGN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS wallets_user_id_idx ON wallets(user_id);

-- Add user_id column to transactions if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE transactions 
        ADD COLUMN user_id UUID REFERENCES auth.users(id);

        -- Update existing records to set user_id from wallets table
        UPDATE transactions t 
        SET user_id = w.user_id 
        FROM wallets w 
        WHERE t.wallet_id = w.id;

        -- Make user_id NOT NULL after backfilling
        ALTER TABLE transactions 
        ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;

-- Check and create foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_wallet_id_fkey'
  ) THEN
    ALTER TABLE transactions
    ADD CONSTRAINT transactions_wallet_id_fkey
    FOREIGN KEY (wallet_id) REFERENCES wallets(id);
  END IF;
END $$;

-- Verify wallet columns
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'wallets' 
    AND column_name = 'real_balance'
  ) THEN
    ALTER TABLE wallets
    ADD COLUMN real_balance INTEGER NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'wallets' 
    AND column_name = 'bonus_balance'
  ) THEN
    ALTER TABLE wallets
    ADD COLUMN bonus_balance INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Update RLS policies to include user_id
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
USING (
    user_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
CREATE POLICY "Users can insert their own transactions"
ON transactions FOR INSERT
WITH CHECK (
    user_id = auth.uid()
);

-- Update the handle_flutterwave_transaction function
CREATE OR REPLACE FUNCTION handle_flutterwave_transaction(
  p_reference TEXT,
  p_amount DECIMAL,
  p_status TEXT,
  p_transaction_id TEXT,
  p_response JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_user_id UUID;
  v_success BOOLEAN;
BEGIN
  -- Get the user's wallet
  SELECT id, user_id 
  INTO v_wallet_id, v_user_id 
  FROM wallets 
  WHERE user_id = auth.uid();

  IF v_wallet_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Wallet not found'
    );
  END IF;

  -- Check for duplicate transaction
  IF EXISTS (
    SELECT 1 FROM wallet_transactions 
    WHERE reference = p_reference 
    AND status = 'completed'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Transaction already processed'
    );
  END IF;

  -- Add funds to wallet
  SELECT add_to_wallet(
    v_wallet_id,
    (p_amount * 100)::INTEGER, -- Convert to kobo
    'real',
    'deposit',
    p_reference
  ) INTO v_success;

  IF NOT v_success THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Failed to update wallet balance'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'wallet_id', v_wallet_id,
    'amount', p_amount,
    'reference', p_reference,
    'transaction_id', p_transaction_id
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION handle_flutterwave_transaction(TEXT, DECIMAL, TEXT, TEXT, JSONB) TO authenticated;

-- Update the verification function with correct parameters
CREATE OR REPLACE FUNCTION verify_flutterwave_transaction(
  p_reference TEXT,
  p_amount INTEGER,
  p_status TEXT,
  p_transaction_id TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_user_id UUID;
  v_success BOOLEAN;
BEGIN
  -- Get wallet and user ID
  SELECT w.id, w.user_id INTO v_wallet_id, v_user_id
  FROM wallets w
  WHERE w.user_id = auth.uid();

  IF v_wallet_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Wallet not found'
    );
  END IF;

  -- Add amount to wallet
  SELECT * FROM add_to_wallet(
    v_wallet_id,
    p_amount,
    'deposit',
    p_reference,
    p_transaction_id
  ) INTO v_success;

  IF NOT v_success THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Failed to update wallet balance'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'wallet_id', v_wallet_id,
    'amount', p_amount,
    'reference', p_reference,
    'transaction_id', p_transaction_id
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION verify_flutterwave_transaction(TEXT, INTEGER, TEXT, TEXT) TO authenticated;

-- Function to verify and process Paystack transactions
CREATE OR REPLACE FUNCTION verify_paystack_transaction(
  p_reference TEXT,
  p_amount INTEGER,
  p_status TEXT,
  p_transaction_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_user_id UUID;
  v_success BOOLEAN;
BEGIN
  -- Get wallet and user ID
  SELECT w.id, w.user_id INTO v_wallet_id, v_user_id
  FROM wallets w
  WHERE w.user_id = auth.uid();

  IF v_wallet_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Wallet not found'
    );
  END IF;

  -- Record the transaction first
  INSERT INTO transactions (
    wallet_id,
    user_id,
    amount,
    type,
    status,
    reference,
    payment_provider,
    provider_reference
  ) VALUES (
    v_wallet_id,
    v_user_id,
    p_amount,
    'deposit',
    p_status,
    p_reference,
    'paystack',
    p_transaction_id
  );

  -- Add amount to wallet if status is completed
  IF p_status = 'completed' THEN
    UPDATE wallets 
    SET real_balance = real_balance + p_amount,
        updated_at = NOW()
    WHERE id = v_wallet_id;

    -- Record in wallet transactions
    INSERT INTO wallet_transactions (
      wallet_id,
      user_id,
      type,
      amount,
      balance_type,
      reference,
      status
    ) VALUES (
      v_wallet_id,
      v_user_id,
      'deposit',
      p_amount,
      'real',
      p_reference,
      'completed'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'wallet_id', v_wallet_id,
    'amount', p_amount,
    'reference', p_reference
  );
END;
$$;
