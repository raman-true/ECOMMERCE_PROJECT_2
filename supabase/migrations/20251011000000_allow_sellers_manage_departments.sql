/*
  # Allow Sellers to Manage Departments

  1. Changes
    - Drop the existing restrictive "Admins can manage departments" policy
    - Add new policies to allow both admins and sellers to manage departments
    - Sellers need to create departments for their product organization
    - Maintains read access for everyone

  2. Security
    - Read access remains public (anyone can view departments)
    - INSERT/UPDATE/DELETE access granted to authenticated sellers and admins
    - Policies ensure only authenticated users with seller or admin role can modify
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;

-- Allow sellers and admins to insert departments
CREATE POLICY "Sellers and admins can insert departments"
  ON public.departments FOR INSERT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('seller', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('seller', 'admin')
    )
  );

-- Allow sellers and admins to update departments
CREATE POLICY "Sellers and admins can update departments"
  ON public.departments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('seller', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('seller', 'admin')
    )
  );

-- Allow sellers and admins to delete departments
CREATE POLICY "Sellers and admins can delete departments"
  ON public.departments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('seller', 'admin')
    )
  );
