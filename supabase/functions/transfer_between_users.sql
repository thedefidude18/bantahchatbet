-- Drop the function if it exists
DROP FUNCTION IF EXISTS transfer_between_users(UUID, INTEGER, TEXT);

-- Create the function
CREATE OR REPLACE FUNCTION transfer_between_users(
  recipient_id UUID,
  amount INTEGER,
  balance_type TEXT DEFAULT 'real'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_wallet_id UUID;
  recipient_wallet_id UUID;
  sender_balance DECIMAL;
  transfer_reference TEXT;
BEGIN
  -- Get sender's wallet
  SELECT id INTO sender_wallet_id
  FROM wallets
  WHERE user_id = auth.uid();

  -- Get recipient's wallet
  SELECT id INTO recipient_wallet_id
  FROM wallets
  WHERE user_id = recipient_id;

  IF recipient_wallet_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Recipient wallet not found');
  END IF;

  -- Check sender's balance
  IF balance_type = 'real' THEN
    SELECT real_balance INTO sender_balance
    FROM wallets
    WHERE id = sender_wallet_id;
  ELSE
    SELECT bonus_balance INTO sender_balance
    FROM wallets
    WHERE id = sender_wallet_id;
  END IF;

  IF sender_balance < amount THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance');
  END IF;

  -- Generate transfer reference
  transfer_reference := 'TRF-' || encode(gen_random_bytes(8), 'hex');

  -- Begin transaction
  BEGIN
    -- Deduct from sender
    IF balance_type = 'real' THEN
      UPDATE wallets 
      SET real_balance = real_balance - amount
      WHERE id = sender_wallet_id;
    ELSE
      UPDATE wallets 
      SET bonus_balance = bonus_balance - amount
      WHERE id = sender_wallet_id;
    END IF;

    -- Add to recipient
    IF balance_type = 'real' THEN
      UPDATE wallets 
      SET real_balance = real_balance + amount
      WHERE id = recipient_wallet_id;
    ELSE
      UPDATE wallets 
      SET bonus_balance = bonus_balance + amount
      WHERE id = recipient_wallet_id;
    END IF;

    -- Create transaction record
    INSERT INTO transactions (
      user_id,
      wallet_id,
      recipient_wallet_id,
      amount,
      type,
      status,
      reference,
      metadata
    ) VALUES (
      auth.uid(),
      sender_wallet_id,
      recipient_wallet_id,
      amount,
      'transfer',
      'completed',
      transfer_reference,
      jsonb_build_object(
        'balance_type', balance_type,
        'transfer_type', 'user_to_user',
        'completed_at', NOW()
      )
    );

    RETURN jsonb_build_object(
      'success', true,
      'reference', transfer_reference,
      'message', 'Transfer completed successfully'
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Transfer failed: %', SQLERRM;
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION transfer_between_users(UUID, INTEGER, TEXT) TO authenticated;
