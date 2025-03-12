-- Function to verify Flutterwave transaction
CREATE OR REPLACE FUNCTION verify_flutterwave_transaction(
  p_reference text,
  p_amount integer,
  p_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction record;
  v_wallet_id bigint;
BEGIN
  -- Get transaction details
  SELECT * INTO v_transaction
  FROM transactions
  WHERE reference = p_reference
  AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Verify amount matches
  IF v_transaction.amount != p_amount THEN
    RETURN false;
  END IF;

  -- Update transaction status
  UPDATE transactions
  SET status = p_status,
      updated_at = now()
  WHERE id = v_transaction.id;

  -- If payment successful, credit wallet
  IF p_status = 'completed' THEN
    UPDATE wallets
    SET balance = balance + p_amount,
        updated_at = now()
    WHERE id = v_transaction.wallet_id;
  END IF;

  RETURN true;
END;
$$;
