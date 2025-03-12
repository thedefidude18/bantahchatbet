-- Platform wallet to collect admin fees
CREATE TABLE IF NOT EXISTS platform_wallet (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    balance integer NOT NULL DEFAULT 0,
    updated_at timestamptz DEFAULT now()
);

-- Insert initial platform wallet
INSERT INTO platform_wallet (id) VALUES (gen_random_uuid());

-- Track fee collections
CREATE TABLE IF NOT EXISTS fee_collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid REFERENCES events(id),
    amount integer NOT NULL,
    collected_at timestamptz DEFAULT now(),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'processed'))
);

-- Function to collect admin fee when event completes
CREATE OR REPLACE FUNCTION collect_admin_fee(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_fee integer;
BEGIN
    -- Get admin fee from event pool
    SELECT admin_fee INTO v_admin_fee
    FROM event_pools
    WHERE event_id = p_event_id;

    -- Add fee to platform wallet
    UPDATE platform_wallet
    SET balance = balance + v_admin_fee,
        updated_at = now();

    -- Record fee collection
    INSERT INTO fee_collections (event_id, amount, status)
    VALUES (p_event_id, v_admin_fee, 'processed');
END;
$$;

-- Function for admin to withdraw fees
CREATE OR REPLACE FUNCTION admin_withdraw_fees(
    p_admin_id uuid,
    p_amount integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_admin boolean;
    v_platform_balance integer;
BEGIN
    -- Verify admin status
    SELECT is_admin INTO v_is_admin FROM users WHERE id = p_admin_id;
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Only admins can withdraw fees';
    END IF;

    -- Check platform wallet balance
    SELECT balance INTO v_platform_balance FROM platform_wallet LIMIT 1;
    IF v_platform_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient platform balance';
    END IF;

    -- Update platform wallet
    UPDATE platform_wallet
    SET balance = balance - p_amount,
        updated_at = now();

    -- Add to admin's wallet
    UPDATE wallets
    SET balance = balance + p_amount
    WHERE user_id = p_admin_id;

    RETURN true;
END;
$$;