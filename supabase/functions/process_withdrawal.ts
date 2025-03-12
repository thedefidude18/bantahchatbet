CREATE OR REPLACE FUNCTION process_withdrawal(
  p_withdrawal_id UUID
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_withdrawal record;
  v_wallet record;
  v_result jsonb;
BEGIN
  -- Get withdrawal details
  SELECT * INTO v_withdrawal
  FROM withdrawals
  WHERE id = p_withdrawal_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or already processed withdrawal');
  END IF;

  -- Update withdrawal status to processing
  UPDATE withdrawals
  SET status = 'processing',
      updated_at = NOW()
  WHERE id = p_withdrawal_id;

  -- Create transaction record if not exists
  INSERT INTO transactions (
    wallet_id,
    user_id,
    type,
    amount,
    status,
    reference,
    metadata
  )
  SELECT 
    v_withdrawal.wallet_id,
    w.user_id,
    'withdrawal',
    v_withdrawal.amount,
    'pending',
    v_withdrawal.reference,
    jsonb_build_object(
      'bank_name', v_withdrawal.bank_name,
      'account_name', v_withdrawal.account_name,
      'account_number', v_withdrawal.account_number,
      'balance_type', v_withdrawal.balance_type,
      'initiated_at', NOW()
    )
  FROM wallets w
  WHERE w.id = v_withdrawal.wallet_id
  ON CONFLICT (reference) DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Withdrawal processing initiated',
    'withdrawal_id', p_withdrawal_id
  );
END;
$$;