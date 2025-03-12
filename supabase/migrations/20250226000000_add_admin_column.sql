-- Add is_admin column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update specific users as admins
UPDATE public.users
SET is_admin = true
WHERE email IN ('alwaysdefi16@gmail.com', 'michealwritesyes@gmail.com');

-- Add an index for performance
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);