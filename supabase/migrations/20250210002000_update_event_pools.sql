-- Add missing columns to event_pools table
ALTER TABLE event_pools
ADD COLUMN IF NOT EXISTS winning_pool INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS losing_pool INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Update existing pools if any
UPDATE event_pools
SET 
    winning_pool = 0,
    losing_pool = 0,
    status = 'pending'
WHERE winning_pool IS NULL;

-- Recreate the handle_event_changes function with proper column names
CREATE OR REPLACE FUNCTION handle_event_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- For new events
  IF (TG_OP = 'INSERT') THEN
    -- Initialize event pool
    INSERT INTO event_pools (
      event_id,
      total_amount,
      admin_fee,
      winning_pool,
      losing_pool,
      status
    ) VALUES (
      NEW.id,
      0,
      0,
      0,
      0,
      'pending'
    );
    RETURN NEW;
  
  -- For updated events
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Handle status changes
    IF NEW.status != OLD.status THEN
      -- If event is completed, process payouts
      IF NEW.status = 'completed' THEN
        PERFORM process_event_payout(NEW.id);
      -- If event is cancelled, handle refunds
      ELSIF NEW.status = 'cancelled' THEN
        PERFORM cancel_event(NEW.id);
      END IF;
    END IF;
    
    RETURN NEW;
  
  -- For deleted events
  ELSIF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to lock funds for bet
CREATE OR REPLACE FUNCTION lock_funds_for_bet(
    p_amount BIGINT,
    p_reference TEXT
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_wallet_id UUID;
    v_user_id UUID;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    -- Get wallet
    SELECT id INTO v_wallet_id
    FROM wallets
    WHERE user_id = v_user_id
    FOR UPDATE;

    -- Check if we have enough funds (bonus + real balance)
    IF NOT EXISTS (
        SELECT 1 FROM wallets
        WHERE id = v_wallet_id
        AND (real_balance + bonus_balance) >= p_amount
    ) THEN
        RETURN FALSE;
    END IF;

    -- Lock funds (prefer bonus balance first)
    UPDATE wallets
    SET 
        bonus_balance = CASE 
            WHEN bonus_balance >= p_amount THEN bonus_balance - p_amount
            ELSE bonus_balance
        END,
        real_balance = CASE 
            WHEN bonus_balance >= p_amount THEN real_balance
            ELSE real_balance - p_amount
        END,
        locked_balance = locked_balance + p_amount
    WHERE id = v_wallet_id;

    -- Record transaction
    INSERT INTO wallet_transactions (
        wallet_id,
        user_id,
        type,
        amount,
        balance_after,
        status,
        reference
    ) VALUES (
        v_wallet_id,
        v_user_id,
        'bet_lock',
        p_amount,
        (SELECT real_balance + bonus_balance FROM wallets WHERE id = v_wallet_id),
        'completed',
        p_reference
    );

    RETURN TRUE;
END;
$$;

-- Similar functions needed for process_bet_win, process_bet_loss, and refund_bet
