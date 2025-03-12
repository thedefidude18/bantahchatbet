-- Function to add balance to wallet
CREATE OR REPLACE FUNCTION add_to_wallet(
  p_wallet_id UUID,
  p_amount INTEGER,
  p_balance_type TEXT,
  p_type TEXT,
  p_reference TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_exists BOOLEAN;
  v_current_balance INTEGER;
BEGIN
  -- Check if wallet exists
  SELECT EXISTS (
    SELECT 1 FROM wallets WHERE id = p_wallet_id
  ) INTO v_wallet_exists;

  IF NOT v_wallet_exists THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  -- Update wallet balance
  IF p_balance_type = 'real' THEN
    UPDATE wallets 
    SET real_balance = real_balance + p_amount,
        updated_at = NOW()
    WHERE id = p_wallet_id
    RETURNING real_balance INTO v_current_balance;
  ELSE
    UPDATE wallets 
    SET bonus_balance = bonus_balance + p_amount,
        updated_at = NOW()
    WHERE id = p_wallet_id
    RETURNING bonus_balance INTO v_current_balance;
  END IF;

  -- Create transaction record
  INSERT INTO wallet_transactions (
    wallet_id,
    user_id,
    type,
    amount,
    balance_type,
    reference,
    status,
    metadata,
    balance_after
  ) VALUES (
    p_wallet_id,
    (SELECT user_id FROM wallets WHERE id = p_wallet_id),
    p_type,
    p_amount,
    p_balance_type,
    p_reference,
    'completed',
    jsonb_build_object(
      'operation', 'add',
      'processed_at', NOW()
    ),
    v_current_balance
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to deduct balance from wallet
CREATE OR REPLACE FUNCTION deduct_from_wallet(
  p_wallet_id UUID,
  p_amount INTEGER,
  p_balance_type TEXT,
  p_type TEXT,
  p_reference TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_exists BOOLEAN;
  v_current_balance INTEGER;
  v_available_balance INTEGER;
BEGIN
  -- Check if wallet exists
  SELECT EXISTS (
    SELECT 1 FROM wallets WHERE id = p_wallet_id
  ) INTO v_wallet_exists;

  IF NOT v_wallet_exists THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  -- Check available balance
  IF p_balance_type = 'real' THEN
    SELECT real_balance INTO v_available_balance
    FROM wallets WHERE id = p_wallet_id;
  ELSE
    SELECT bonus_balance INTO v_available_balance
    FROM wallets WHERE id = p_wallet_id;
  END IF;

  IF v_available_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Update wallet balance
  IF p_balance_type = 'real' THEN
    UPDATE wallets 
    SET real_balance = real_balance - p_amount,
        updated_at = NOW()
    WHERE id = p_wallet_id
    RETURNING real_balance INTO v_current_balance;
  ELSE
    UPDATE wallets 
    SET bonus_balance = bonus_balance - p_amount,
        updated_at = NOW()
    WHERE id = p_wallet_id
    RETURNING bonus_balance INTO v_current_balance;
  END IF;

  -- Create transaction record
  INSERT INTO wallet_transactions (
    wallet_id,
    user_id,
    type,
    amount,
    balance_type,
    reference,
    status,
    metadata,
    balance_after
  ) VALUES (
    p_wallet_id,
    (SELECT user_id FROM wallets WHERE id = p_wallet_id),
    p_type,
    p_amount,
    p_balance_type,
    p_reference,
    'completed',
    jsonb_build_object(
      'operation', 'deduct',
      'processed_at', NOW()
    ),
    v_current_balance
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to get wallet balance
CREATE OR REPLACE FUNCTION get_wallet_balance(p_user_id UUID)
RETURNS TABLE (
  real_balance INTEGER,
  bonus_balance INTEGER,
  currency TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.real_balance,
    w.bonus_balance,
    w.currency
  FROM wallets w
  WHERE w.user_id = p_user_id;
END;
$$;

-- Add RLS policies for the functions
ALTER FUNCTION add_to_wallet(UUID, INTEGER, TEXT, TEXT, TEXT) SECURITY DEFINER;
ALTER FUNCTION deduct_from_wallet(UUID, INTEGER, TEXT, TEXT, TEXT) SECURITY DEFINER;
ALTER FUNCTION get_wallet_balance(UUID) SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION add_to_wallet(UUID, INTEGER, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_from_wallet(UUID, INTEGER, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_wallet_balance(UUID) TO authenticated;

-- Create trigger to maintain wallet transaction history
CREATE OR REPLACE FUNCTION update_wallet_transaction_history()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the transaction with the current balance after the operation
  IF TG_OP = 'INSERT' THEN
    UPDATE wallet_transactions
    SET balance_after = (
      CASE 
        WHEN balance_type = 'real' THEN (SELECT real_balance FROM wallets WHERE id = NEW.wallet_id)
        ELSE (SELECT bonus_balance FROM wallets WHERE id = NEW.wallet_id)
      END
    )
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER wallet_transaction_history_trigger
AFTER INSERT ON wallet_transactions
FOR EACH ROW
EXECUTE FUNCTION update_wallet_transaction_history();

-- Function to transfer balance between wallets
CREATE OR REPLACE FUNCTION transfer_between_wallets(
  p_from_wallet_id UUID,
  p_to_wallet_id UUID,
  p_amount INTEGER,
  p_balance_type TEXT,
  p_reference TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_from_balance INTEGER;
  v_to_balance INTEGER;
  v_from_user_id UUID;
  v_to_user_id UUID;
  v_transaction_id UUID;
BEGIN
  -- Input validation
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid amount'
    );
  END IF;

  IF p_balance_type NOT IN ('real', 'bonus') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid balance type'
    );
  END IF;

  -- Get user IDs
  SELECT user_id INTO v_from_user_id FROM wallets WHERE id = p_from_wallet_id;
  SELECT user_id INTO v_to_user_id FROM wallets WHERE id = p_to_wallet_id;

  IF v_from_user_id IS NULL OR v_to_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid wallet IDs'
    );
  END IF;

  -- Check if user owns the source wallet
  IF v_from_user_id != auth.uid() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized'
    );
  END IF;

  -- Get current balances
  IF p_balance_type = 'real' THEN
    SELECT real_balance INTO v_from_balance FROM wallets WHERE id = p_from_wallet_id;
    SELECT real_balance INTO v_to_balance FROM wallets WHERE id = p_to_wallet_id;
  ELSE
    SELECT bonus_balance INTO v_from_balance FROM wallets WHERE id = p_from_wallet_id;
    SELECT bonus_balance INTO v_to_balance FROM wallets WHERE id = p_to_wallet_id;
  END IF;

  -- Check sufficient balance
  IF v_from_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance'
    );
  END IF;

  -- Begin transaction
  BEGIN
    -- Update source wallet
    IF p_balance_type = 'real' THEN
      UPDATE wallets 
      SET real_balance = real_balance - p_amount
      WHERE id = p_from_wallet_id;
    ELSE
      UPDATE wallets 
      SET bonus_balance = bonus_balance - p_amount
      WHERE id = p_from_wallet_id;
    END IF;

    -- Update destination wallet
    IF p_balance_type = 'real' THEN
      UPDATE wallets 
      SET real_balance = real_balance + p_amount
      WHERE id = p_to_wallet_id;
    ELSE
      UPDATE wallets 
      SET bonus_balance = bonus_balance + p_amount
      WHERE id = p_to_wallet_id;
    END IF;

    -- Record transactions
    INSERT INTO wallet_transactions (
      wallet_id,
      user_id,
      type,
      amount,
      balance_type,
      reference,
      metadata
    ) VALUES 
    (p_from_wallet_id, v_from_user_id, 'transfer_out', p_amount, p_balance_type, p_reference,
      jsonb_build_object(
        'to_wallet_id', p_to_wallet_id,
        'to_user_id', v_to_user_id
      )
    ),
    (p_to_wallet_id, v_to_user_id, 'transfer_in', p_amount, p_balance_type, p_reference,
      jsonb_build_object(
        'from_wallet_id', p_from_wallet_id,
        'from_user_id', v_from_user_id
      )
    )
    RETURNING id INTO v_transaction_id;

    RETURN jsonb_build_object(
      'success', true,
      'transaction_id', v_transaction_id,
      'from_wallet_id', p_from_wallet_id,
      'to_wallet_id', p_to_wallet_id,
      'amount', p_amount,
      'balance_type', p_balance_type,
      'reference', p_reference
    );

  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
  END;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION transfer_between_wallets(UUID, UUID, INTEGER, TEXT, TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION transfer_between_wallets(UUID, UUID, INTEGER, TEXT, TEXT) IS 
'Transfers balance between two wallets. Requires authentication and ownership of source wallet.';
