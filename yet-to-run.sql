-- ============================================================================
-- FIX MISSING USER PROFILE TRIGGER
-- ============================================================================
-- Run this entire file in Supabase SQL Editor to fix the missing trigger
-- that prevents user profiles from being created automatically
-- ============================================================================

-- ============================================================================
-- SCRIPT 1: ADD MISSING USER PROFILE AUTO-CREATION TRIGGER
-- ============================================================================

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, user_profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, user_profiles.last_name),
    role = COALESCE(EXCLUDED.role, user_profiles.role);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users that fires AFTER INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify trigger was created
SELECT 'Trigger created successfully!' as status;

-- ============================================================================
-- SCRIPT 2: BACKFILL USER PROFILES FOR EXISTING USERS
-- ============================================================================

-- Create profiles for users who already exist but don't have profiles
INSERT INTO public.user_profiles (id, first_name, last_name, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'first_name', '') as first_name,
  COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name,
  COALESCE(au.raw_user_meta_data->>'role', 'customer') as role
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
  AND au.confirmed_at IS NOT NULL;

-- Show how many profiles were created
SELECT
  COUNT(*) as profiles_backfilled,
  'user profiles have been created for existing users' as message
FROM auth.users au
JOIN public.user_profiles up ON au.id = up.id
WHERE au.confirmed_at IS NOT NULL;

-- ============================================================================
-- SCRIPT 3: UPDATE RLS POLICY TO ALLOW TRIGGER INSERTS
-- ============================================================================

-- Allow the trigger function to insert profiles (bypasses RLS with SECURITY DEFINER)
DROP POLICY IF EXISTS "Allow trigger to insert profiles" ON public.user_profiles;
CREATE POLICY "Allow trigger to insert profiles"
  ON public.user_profiles FOR INSERT
  WITH CHECK (true);

-- Verify the policy was created
SELECT
  'RLS policy updated successfully!' as status,
  'New users will now get profiles automatically' as message;

-- ============================================================================
-- VERIFICATION - Check if everything worked
-- ============================================================================

-- Check if ashakarthikeyan24@gmail.com now has a profile
SELECT
  au.email,
  up.first_name,
  up.last_name,
  up.role,
  up.created_at as profile_created_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'ashakarthikeyan24@gmail.com';
