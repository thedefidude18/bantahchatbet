CREATE OR REPLACE FUNCTION verify_flutterwave_transaction(
  p_reference TEXT,
  p_amount DECIMAL,
  p_status TEXT,
  p_transaction_id TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_user_id UUID;
  v_transaction RECORD;
BEGIN
  -- Get wallet and user ID
  SELECT w.id, w.user_id INTO v_wallet_id, v_user_id
  FROM wallets w
  WHERE w.user_id = auth.uid();

  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;

  -- Create transaction record
  INSERT INTO transactions (
    wallet_id,
    user_id,
    amount,
    type,
    status,
    reference,
    metadata
  ) VALUES (
    v_wallet_id,
    v_user_id,
    p_amount,
    'deposit',
    p_status,
    p_reference,
    jsonb_build_object(
      'provider', 'flutterwave',
      'transaction_id', p_transaction_id
    )
  ) RETURNING * INTO v_transaction;

  -- Rest of the function...
END;
$$;