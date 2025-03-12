-- First, ensure the users exist in auth.users
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
SELECT 
    email,
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now()
FROM (
    VALUES 
        ('alwaysdefi16@gmail.com'),
        ('michealwritesyes@gmail.com')
) AS t(email)
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = t.email
)
ON CONFLICT (email) DO UPDATE
SET encrypted_password = crypt('admin123', gen_salt('bf'));

-- Then ensure they exist in public.users with admin privileges
INSERT INTO public.users (id, email, is_admin)
SELECT 
    id,
    email,
    true
FROM auth.users
WHERE email IN ('alwaysdefi16@gmail.com', 'michealwritesyes@gmail.com')
ON CONFLICT (id) DO UPDATE
SET is_admin = true;

-- Update existing users to ensure admin status
UPDATE public.users
SET is_admin = true
WHERE email IN ('alwaysdefi16@gmail.com', 'michealwritesyes@gmail.com')
OR id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('alwaysdefi16@gmail.com', 'michealwritesyes@gmail.com')
);

-- Verify the setup
DO $$
BEGIN
    RAISE NOTICE 'Admin users status:';
    FOR r IN (
        SELECT 
            au.email,
            au.id as auth_id,
            u.id as user_id,
            u.is_admin
        FROM auth.users au
        LEFT JOIN public.users u ON au.id = u.id
        WHERE au.email IN ('alwaysdefi16@gmail.com', 'michealwritesyes@gmail.com')
    ) LOOP
        RAISE NOTICE 'Email: %, Auth ID: %, User ID: %, Is Admin: %', 
            r.email, r.auth_id, r.user_id, r.is_admin;
    END LOOP;
END $$;
