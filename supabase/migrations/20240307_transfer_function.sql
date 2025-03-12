CREATE OR REPLACE FUNCTION transfer_funds(
  p_recipient_id UUID,
  p_amount INT,
  p_balance_type TEXT DEFAULT 'real'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sender_wallet_id UUID;
  v_recipient_wallet_id UUID;
  v_sender_balance INT;
BEGIN
  -- Get sender's wallet (from authenticated user)
  SELECT id, CASE 
    WHEN p_balance_type = 'real' THEN real_balance 
    ELSE bonus_balance 
  END
  INTO v_sender_wallet_id, v_sender_balance
  FROM wallets
  WHERE user_id = auth.uid();

  -- Check if sender has sufficient balance
  IF v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Get recipient's wallet
  SELECT id INTO v_recipient_wallet_id
  FROM wallets
  WHERE user_id = p_recipient_id;

  -- Perform the transfer
  IF p_balance_type = 'real' THEN
    UPDATE wallets
    SET real_balance = real_balance - p_amount
    WHERE id = v_sender_wallet_id;

    UPDATE wallets
    SET real_balance = real_balance + p_amount
    WHERE id = v_recipient_wallet_id;
  ELSE
    UPDATE wallets
    SET bonus_balance = bonus_balance - p_amount
    WHERE id = v_sender_wallet_id;

    UPDATE wallets
    SET bonus_balance = bonus_balance + p_amount
    WHERE id = v_recipient_wallet_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Transfer successful'
  );
END;
$$;