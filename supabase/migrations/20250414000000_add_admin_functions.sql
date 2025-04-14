-- Get platform fee statistics
CREATE OR REPLACE FUNCTION get_platform_fee_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN json_build_object(
    'totalPendingFees', (
      SELECT COALESCE(SUM(amount), 0)
      FROM platform_fees
      WHERE status = 'pending'
    ),
    'totalWithdrawnFees', (
      SELECT COALESCE(SUM(amount), 0)
      FROM platform_fees
      WHERE status = 'withdrawn'
    ),
    'totalPendingCoins', (
      SELECT COALESCE(SUM(amount), 0)
      FROM coin_transactions
      WHERE type = 'platform_fee' AND status = 'pending'
    ),
    'totalWithdrawnCoins', (
      SELECT COALESCE(SUM(amount), 0)
      FROM coin_transactions
      WHERE type = 'platform_fee' AND status = 'withdrawn'
    )
  );
END;
$$;

-- Process event payouts
CREATE OR REPLACE FUNCTION process_event_payouts(p_event_id uuid, p_admin_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_record record;
  v_winner_prediction boolean;
  v_total_pool numeric;
  v_winner_count int;
  v_payout_per_winner numeric;
BEGIN
  -- Get event details
  SELECT * INTO v_event_record
  FROM events
  WHERE id = p_event_id;

  IF v_event_record.status != 'completed' THEN
    RAISE EXCEPTION 'Event must be completed before processing payouts';
  END IF;

  IF v_event_record.payouts_processed THEN
    RAISE EXCEPTION 'Payouts have already been processed for this event';
  END IF;

  -- Get winning prediction
  SELECT winning_prediction INTO v_winner_prediction
  FROM event_results
  WHERE event_id = p_event_id;

  -- Calculate total pool and winners
  SELECT 
    SUM(wager_amount) INTO v_total_pool
  FROM event_participants
  WHERE event_id = p_event_id;

  SELECT COUNT(*) INTO v_winner_count
  FROM event_participants
  WHERE event_id = p_event_id
  AND prediction = v_winner_prediction;

  IF v_winner_count > 0 THEN
    v_payout_per_winner := v_total_pool / v_winner_count;

    -- Process payouts to winners
    INSERT INTO wallet_transactions (user_id, amount, type, status, reference_id)
    SELECT 
      user_id,
      v_payout_per_winner,
      'event_winning',
      'completed',
      p_event_id
    FROM event_participants
    WHERE event_id = p_event_id
    AND prediction = v_winner_prediction;
  END IF;

  -- Update event as processed
  UPDATE events
  SET 
    payouts_processed = true,
    updated_at = NOW()
  WHERE id = p_event_id;

  -- Log admin action
  INSERT INTO admin_actions (
    admin_email,
    action_type,
    target_type,
    target_id,
    details
  ) VALUES (
    p_admin_email,
    'process_payouts',
    'event',
    p_event_id,
    jsonb_build_object(
      'total_pool', v_total_pool,
      'winner_count', v_winner_count,
      'payout_per_winner', v_payout_per_winner
    )
  );
END;
$$;

-- Withdraw platform fees
CREATE OR REPLACE FUNCTION withdraw_platform_fees(p_amount numeric, p_admin_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_available_amount numeric;
BEGIN
  -- Get available amount
  SELECT COALESCE(SUM(amount), 0) INTO v_available_amount
  FROM platform_fees
  WHERE status = 'pending';

  IF p_amount > v_available_amount THEN
    RAISE EXCEPTION 'Withdrawal amount exceeds available fees';
  END IF;

  -- Process withdrawal
  WITH updated_fees AS (
    UPDATE platform_fees
    SET 
      status = 'withdrawn',
      updated_at = NOW()
    WHERE status = 'pending'
    AND id IN (
      SELECT id
      FROM platform_fees
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT (
        SELECT COUNT(*)
        FROM (
          SELECT id, amount,
                 SUM(amount) OVER (ORDER BY created_at ASC) AS running_total
          FROM platform_fees
          WHERE status = 'pending'
        ) sq
        WHERE running_total <= p_amount
      )
    )
    RETURNING id
  )
  -- Log admin action
  INSERT INTO admin_actions (
    admin_email,
    action_type,
    target_type,
    details
  ) VALUES (
    p_admin_email,
    'withdraw_fees',
    'platform_fees',
    jsonb_build_object(
      'amount', p_amount,
      'fee_ids', (SELECT array_agg(id) FROM updated_fees)
    )
  );
END;
$$;

-- Grant access to the functions
GRANT EXECUTE ON FUNCTION get_platform_fee_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION process_event_payouts(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION withdraw_platform_fees(numeric, text) TO authenticated;