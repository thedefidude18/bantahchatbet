-- Create secure storage for Flutterwave configuration
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert Flutterwave secret key (encrypted)
INSERT INTO app_config (key, value) 
VALUES (
  'flutterwave_secret_key',
  pgp_sym_encrypt(
    'FLWSECK_TEST-30a41d7cd39be9f022def6e47e8b396b-X',
    current_setting('app.settings.jwt_secret')
  )::text
) ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value,
    updated_at = now();

-- Function to handle Flutterwave transaction
CREATE OR REPLACE FUNCTION handle_flutterwave_transaction(
  p_reference TEXT,
  p_amount DECIMAL,
  p_status TEXT,
  p_transaction_id TEXT,
  p_response JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_transaction RECORD;
BEGIN
  -- Get the transaction and lock it
  SELECT * INTO v_transaction
  FROM transactions
  WHERE reference = p_reference
  AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Get wallet ID
  SELECT id INTO v_wallet_id
  FROM wallets
  WHERE id = v_transaction.wallet_id
  FOR UPDATE;

  -- Update transaction status
  UPDATE transactions
  SET 
    status = p_status,
    metadata = jsonb_build_object(
      'provider', 'flutterwave',
      'transaction_id', p_transaction_id,
      'response', p_response
    ),
    updated_at = now()
  WHERE reference = p_reference;

  -- If payment successful, credit wallet
  IF p_status = 'completed' THEN
    -- Update wallet balance
    UPDATE wallets
    SET 
      balance = balance + p_amount,
      updated_at = now()
    WHERE id = v_wallet_id;
  END IF;

  RETURN true;
END;
$$;
