/*
  # Update user_profiles RLS policy for admin access

  1. Security Changes
    - Update SELECT policy on `user_profiles` table to allow admins to view all profiles
    - Maintains existing security for regular users to only see their own profile
    - Admins can now access all user profiles for management purposes

  2. Policy Changes
    - Modified "Users can read own profile" policy to include admin access
    - Policy now allows: (user can read own profile) OR (user is admin)
*/

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

-- Create new SELECT policy that allows users to read their own profile OR allows admins to read all profiles
CREATE POLICY "Users can read own profile or admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    (uid() = id) OR 
    (EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE user_profiles.id = uid() AND user_profiles.role = 'admin'
    ))
  );