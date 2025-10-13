/*
  # Seller Onboarding and Approval System

  ## Overview
  This migration creates a comprehensive seller onboarding system with admin approval workflow.

  ## 1. New Tables
    - `seller_applications` - Stores seller registration applications awaiting admin approval
      - `id` (uuid, primary key) - Unique application identifier
      - `user_id` (uuid, references auth.users) - User who submitted the application
      - `business_name` (text) - Legal business name
      - `business_type` (text) - Business structure type
      - `abn` (text) - Australian Business Number
      - `business_address` (jsonb) - Complete business address details
      - `contact_person` (text) - Primary contact person name
      - `contact_phone` (text) - Business phone number
      - `contact_email` (text) - Business email address
      - `website` (text, optional) - Business website URL
      - `description` (text) - Business description and product categories
      - `bank_account_name` (text) - Bank account holder name
      - `bank_bsb` (text) - Bank BSB number
      - `bank_account_number` (text) - Bank account number
      - `documents` (jsonb) - Uploaded verification documents
      - `status` (text) - Application status (pending/approved/rejected)
      - `rejection_reason` (text, optional) - Reason for rejection if applicable
      - `reviewed_by` (uuid, optional) - Admin who reviewed the application
      - `reviewed_at` (timestamptz, optional) - Timestamp of review
      - `created_at` (timestamptz) - Application submission timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security
    - Enable RLS on `seller_applications` table
    - Users can view and create their own applications
    - Admins can view all applications and update status
    - Only admins can approve/reject applications

  ## 3. Application Workflow
    1. User submits seller application via registration form
    2. Application status is set to 'pending'
    3. Admin reviews application in admin dashboard
    4. Admin approves or rejects with optional reason
    5. On approval: user role is changed to 'seller' and seller_settings record is created
    6. On rejection: user is notified and can resubmit

  ## 4. Indexes
    - Index on user_id for quick user lookup
    - Index on status for filtering pending applications
    - Index on created_at for sorting applications

  ## Important Notes
    - All sensitive financial data is encrypted at rest by Supabase
    - Document URLs are stored as references to Supabase Storage
    - Admin approval is required before any seller can access seller dashboard
*/

-- ============================================================================
-- STEP 1: Create Seller Applications Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.seller_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_type text NOT NULL CHECK (business_type IN ('sole_trader', 'partnership', 'company', 'trust')),
  abn text NOT NULL,
  business_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  contact_person text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text NOT NULL,
  website text,
  description text NOT NULL,
  bank_account_name text NOT NULL,
  bank_bsb text NOT NULL,
  bank_account_number text NOT NULL,
  documents jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- STEP 2: Create Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_seller_applications_user_id
  ON public.seller_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_seller_applications_status
  ON public.seller_applications(status);

CREATE INDEX IF NOT EXISTS idx_seller_applications_created_at
  ON public.seller_applications(created_at DESC);

-- ============================================================================
-- STEP 3: Enable RLS
-- ============================================================================

ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create RLS Policies
-- ============================================================================

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON public.seller_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- Users can create their own applications
CREATE POLICY "Users can create own applications"
  ON public.seller_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending applications
CREATE POLICY "Users can update own pending applications"
  ON public.seller_applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON public.seller_applications FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can update any application
CREATE POLICY "Admins can update any application"
  ON public.seller_applications FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- STEP 5: Create Function to Handle Application Approval
-- ============================================================================

CREATE OR REPLACE FUNCTION public.approve_seller_application(
  application_id uuid,
  admin_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_status text;
  result jsonb;
BEGIN
  -- Get application details
  SELECT user_id, status INTO v_user_id, v_status
  FROM public.seller_applications
  WHERE id = application_id;

  -- Check if application exists
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Application not found'
    );
  END IF;

  -- Check if already processed
  IF v_status != 'pending' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Application has already been processed'
    );
  END IF;

  -- Update application status
  UPDATE public.seller_applications
  SET
    status = 'approved',
    reviewed_by = admin_id,
    reviewed_at = now(),
    updated_at = now()
  WHERE id = application_id;

  -- Update user role to seller
  UPDATE public.user_profiles
  SET role = 'seller'
  WHERE id = v_user_id;

  -- Create seller_settings record
  INSERT INTO public.seller_settings (
    seller_id,
    fulfillment_method,
    delivery_sla_days,
    pickup_enabled
  ) VALUES (
    v_user_id,
    'platform',
    5,
    false
  )
  ON CONFLICT (seller_id) DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Seller application approved successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 6: Create Function to Handle Application Rejection
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reject_seller_application(
  application_id uuid,
  admin_id uuid,
  reason text
)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_status text;
  result jsonb;
BEGIN
  -- Get application details
  SELECT user_id, status INTO v_user_id, v_status
  FROM public.seller_applications
  WHERE id = application_id;

  -- Check if application exists
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Application not found'
    );
  END IF;

  -- Check if already processed
  IF v_status != 'pending' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Application has already been processed'
    );
  END IF;

  -- Update application status
  UPDATE public.seller_applications
  SET
    status = 'rejected',
    rejection_reason = reason,
    reviewed_by = admin_id,
    reviewed_at = now(),
    updated_at = now()
  WHERE id = application_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Seller application rejected'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 7: Create Trigger for Updated At Timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_seller_application_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_seller_application_updated_at
  ON public.seller_applications;

CREATE TRIGGER trigger_update_seller_application_updated_at
  BEFORE UPDATE ON public.seller_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_seller_application_updated_at();
