-- ============================================================================
-- CREATE ADMIN USER
-- ============================================================================
-- This script creates an admin user for your e-commerce platform
-- Run this in Supabase SQL Editor
-- ============================================================================

-- INSTRUCTIONS:
-- 1. Replace 'admin@example.com' with your desired admin email
-- 2. Replace 'your-secure-password' with a strong password
-- 3. Replace 'Admin' and 'User' with the admin's first and last name
-- 4. Run this script in Supabase SQL Editor
-- ============================================================================

DO $$
DECLARE
  new_user_id uuid;
  admin_email text := 'admin@ecoconnect.com';  -- CHANGE THIS
  admin_password text := 'Admin@123456';        -- CHANGE THIS
  admin_first_name text := 'Admin';             -- CHANGE THIS
  admin_last_name text := 'User';               -- CHANGE THIS
BEGIN
  -- Create the auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'first_name', admin_first_name,
      'last_name', admin_last_name,
      'role', 'admin'
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create the user profile with admin role
  INSERT INTO public.user_profiles (id, first_name, last_name, role)
  VALUES (
    new_user_id,
    admin_first_name,
    admin_last_name,
    'admin'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;

  -- Output success message
  RAISE NOTICE 'Admin user created successfully!';
  RAISE NOTICE 'Email: %', admin_email;
  RAISE NOTICE 'Password: %', admin_password;
  RAISE NOTICE 'User ID: %', new_user_id;
  RAISE NOTICE 'Please change the password after first login!';

END $$;

-- Verify the admin user was created
SELECT
  au.email,
  up.first_name,
  up.last_name,
  up.role,
  au.email_confirmed_at,
  au.created_at
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.id
WHERE up.role = 'admin'
ORDER BY au.created_at DESC;
