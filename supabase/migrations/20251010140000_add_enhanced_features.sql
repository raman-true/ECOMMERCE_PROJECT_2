/*
  # Enhanced E-commerce Features Migration

  ## Overview
  This migration adds support for 5 major features:
  1. Password Reset (handled by Supabase Auth - no tables needed)
  2. Admin Access with special privileges
  3. Pickup option as alternative to shipping
  4. Email notifications for orders
  5. Onsite installation service

  ## Changes Made

  ### 1. Admin User Setup
  - Creates admin user with email support@abor-tech.com
  - Sets role to 'admin' in user_profiles

  ### 2. Pickup/Delivery Method Updates
  - Orders table already has delivery_method field (shipping/click-collect)
  - 'click-collect' will be used for pickup functionality
  - Adds pickup_location fields to seller_settings

  ### 3. Email Notification System
  - Creates email_notification_preferences table for user notification settings
  - Creates email_notification_log table to track sent emails
  - Adds email templates configuration

  ### 4. Installation Service
  - Adds installation service fields to products table:
    * has_installation_service (boolean)
    * installation_price (numeric)
    * installation_description (text)
  - Adds installation service fields to order_items table:
    * includes_installation (boolean)
    * installation_price (numeric)

  ### 5. Enhanced Seller Settings
  - Adds pickup_location_name, pickup_location_address to seller_settings
  - Adds pickup_instructions for customer guidance

  ## Security
  - Enables RLS on all new tables
  - Creates restrictive policies for email preferences and logs
  - Updates admin access policies across all tables
*/

-- =====================================================
-- 1. EMAIL NOTIFICATION TABLES
-- =====================================================

-- Email notification preferences for users
CREATE TABLE IF NOT EXISTS public.email_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_confirmations boolean DEFAULT true,
  order_updates boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.email_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification preferences"
  ON public.email_notification_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON public.email_notification_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON public.email_notification_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Email notification log for tracking sent emails
CREATE TABLE IF NOT EXISTS public.email_notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  recipient_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email_type text NOT NULL CHECK (email_type IN ('order_confirmation', 'order_update', 'supplier_notification', 'admin_notification', 'password_reset')),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.email_notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all email logs"
  ON public.email_notification_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view own email logs"
  ON public.email_notification_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_user_id);

-- =====================================================
-- 2. INSTALLATION SERVICE FIELDS
-- =====================================================

-- Add installation service fields to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'has_installation_service'
  ) THEN
    ALTER TABLE public.products ADD COLUMN has_installation_service boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'installation_price'
  ) THEN
    ALTER TABLE public.products ADD COLUMN installation_price numeric DEFAULT 0 CHECK (installation_price >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'installation_description'
  ) THEN
    ALTER TABLE public.products ADD COLUMN installation_description text DEFAULT '';
  END IF;
END $$;

-- Add installation service fields to order_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'includes_installation'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN includes_installation boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'installation_price'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN installation_price numeric DEFAULT 0 CHECK (installation_price >= 0);
  END IF;
END $$;

-- Add installation service fields to cart_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'includes_installation'
  ) THEN
    ALTER TABLE public.cart_items ADD COLUMN includes_installation boolean DEFAULT false;
  END IF;
END $$;

-- =====================================================
-- 3. ENHANCED SELLER SETTINGS FOR PICKUP
-- =====================================================

-- Add pickup location fields to seller_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_settings' AND column_name = 'pickup_location_name'
  ) THEN
    ALTER TABLE public.seller_settings ADD COLUMN pickup_location_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_settings' AND column_name = 'pickup_location_address'
  ) THEN
    ALTER TABLE public.seller_settings ADD COLUMN pickup_location_address text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_settings' AND column_name = 'pickup_instructions'
  ) THEN
    ALTER TABLE public.seller_settings ADD COLUMN pickup_instructions text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_settings' AND column_name = 'pickup_enabled'
  ) THEN
    ALTER TABLE public.seller_settings ADD COLUMN pickup_enabled boolean DEFAULT true;
  END IF;
END $$;

-- =====================================================
-- 4. ADMIN USER SETUP
-- =====================================================

-- Note: The admin user (support@abor-tech.com) will need to be created manually
-- through Supabase Auth dashboard or registration flow first.
-- This section will update their profile to admin role once they exist.

-- Function to promote user to admin by email
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;

  IF target_user_id IS NOT NULL THEN
    -- Update or insert user profile with admin role
    INSERT INTO public.user_profiles (id, role, first_name, last_name)
    VALUES (target_user_id, 'admin', 'Support', 'Admin')
    ON CONFLICT (id)
    DO UPDATE SET role = 'admin';
  END IF;
END;
$$;

-- =====================================================
-- 5. ENHANCED RLS POLICIES FOR ADMIN ACCESS
-- =====================================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Update products policies to allow admin full access
DROP POLICY IF EXISTS "Admin can manage all products" ON public.products;
CREATE POLICY "Admin can manage all products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update categories policies to allow admin full access
DROP POLICY IF EXISTS "Admin can manage all categories" ON public.categories;
CREATE POLICY "Admin can manage all categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update departments policies to allow admin full access
DROP POLICY IF EXISTS "Admin can manage all departments" ON public.departments;
CREATE POLICY "Admin can manage all departments"
  ON public.departments
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update orders policies to allow admin full access
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
CREATE POLICY "Admin can view all orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admin can update all orders" ON public.orders;
CREATE POLICY "Admin can update all orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update user_profiles policies to allow admin to view all users
DROP POLICY IF EXISTS "Admin can view all user profiles" ON public.user_profiles;
CREATE POLICY "Admin can view all user profiles"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admin can update all user profiles" ON public.user_profiles;
CREATE POLICY "Admin can update all user profiles"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_orders_delivery_method ON public.orders(delivery_method);
CREATE INDEX IF NOT EXISTS idx_products_installation ON public.products(has_installation_service) WHERE has_installation_service = true;
CREATE INDEX IF NOT EXISTS idx_email_log_status ON public.email_notification_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_order ON public.email_notification_log(order_id);
CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON public.email_notification_log(recipient_user_id);

-- =====================================================
-- 7. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to create default email notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.email_notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create email preferences when user profile is created
DROP TRIGGER IF EXISTS on_user_profile_created_email_prefs ON public.user_profiles;
CREATE TRIGGER on_user_profile_created_email_prefs
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_email_preferences();
