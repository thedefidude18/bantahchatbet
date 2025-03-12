-- Add admin policies for withdrawals
CREATE POLICY "Admins can view all withdrawals"
    ON withdrawals FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND is_admin = true
    ));

-- Function for admins to process withdrawals
CREATE OR REPLACE FUNCTION admin_process_withdrawal(
    p_withdrawal_id uuid,
    p_status text,
    p_admin_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_admin boolean;
BEGIN
    -- Check if user is admin
    SELECT is_admin INTO v_is_admin FROM users WHERE id = p_admin_id;
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Only admins can process withdrawals';
    END IF;

    -- Update withdrawal status
    UPDATE withdrawals
    SET 
        status = p_status,
        processed_at = CASE WHEN p_status = 'completed' THEN now() ELSE processed_at END,
        updated_at = now()
    WHERE id = p_withdrawal_id;

    -- Record admin action
    INSERT INTO admin_actions (
        admin_id,
        action_type,
        target_type,
        target_id,
        details
    ) VALUES (
        p_admin_id,
        'process_withdrawal',
        'withdrawal',
        p_withdrawal_id,
        jsonb_build_object(
            'status', p_status
        )
    );

    RETURN true;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION admin_process_withdrawal TO authenticated;