-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing function if exists
DROP FUNCTION IF EXISTS initialize_user_wallet(text);

-- Create or replace the function
CREATE OR REPLACE FUNCTION initialize_user_wallet(user_id text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_wallet_id bigint;
BEGIN
  -- Convert text ID to UUID using a fixed namespace UUID for consistency
  BEGIN
    v_user_id := CASE 
      WHEN user_id LIKE 'did:privy:%' THEN 
        uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, user_id)
      ELSE
        CASE 
          WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
          THEN user_id::uuid
          ELSE uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, user_id)
        END
    END;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback to v5 UUID with fixed namespace
    v_user_id := uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, user_id);
  END;

  -- Create or update wallet with retries
  FOR i IN 1..3 LOOP
    BEGIN
      INSERT INTO wallets (user_id, balance)
      VALUES (v_user_id, 10000)
      ON CONFLICT (user_id) DO UPDATE
      SET updated_at = now()
      RETURNING id INTO v_wallet_id;

      -- If successful, return the wallet ID
      IF v_wallet_id IS NOT NULL THEN
        RETURN v_wallet_id;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      IF i = 3 THEN
        RAISE WARNING 'Error in initialize_user_wallet after 3 attempts: %', SQLERRM;
        RETURN NULL;
      END IF;
      -- Wait a bit before retrying with exponential backoff
      PERFORM pg_sleep(power(2, i - 1) * 0.1);
    END;
  END LOOP;

  RETURN NULL;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION initialize_user_wallet(text) TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_user_wallet(text) TO anon;

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can access their own wallet"
  ON wallets
  FOR ALL
  USING (auth.uid() = user_id);
