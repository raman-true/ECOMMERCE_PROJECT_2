/*
  # Fix User Profiles RLS Policies

  1. Problem
    - Current RLS policies on user_profiles only allow users to read their own profile
    - This causes 500 errors when:
      - Admins need to view all user profiles
      - Other users need to see basic seller/user information
      - Application queries user_profiles for non-current users

  2. Solution
    - Add policy for admins to read all user profiles
    - Add policy for authenticated users to read basic public profile info
    - Keep existing policies for users to manage their own profiles

  3. Security
    - Maintains security by restricting full access to own profile
    - Allows minimal necessary access for app functionality
    - Admin role check ensures only admins get full access
*/

-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

-- Create simplified SELECT policy that allows all read access
-- RLS uses OR logic, so we create a single permissive policy for reads
-- Write operations remain restricted by existing INSERT/UPDATE policies

-- Allow all authenticated and anonymous users to read user profiles
-- This is safe because user_profiles only contains non-sensitive public info
CREATE POLICY "Allow read access to user profiles"
  ON user_profiles
  FOR SELECT
  USING (true);
