/*
  # Global Settings and Supplier Notification System Setup

  This migration creates:
  1. global_settings table with initial platform configuration
  2. supplier_notifications table for order alerts
  3. notification_preferences for suppliers to set email/SMS preferences
  4. Triggers to automatically notify suppliers when orders are placed

  Run this SQL in your Supabase SQL Editor to set up the notification system.
*/

-- ============================================================================
-- STEP 1: Create Global Settings Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.global_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_tax_rate numeric(5,2) DEFAULT 10.00,
  tax_type text DEFAULT 'GST' CHECK (tax_type IN ('GST', 'VAT', 'Sales_Tax')),
  allow_seller_tax_override boolean DEFAULT false,
  free_shipping_threshold numeric(10,2) DEFAULT 99.00,
  default_shipping_carriers jsonb DEFAULT '[]'::jsonb,
  platform_fulfillment_enabled boolean DEFAULT true,
  standard_delivery_days text DEFAULT '2-5',
  express_delivery_days text DEFAULT '1-2',
  delivery_tracking_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default global settings (only if table is empty)
INSERT INTO public.global_settings (
  id,
  default_tax_rate,
  tax_type,
  allow_seller_tax_override,
  free_shipping_threshold,
  platform_fulfillment_enabled,
  standard_delivery_days,
  express_delivery_days,
  delivery_tracking_enabled
)
SELECT
  '00000000-0000-0000-0000-000000000001',
  10.00,
  'GST',
  false,
  99.00,
  true,
  '2-5',
  '1-2',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.global_settings);

-- Enable RLS
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage global settings" ON public.global_settings;
DROP POLICY IF EXISTS "Anyone can view global settings" ON public.global_settings;

-- Admin can view and manage global settings
CREATE POLICY "Admins can manage global settings"
ON public.global_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Everyone can view global settings (read-only for non-admins)
CREATE POLICY "Anyone can view global settings"
ON public.global_settings
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- STEP 2: Create Notification Preferences Table for Suppliers
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  notification_email text,
  notification_phone text,
  notify_on_new_order boolean DEFAULT true,
  notify_on_order_status_change boolean DEFAULT true,
  notify_on_low_stock boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Admins can view all notification preferences" ON public.notification_preferences;

-- Users can view and manage their own notification preferences
CREATE POLICY "Users can view own notification preferences"
ON public.notification_preferences
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification preferences"
ON public.notification_preferences
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences"
ON public.notification_preferences
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins can view all notification preferences
CREATE POLICY "Admins can view all notification preferences"
ON public.notification_preferences
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- STEP 3: Create Supplier Notifications Log Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.supplier_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('new_order', 'order_status_change', 'low_stock', 'other')),
  notification_method text NOT NULL CHECK (notification_method IN ('email', 'sms', 'in_app')),
  recipient_email text,
  recipient_phone text,
  subject text,
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.supplier_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Suppliers can view own notifications" ON public.supplier_notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.supplier_notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.supplier_notifications;

-- Suppliers can view their own notifications
CREATE POLICY "Suppliers can view own notifications"
ON public.supplier_notifications
FOR SELECT
TO authenticated
USING (supplier_id = auth.uid());

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
ON public.supplier_notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- System can insert notifications (service role)
CREATE POLICY "Service role can insert notifications"
ON public.supplier_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================================
-- STEP 4: Create Function to Notify Suppliers About New Orders
-- ============================================================================

CREATE OR REPLACE FUNCTION public.notify_suppliers_on_new_order()
RETURNS TRIGGER AS $$
DECLARE
  supplier_record RECORD;
  notification_prefs RECORD;
  order_details RECORD;
BEGIN
  -- Get order details
  SELECT
    o.id,
    o.order_number,
    o.total_amount,
    o.status,
    up.first_name || ' ' || up.last_name as customer_name
  INTO order_details
  FROM public.orders o
  LEFT JOIN public.user_profiles up ON o.user_id = up.id
  WHERE o.id = NEW.id;

  -- Find all suppliers who have products in this order
  FOR supplier_record IN
    SELECT DISTINCT
      p.seller_id,
      up.first_name || ' ' || up.last_name as supplier_name
    FROM public.order_items oi
    JOIN public.products p ON oi.product_id = p.id
    JOIN public.user_profiles up ON p.seller_id = up.id
    WHERE oi.order_id = NEW.id
    AND p.seller_id IS NOT NULL
  LOOP
    -- Get notification preferences for this supplier
    SELECT * INTO notification_prefs
    FROM public.notification_preferences
    WHERE user_id = supplier_record.seller_id;

    -- If no preferences set, use defaults
    IF notification_prefs IS NULL THEN
      notification_prefs.email_notifications := true;
      notification_prefs.sms_notifications := false;
      notification_prefs.notify_on_new_order := true;
      notification_prefs.notification_email := NULL;
      notification_prefs.notification_phone := NULL;
    END IF;

    -- Create email notification if enabled
    IF notification_prefs.email_notifications AND notification_prefs.notify_on_new_order THEN
      INSERT INTO public.supplier_notifications (
        supplier_id,
        order_id,
        notification_type,
        notification_method,
        recipient_email,
        subject,
        message,
        status
      ) VALUES (
        supplier_record.seller_id,
        NEW.id,
        'new_order',
        'email',
        COALESCE(notification_prefs.notification_email, (SELECT email FROM auth.users WHERE id = supplier_record.seller_id)),
        'New Order Placed - Order #' || order_details.order_number,
        'Hello ' || supplier_record.supplier_name || ',

A new order has been placed that includes your products.

Order Details:
- Order Number: #' || order_details.order_number || '
- Customer: ' || order_details.customer_name || '
- Total Amount: $' || order_details.total_amount || '
- Status: ' || order_details.status || '

Please log in to your supplier dashboard to view the complete order details and prepare for fulfillment.

Thank you!',
        'pending'
      );
    END IF;

    -- Create SMS notification if enabled
    IF notification_prefs.sms_notifications AND notification_prefs.notify_on_new_order AND notification_prefs.notification_phone IS NOT NULL THEN
      INSERT INTO public.supplier_notifications (
        supplier_id,
        order_id,
        notification_type,
        notification_method,
        recipient_phone,
        subject,
        message,
        status
      ) VALUES (
        supplier_record.seller_id,
        NEW.id,
        'new_order',
        'sms',
        notification_prefs.notification_phone,
        NULL,
        'New order #' || order_details.order_number || ' placed with your products. Total: $' || order_details.total_amount || '. Check your dashboard.',
        'pending'
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: Create Trigger for New Orders
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_notify_suppliers_on_new_order ON public.orders;

CREATE TRIGGER trigger_notify_suppliers_on_new_order
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_suppliers_on_new_order();

-- ============================================================================
-- STEP 6: Add indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_supplier_notifications_supplier_id ON public.supplier_notifications(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_notifications_order_id ON public.supplier_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_notifications_status ON public.supplier_notifications(status);
CREATE INDEX IF NOT EXISTS idx_supplier_notifications_created_at ON public.supplier_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Global Settings table created successfully';
  RAISE NOTICE '✓ Notification system tables created';
  RAISE NOTICE '✓ Supplier notification triggers activated';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Configure notification preferences in your seller dashboard';
  RAISE NOTICE '2. Set up an Edge Function to process pending notifications (email/SMS)';
  RAISE NOTICE '3. Integrate with email service (e.g., Resend, SendGrid) for sending emails';
  RAISE NOTICE '4. Integrate with SMS service (e.g., Twilio) for sending SMS notifications';
END $$;
