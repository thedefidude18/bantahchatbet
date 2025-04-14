-- Create function to get platform fee statistics
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

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_platform_fee_stats() TO authenticated;