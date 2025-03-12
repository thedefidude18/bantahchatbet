-- Verify column exists and is properly configured
DO $$ 
BEGIN
    -- Ensure column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE transactions 
        ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;

    -- Ensure column is NOT NULL
    ALTER TABLE transactions 
    ALTER COLUMN user_id SET NOT NULL;
END $$;

-- Force PostgREST to reload its schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Recreate RLS policies to ensure they're properly registered
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions"
ON transactions FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
CREATE POLICY "Users can insert their own transactions"
ON transactions FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Verify permissions
GRANT SELECT, INSERT, UPDATE ON transactions TO authenticated;

-- Additional step to ensure schema is fresh
COMMENT ON COLUMN transactions.user_id IS 'The ID of the user who owns this transaction';