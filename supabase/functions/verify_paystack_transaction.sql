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
  v_transaction_id UUID;
BEGIN
  -- Get wallet ID for current user
  SELECT w.id, w.user_id INTO v_wallet_id, v_user_id
  FROM wallets w
  WHERE w.user_id = auth.uid();

  IF v_wallet_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Wallet not found');
  END IF;

  -- Record transaction
  INSERT INTO transactions (
    wallet_id,
    user_id,
    amount,
    type,
    status,
    reference,
    payment_provider
  ) VALUES (
    v_wallet_id,
    v_user_id,
    p_amount,
    'deposit',
    'completed',
    p_reference,
    'paystack'
  ) RETURNING id INTO v_transaction_id;

  -- Update wallet balance
  UPDATE wallets 
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE id = v_wallet_id;

  RETURN jsonb_build_object(
    'success', true,
    'wallet_id', v_wallet_id,
    'amount', p_amount
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION verify_paystack_transaction(TEXT, INTEGER, TEXT, TEXT) TO authenticated;
