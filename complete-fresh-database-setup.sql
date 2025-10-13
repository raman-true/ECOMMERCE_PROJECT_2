-- ============================================================================
-- COMPLETE DATABASE SETUP FOR FRESH SUPABASE DATABASE
-- ============================================================================
-- This script creates EVERYTHING from scratch:
-- 1. All core e-commerce tables
-- 2. Multi-vendor features (sellers, shipping, tracking)
-- 3. Enhanced features (password reset, admin, pickup, email, installation)
-- 4. RLS policies and security
-- 5. Indexes and performance optimization
--
-- Run this in Supabase SQL Editor: SQL Editor → New Query → Paste → Run
-- ============================================================================

-- ============================================================================
-- STEP 1: Helper Functions (Must be created first)
-- ============================================================================

-- Function to check if current user is admin (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 2: Core Tables
-- ============================================================================

-- User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'seller')),
  created_at timestamptz DEFAULT now()
);

-- Addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('billing', 'shipping')),
  first_name text NOT NULL,
  last_name text NOT NULL,
  company text,
  address1 text NOT NULL,
  address2 text,
  city text NOT NULL,
  state text NOT NULL,
  postcode text NOT NULL,
  country text NOT NULL DEFAULT 'Australia',
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Departments
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  product_count integer DEFAULT 0,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Shipping Carriers
CREATE TABLE IF NOT EXISTS public.shipping_carriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  api_endpoint text,
  tracking_url_template text,
  is_active boolean DEFAULT true,
  supported_countries text[] DEFAULT ARRAY['Australia'],
  created_at timestamptz DEFAULT now()
);

-- Products (with installation service fields)
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric NOT NULL,
  original_price numeric,
  images text[] DEFAULT ARRAY[]::text[],
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  brand text DEFAULT '',
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer DEFAULT 0,
  stock integer DEFAULT 0,
  specifications jsonb DEFAULT '{}'::jsonb,
  seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  discount_type text,
  discount_value numeric,
  is_taxable boolean DEFAULT true,
  is_shipping_exempt boolean DEFAULT false,
  weight_kg numeric DEFAULT 0,
  dimensions_cm jsonb DEFAULT '{"width": 0, "height": 0, "length": 0}'::jsonb,
  shipping_class text DEFAULT 'standard',
  has_installation_service boolean DEFAULT false,
  installation_price numeric DEFAULT 0 CHECK (installation_price >= 0),
  installation_description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Product Variants
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL,
  stock integer DEFAULT 0,
  attributes jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Cart Items (with installation option)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  includes_installation boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Wishlist
CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Orders (with pickup option)
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total numeric NOT NULL,
  shipping_address_id uuid REFERENCES public.addresses(id) ON DELETE SET NULL,
  billing_address_id uuid REFERENCES public.addresses(id) ON DELETE SET NULL,
  delivery_method text DEFAULT 'shipping' CHECK (delivery_method IN ('shipping', 'click-collect')),
  fulfillment_method text DEFAULT 'platform' CHECK (fulfillment_method IN ('platform', 'seller')),
  carrier_id uuid REFERENCES public.shipping_carriers(id) ON DELETE SET NULL,
  tracking_number text,
  estimated_delivery_date timestamptz,
  actual_delivery_date timestamptz,
  delivery_instructions text,
  created_at timestamptz DEFAULT now()
);

-- Order Items (with installation tracking)
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price numeric NOT NULL,
  includes_installation boolean DEFAULT false,
  installation_price numeric DEFAULT 0 CHECK (installation_price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Order Tracking
CREATE TABLE IF NOT EXISTS public.order_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  location text,
  notes text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Order Taxes
CREATE TABLE IF NOT EXISTS public.order_taxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  tax_type text NOT NULL,
  tax_rate numeric NOT NULL,
  tax_amount numeric NOT NULL,
  applied_by text NOT NULL CHECK (applied_by IN ('global', 'seller')),
  created_at timestamptz DEFAULT now()
);

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  price numeric NOT NULL,
  duration text DEFAULT '',
  category text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- DIY Articles
CREATE TABLE IF NOT EXISTS public.diy_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  featured_image text DEFAULT '',
  author text DEFAULT '',
  published_at timestamptz DEFAULT now(),
  category text DEFAULT '',
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Global Settings
CREATE TABLE IF NOT EXISTS public.global_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_tax_rate numeric DEFAULT 0.00,
  tax_type text DEFAULT 'GST' CHECK (tax_type IN ('GST', 'VAT', 'Sales_Tax')),
  allow_seller_tax_override boolean DEFAULT false,
  free_shipping_threshold numeric DEFAULT 0.00,
  default_shipping_carriers jsonb DEFAULT '[]'::jsonb,
  platform_fulfillment_enabled boolean DEFAULT true,
  standard_delivery_days text DEFAULT '2-5',
  express_delivery_days text DEFAULT '1-2',
  delivery_tracking_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seller Settings (with pickup location)
CREATE TABLE IF NOT EXISTS public.seller_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_registration_number text,
  tax_rate_override numeric,
  prices_include_tax boolean DEFAULT false,
  fulfillment_method text DEFAULT 'platform' CHECK (fulfillment_method IN ('platform', 'self')),
  shipping_rules jsonb DEFAULT '{}'::jsonb,
  free_shipping_threshold numeric,
  self_delivery_enabled boolean DEFAULT false,
  pickup_address_id uuid REFERENCES public.addresses(id) ON DELETE SET NULL,
  delivery_sla_days integer DEFAULT 5,
  pickup_enabled boolean DEFAULT true,
  pickup_location_name text DEFAULT '',
  pickup_location_address text DEFAULT '',
  pickup_instructions text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shipping Rules
CREATE TABLE IF NOT EXISTS public.shipping_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_name text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('free', 'flat_rate', 'weight_based', 'price_based')),
  conditions jsonb DEFAULT '{}'::jsonb,
  shipping_cost numeric DEFAULT 0.00,
  carrier_id uuid REFERENCES public.shipping_carriers(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Email Notification Preferences
CREATE TABLE IF NOT EXISTS public.email_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_confirmations boolean DEFAULT true,
  order_updates boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email Notification Log
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

-- ============================================================================
-- STEP 3: Additional Functions
-- ============================================================================

-- Function to promote user to admin
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email text)
RETURNS void AS $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;

  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_profiles (id, role, first_name, last_name)
    VALUES (target_user_id, 'admin', 'Support', 'Admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default email preferences
CREATE OR REPLACE FUNCTION public.create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.email_notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: Triggers
-- ============================================================================

DROP TRIGGER IF EXISTS on_user_profile_created_email_prefs ON public.user_profiles;
CREATE TRIGGER on_user_profile_created_email_prefs
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_email_preferences();

-- ============================================================================
-- STEP 5: Enable RLS on All Tables
-- ============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diy_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notification_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: RLS Policies
-- ============================================================================

-- User Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can view all profiles" ON public.user_profiles;
CREATE POLICY "Admin can view all profiles"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admin can update all profiles" ON public.user_profiles;
CREATE POLICY "Admin can update all profiles"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Addresses Policies
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
CREATE POLICY "Users can manage own addresses"
  ON public.addresses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Departments Policies (Public Read, Admin Write)
DROP POLICY IF EXISTS "Public can view departments" ON public.departments;
CREATE POLICY "Public can view departments"
  ON public.departments FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admin can manage departments" ON public.departments;
CREATE POLICY "Admin can manage departments"
  ON public.departments FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Categories Policies
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories"
  ON public.categories FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Sellers can manage own categories" ON public.categories;
CREATE POLICY "Sellers can manage own categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Admin can manage all categories" ON public.categories;
CREATE POLICY "Admin can manage all categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Products Policies
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products"
  ON public.products FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Sellers can manage own products" ON public.products;
CREATE POLICY "Sellers can manage own products"
  ON public.products FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Admin can manage all products" ON public.products;
CREATE POLICY "Admin can manage all products"
  ON public.products FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Product Variants Policies
DROP POLICY IF EXISTS "Public can view variants" ON public.product_variants;
CREATE POLICY "Public can view variants"
  ON public.product_variants FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Product owner can manage variants" ON public.product_variants;
CREATE POLICY "Product owner can manage variants"
  ON public.product_variants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_variants.product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Cart Items Policies
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;
CREATE POLICY "Users can manage own cart"
  ON public.cart_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Wishlist Policies
DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlist;
CREATE POLICY "Users can manage own wishlist"
  ON public.wishlist FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Orders Policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
CREATE POLICY "Admin can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admin can update all orders" ON public.orders;
CREATE POLICY "Admin can update all orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Order Items Policies
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admin can view all order items" ON public.order_items;
CREATE POLICY "Admin can view all order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (is_admin());

-- Services Policies
DROP POLICY IF EXISTS "Public can view services" ON public.services;
CREATE POLICY "Public can view services"
  ON public.services FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admin can manage services" ON public.services;
CREATE POLICY "Admin can manage services"
  ON public.services FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- DIY Articles Policies
DROP POLICY IF EXISTS "Public can view articles" ON public.diy_articles;
CREATE POLICY "Public can view articles"
  ON public.diy_articles FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admin can manage articles" ON public.diy_articles;
CREATE POLICY "Admin can manage articles"
  ON public.diy_articles FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Seller Settings Policies
DROP POLICY IF EXISTS "Sellers can manage own settings" ON public.seller_settings;
CREATE POLICY "Sellers can manage own settings"
  ON public.seller_settings FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Admin can view all seller settings" ON public.seller_settings;
CREATE POLICY "Admin can view all seller settings"
  ON public.seller_settings FOR SELECT
  TO authenticated
  USING (is_admin());

-- Shipping Carriers Policies
DROP POLICY IF EXISTS "Public can view carriers" ON public.shipping_carriers;
CREATE POLICY "Public can view carriers"
  ON public.shipping_carriers FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admin can manage carriers" ON public.shipping_carriers;
CREATE POLICY "Admin can manage carriers"
  ON public.shipping_carriers FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Email Notification Preferences Policies
DROP POLICY IF EXISTS "Users can view own email prefs" ON public.email_notification_preferences;
CREATE POLICY "Users can view own email prefs"
  ON public.email_notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own email prefs" ON public.email_notification_preferences;
CREATE POLICY "Users can update own email prefs"
  ON public.email_notification_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own email prefs" ON public.email_notification_preferences;
CREATE POLICY "Users can insert own email prefs"
  ON public.email_notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Email Notification Log Policies
DROP POLICY IF EXISTS "Admin can view all email logs" ON public.email_notification_log;
CREATE POLICY "Admin can view all email logs"
  ON public.email_notification_log FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Users can view own email logs" ON public.email_notification_log;
CREATE POLICY "Users can view own email logs"
  ON public.email_notification_log FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_user_id);

-- ============================================================================
-- STEP 7: Performance Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_seller ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_department ON public.products(department_id);
CREATE INDEX IF NOT EXISTS idx_categories_department ON public.categories(department_id);
CREATE INDEX IF NOT EXISTS idx_categories_seller ON public.categories(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_method ON public.orders(delivery_method);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_products_installation ON public.products(has_installation_service) WHERE has_installation_service = true;
CREATE INDEX IF NOT EXISTS idx_email_log_status ON public.email_notification_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_order ON public.email_notification_log(order_id);
CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON public.email_notification_log(recipient_user_id);

-- ============================================================================
-- STEP 8: Initial Data (Optional)
-- ============================================================================

-- Insert default global settings
INSERT INTO public.global_settings (
  default_tax_rate,
  tax_type,
  allow_seller_tax_override,
  free_shipping_threshold,
  platform_fulfillment_enabled,
  standard_delivery_days,
  express_delivery_days,
  delivery_tracking_enabled
) VALUES (
  0.10, -- 10% GST
  'GST',
  false,
  100.00,
  true,
  '2-5',
  '1-2',
  true
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================

-- Verify everything was created
SELECT 'Migration completed successfully!' as status;

-- Show table count
SELECT
  'Created ' || count(*) || ' tables' as summary
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';
