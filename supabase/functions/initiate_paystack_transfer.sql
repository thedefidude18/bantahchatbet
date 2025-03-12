CREATE OR REPLACE FUNCTION initiate_paystack_transfer(
  p_amount INTEGER,
  p_reference TEXT,
  p_bank_name TEXT,
  p_account_number TEXT,
  p_account_name TEXT,
  p_balance_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_user_id UUID;
  v_available_balance DECIMAL;
  v_transaction_id UUID;
BEGIN
  -- Get wallet ID for current user
  SELECT w.id, w.user_id INTO v_wallet_id, v_user_id
  FROM wallets w
  WHERE w.user_id = auth.uid();

  IF v_wallet_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Wallet not found');
  END IF;

  -- Check available balance based on balance_type
  IF p_balance_type = 'real' THEN
    SELECT balance INTO v_available_balance
    FROM wallets
    WHERE id = v_wallet_id;
  ELSE
    SELECT bonus_balance INTO v_available_balance
    FROM wallets
    WHERE id = v_wallet_id;
  END IF;

  IF v_available_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance');
  END IF;

  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    wallet_id,
    amount,
    type,
    status,
    reference,
    payment_provider,
    metadata
  ) VALUES (
    v_user_id,
    v_wallet_id,
    p_amount,
    'withdrawal',
    'pending',
    p_reference,
    'paystack',
    jsonb_build_object(
      'bank_name', p_bank_name,
      'account_number', p_account_number,
      'account_name', p_account_name,
      'balance_type', p_balance_type,
      'initiated_at', NOW()
    )
  ) RETURNING id INTO v_transaction_id;

  -- Update wallet balance
  IF p_balance_type = 'real' THEN
    UPDATE wallets 
    SET balance = balance - p_amount,
        updated_at = NOW()
    WHERE id = v_wallet_id;
  ELSE
    UPDATE wallets 
    SET bonus_balance = bonus_balance - p_amount,
        updated_at = NOW()
    WHERE id = v_wallet_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'reference', p_reference,
    'message', 'Transfer initiated successfully'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION initiate_paystack_transfer(INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
