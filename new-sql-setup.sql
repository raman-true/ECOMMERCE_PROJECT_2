/*
  ============================================================================
  COMPLETE DATABASE SETUP - new-sql-setup.sql
  ============================================================================

  EcoConnect Supply Chain Platform - Complete Database Schema

  This file contains EVERYTHING needed for a fresh Supabase database:

  1. Core E-commerce Tables (products, orders, categories, departments)
  2. User Management (profiles, addresses, roles)
  3. Multi-Vendor System (seller settings, applications, approval workflow)
  4. Email Notifications (preferences, logs)
  5. Tax & Shipping Management (carriers, rules, tracking)
  6. Installation Services
  7. Password Reset System (NEW)
  8. Wishlist & Cart
  9. DIY Articles & Services
  10. RLS Policies (Security)
  11. Helper Functions
  12. Triggers & Automation
  13. Default Data

  USAGE:
  1. Open Supabase Dashboard → SQL Editor
  2. Copy and paste this entire file
  3. Click "Run"
  4. Wait for "Success" message

  SAFE TO RUN MULTIPLE TIMES (uses IF NOT EXISTS)
  ============================================================================
*/

-- ============================================================================
-- PART 1: HELPER FUNCTIONS (Create First)
-- ============================================================================

-- Function to check if user is admin (prevents infinite recursion in RLS)
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
-- PART 2: CORE TABLES
-- ============================================================================

-- User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'seller')),
  created_at timestamptz DEFAULT now()
);

-- Addresses for shipping and billing
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

-- Product departments (main categories like "Building Materials")
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Product categories (subcategories like "Lumber")
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  product_count integer DEFAULT 0,
  department_id uuid REFERENCES public.departments(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  original_price numeric(10,2),
  images text[] DEFAULT '{}',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  brand text DEFAULT '',
  rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer DEFAULT 0,
  stock integer DEFAULT 0,
  specifications jsonb DEFAULT '{}',
  seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- Product variants (different sizes, colors, etc.)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  stock integer DEFAULT 0,
  attributes jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Shopping cart
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  includes_installation boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);

-- Wishlist / Favorites
CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Shipping carriers (Australia Post, FedEx, etc.)
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

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total numeric(10,2) NOT NULL,
  shipping_address_id uuid REFERENCES public.addresses(id),
  billing_address_id uuid REFERENCES public.addresses(id),
  delivery_method text DEFAULT 'shipping' CHECK (delivery_method IN ('shipping', 'click-collect')),
  fulfillment_method text DEFAULT 'platform' CHECK (fulfillment_method IN ('platform', 'seller')),
  carrier_id uuid REFERENCES public.shipping_carriers(id),
  tracking_number text,
  estimated_delivery_date timestamptz,
  actual_delivery_date timestamptz,
  delivery_instructions text,
  created_at timestamptz DEFAULT now()
);

-- Order items (products in an order)
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price numeric(10,2) NOT NULL,
  includes_installation boolean DEFAULT false,
  installation_price numeric DEFAULT 0 CHECK (installation_price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Services offered (installation, consultation, etc.)
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  price numeric(10,2) NOT NULL,
  duration text DEFAULT '',
  category text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- DIY articles and guides
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
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Global platform settings
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

-- Seller-specific settings
CREATE TABLE IF NOT EXISTS public.seller_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_registration_number text,
  tax_rate_override numeric(5,2),
  prices_include_tax boolean DEFAULT false,
  fulfillment_method text DEFAULT 'platform' CHECK (fulfillment_method IN ('platform', 'self')),
  shipping_rules jsonb DEFAULT '{}'::jsonb,
  free_shipping_threshold numeric(10,2),
  self_delivery_enabled boolean DEFAULT false,
  pickup_address_id uuid REFERENCES public.addresses(id),
  delivery_sla_days integer DEFAULT 5,
  pickup_location_name text DEFAULT '',
  pickup_location_address text DEFAULT '',
  pickup_instructions text DEFAULT '',
  pickup_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seller shipping rules
CREATE TABLE IF NOT EXISTS public.shipping_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_name text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('free', 'flat_rate', 'weight_based', 'price_based')),
  conditions jsonb DEFAULT '{}'::jsonb,
  shipping_cost numeric(10,2) DEFAULT 0.00,
  carrier_id uuid REFERENCES public.shipping_carriers(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Order tracking history
CREATE TABLE IF NOT EXISTS public.order_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  location text,
  notes text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Order tax calculations audit
CREATE TABLE IF NOT EXISTS public.order_taxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  tax_type text NOT NULL,
  tax_rate numeric(5,2) NOT NULL,
  tax_amount numeric(10,2) NOT NULL,
  applied_by text NOT NULL CHECK (applied_by IN ('global', 'seller')),
  created_at timestamptz DEFAULT now()
);

-- Email notification preferences per user
CREATE TABLE IF NOT EXISTS public.email_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_confirmations boolean DEFAULT true,
  order_updates boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  password_reset_emails boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Email notification logs
CREATE TABLE IF NOT EXISTS public.email_notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  recipient_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email_type text NOT NULL CHECK (email_type IN ('order_confirmation', 'order_update', 'supplier_notification', 'admin_notification', 'password_reset', 'welcome')),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Seller applications (for onboarding approval)
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

-- Password reset tokens (NEW - for forgot password functionality)
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- PART 3: INDEXES FOR PERFORMANCE
-- ============================================================================

-- User & Auth indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_department_id ON public.products(department_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_installation ON public.products(has_installation_service) WHERE has_installation_service = true;

-- Category indexes
CREATE INDEX IF NOT EXISTS idx_categories_department_id ON public.categories(department_id);
CREATE INDEX IF NOT EXISTS idx_categories_seller_id ON public.categories(seller_id);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_method ON public.orders(delivery_method);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Cart & Wishlist indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);

-- Seller indexes
CREATE INDEX IF NOT EXISTS idx_seller_applications_user_id ON public.seller_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_applications_status ON public.seller_applications(status);
CREATE INDEX IF NOT EXISTS idx_seller_applications_created_at ON public.seller_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_settings_seller_id ON public.seller_settings(seller_id);

-- Email indexes
CREATE INDEX IF NOT EXISTS idx_email_log_status ON public.email_notification_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_order ON public.email_notification_log(order_id);
CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON public.email_notification_log(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_email_log_created_at ON public.email_notification_log(created_at DESC);

-- Password reset indexes (NEW)
CREATE INDEX IF NOT EXISTS idx_password_reset_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON public.password_reset_tokens(expires_at);

-- ============================================================================
-- PART 4: ENABLE ROW LEVEL SECURITY (RLS)
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
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diy_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 5: DROP OLD POLICIES (Safe to run multiple times)
-- ============================================================================

-- User Profiles
DROP POLICY IF EXISTS "Anyone can read user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.user_profiles;

-- Addresses
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;

-- Departments
DROP POLICY IF EXISTS "Anyone can read departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;

-- Categories
DROP POLICY IF EXISTS "Anyone can read categories" ON public.categories;
DROP POLICY IF EXISTS "Sellers can manage own categories" ON public.categories;

-- Products
DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
DROP POLICY IF EXISTS "Sellers can manage own products" ON public.products;

-- Product Variants
DROP POLICY IF EXISTS "Anyone can read product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Sellers can manage own product variants" ON public.product_variants;

-- Cart
DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;

-- Wishlist
DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlist;

-- Orders
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- Order Items
DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items for own orders" ON public.order_items;

-- Services
DROP POLICY IF EXISTS "Anyone can read services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;

-- DIY Articles
DROP POLICY IF EXISTS "Anyone can read DIY articles" ON public.diy_articles;
DROP POLICY IF EXISTS "Admins can manage DIY articles" ON public.diy_articles;

-- Shipping Carriers
DROP POLICY IF EXISTS "Anyone can read shipping carriers" ON public.shipping_carriers;
DROP POLICY IF EXISTS "Admins can manage shipping carriers" ON public.shipping_carriers;

-- Global Settings
DROP POLICY IF EXISTS "Anyone can read global settings" ON public.global_settings;
DROP POLICY IF EXISTS "Admins can manage global settings" ON public.global_settings;

-- Seller Settings
DROP POLICY IF EXISTS "Sellers can read own settings" ON public.seller_settings;
DROP POLICY IF EXISTS "Sellers can manage own settings" ON public.seller_settings;

-- Shipping Rules
DROP POLICY IF EXISTS "Anyone can read active shipping rules" ON public.shipping_rules;
DROP POLICY IF EXISTS "Sellers can manage own shipping rules" ON public.shipping_rules;

-- Order Tracking
DROP POLICY IF EXISTS "Users can read own order tracking" ON public.order_tracking;
DROP POLICY IF EXISTS "Admins and sellers can create tracking updates" ON public.order_tracking;

-- Order Taxes
DROP POLICY IF EXISTS "Users can read own order taxes" ON public.order_taxes;

-- Email Preferences
DROP POLICY IF EXISTS "Users can view own notification preferences" ON public.email_notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification preferences" ON public.email_notification_preferences;
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON public.email_notification_preferences;

-- Email Logs
DROP POLICY IF EXISTS "Admin can view all email logs" ON public.email_notification_log;
DROP POLICY IF EXISTS "Users can view own email logs" ON public.email_notification_log;

-- Seller Applications
DROP POLICY IF EXISTS "Users can view own applications" ON public.seller_applications;
DROP POLICY IF EXISTS "Users can create own applications" ON public.seller_applications;
DROP POLICY IF EXISTS "Users can update own pending applications" ON public.seller_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.seller_applications;
DROP POLICY IF EXISTS "Admins can update any application" ON public.seller_applications;

-- Password Reset (NEW)
DROP POLICY IF EXISTS "Users can view own reset tokens" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "Users can create own reset tokens" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "Users can update own reset tokens" ON public.password_reset_tokens;

-- ============================================================================
-- PART 6: CREATE RLS POLICIES
-- ============================================================================

-- ========== USER PROFILES ==========
CREATE POLICY "Anyone can read user profiles"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can delete any profile"
  ON public.user_profiles FOR DELETE
  TO authenticated
  USING (is_admin());

-- ========== ADDRESSES ==========
CREATE POLICY "Users can manage own addresses"
  ON public.addresses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========== DEPARTMENTS ==========
CREATE POLICY "Anyone can read departments"
  ON public.departments FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ========== CATEGORIES ==========
CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Sellers can manage own categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id OR is_admin())
  WITH CHECK (auth.uid() = seller_id OR is_admin());

-- ========== PRODUCTS ==========
CREATE POLICY "Anyone can read products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Sellers can manage own products"
  ON public.products FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id OR is_admin())
  WITH CHECK (auth.uid() = seller_id OR is_admin());

-- ========== PRODUCT VARIANTS ==========
CREATE POLICY "Anyone can read product variants"
  ON public.product_variants FOR SELECT
  USING (true);

CREATE POLICY "Sellers can manage own product variants"
  ON public.product_variants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_variants.product_id
      AND (products.seller_id = auth.uid() OR is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_variants.product_id
      AND (products.seller_id = auth.uid() OR is_admin())
    )
  );

-- ========== CART ==========
CREATE POLICY "Users can manage own cart items"
  ON public.cart_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========== WISHLIST ==========
CREATE POLICY "Users can manage own wishlist"
  ON public.wishlist FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========== ORDERS ==========
CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ========== ORDER ITEMS ==========
CREATE POLICY "Users can read own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- ========== SERVICES ==========
CREATE POLICY "Anyone can read services"
  ON public.services FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ========== DIY ARTICLES ==========
CREATE POLICY "Anyone can read DIY articles"
  ON public.diy_articles FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage DIY articles"
  ON public.diy_articles FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ========== SHIPPING CARRIERS ==========
CREATE POLICY "Anyone can read shipping carriers"
  ON public.shipping_carriers FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage shipping carriers"
  ON public.shipping_carriers FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ========== GLOBAL SETTINGS ==========
CREATE POLICY "Anyone can read global settings"
  ON public.global_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage global settings"
  ON public.global_settings FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ========== SELLER SETTINGS ==========
CREATE POLICY "Sellers can read own settings"
  ON public.seller_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id OR is_admin());

CREATE POLICY "Sellers can manage own settings"
  ON public.seller_settings FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id OR is_admin())
  WITH CHECK (auth.uid() = seller_id OR is_admin());

-- ========== SHIPPING RULES ==========
CREATE POLICY "Anyone can read active shipping rules"
  ON public.shipping_rules FOR SELECT
  USING (is_active = true OR auth.uid() = seller_id OR is_admin());

CREATE POLICY "Sellers can manage own shipping rules"
  ON public.shipping_rules FOR ALL
  TO authenticated
  USING (auth.uid() = seller_id OR is_admin())
  WITH CHECK (auth.uid() = seller_id OR is_admin());

-- ========== ORDER TRACKING ==========
CREATE POLICY "Users can read own order tracking"
  ON public.order_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_tracking.order_id
      AND (orders.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Admins and sellers can create tracking updates"
  ON public.order_tracking FOR INSERT
  TO authenticated
  WITH CHECK (is_admin() OR auth.uid() = updated_by);

-- ========== ORDER TAXES ==========
CREATE POLICY "Users can read own order taxes"
  ON public.order_taxes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_taxes.order_id
      AND (orders.user_id = auth.uid() OR is_admin())
    )
  );

-- ========== EMAIL PREFERENCES ==========
CREATE POLICY "Users can view own notification preferences"
  ON public.email_notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON public.email_notification_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON public.email_notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ========== EMAIL LOGS ==========
CREATE POLICY "Admin can view all email logs"
  ON public.email_notification_log FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can view own email logs"
  ON public.email_notification_log FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_user_id);

-- ========== SELLER APPLICATIONS ==========
CREATE POLICY "Users can view own applications"
  ON public.seller_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create own applications"
  ON public.seller_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending applications"
  ON public.seller_applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all applications"
  ON public.seller_applications FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update any application"
  ON public.seller_applications FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ========== PASSWORD RESET TOKENS (NEW) ==========
CREATE POLICY "Users can view own reset tokens"
  ON public.password_reset_tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reset tokens"
  ON public.password_reset_tokens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reset tokens"
  ON public.password_reset_tokens FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 7: FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Function: Handle new user registration
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
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create default email preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.email_notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update seller application timestamp
CREATE OR REPLACE FUNCTION public.update_seller_application_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Approve seller application
CREATE OR REPLACE FUNCTION public.approve_seller_application(
  application_id uuid,
  admin_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_status text;
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

-- Function: Reject seller application
CREATE OR REPLACE FUNCTION public.reject_seller_application(
  application_id uuid,
  admin_id uuid,
  reason text
)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_status text;
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

-- Function: Promote user to admin
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email text)
RETURNS void AS $$
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
    VALUES (target_user_id, 'admin', 'Admin', 'User')
    ON CONFLICT (id)
    DO UPDATE SET role = 'admin';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create password reset token (NEW)
CREATE OR REPLACE FUNCTION public.create_password_reset_token(
  p_user_id uuid,
  p_token text,
  p_expires_hours integer DEFAULT 24
)
RETURNS uuid AS $$
DECLARE
  token_id uuid;
BEGIN
  -- Invalidate any existing tokens for this user
  UPDATE public.password_reset_tokens
  SET used = true
  WHERE user_id = p_user_id AND used = false;

  -- Create new token
  INSERT INTO public.password_reset_tokens (
    user_id,
    token,
    expires_at
  ) VALUES (
    p_user_id,
    p_token,
    now() + (p_expires_hours || ' hours')::interval
  )
  RETURNING id INTO token_id;

  RETURN token_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Validate password reset token (NEW)
CREATE OR REPLACE FUNCTION public.validate_password_reset_token(
  p_token text
)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_used boolean;
  v_expires_at timestamptz;
BEGIN
  -- Get token details
  SELECT user_id, used, expires_at
  INTO v_user_id, v_used, v_expires_at
  FROM public.password_reset_tokens
  WHERE token = p_token;

  -- Check if token exists
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid token'
    );
  END IF;

  -- Check if already used
  IF v_used THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Token has already been used'
    );
  END IF;

  -- Check if expired
  IF v_expires_at < now() THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Token has expired'
    );
  END IF;

  -- Token is valid
  RETURN jsonb_build_object(
    'valid', true,
    'user_id', v_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Mark password reset token as used (NEW)
CREATE OR REPLACE FUNCTION public.use_password_reset_token(
  p_token text
)
RETURNS boolean AS $$
BEGIN
  UPDATE public.password_reset_tokens
  SET
    used = true,
    used_at = now()
  WHERE token = p_token;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Clean up expired password reset tokens (NEW)
CREATE OR REPLACE FUNCTION public.cleanup_expired_password_tokens()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.password_reset_tokens
  WHERE expires_at < now() - interval '7 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 8: TRIGGERS
-- ============================================================================

-- Trigger: Create user profile when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Create email preferences when user profile is created
DROP TRIGGER IF EXISTS on_user_profile_created_email_prefs ON public.user_profiles;
CREATE TRIGGER on_user_profile_created_email_prefs
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_email_preferences();

-- Trigger: Update seller application timestamp
DROP TRIGGER IF EXISTS trigger_update_seller_application_updated_at ON public.seller_applications;
CREATE TRIGGER trigger_update_seller_application_updated_at
  BEFORE UPDATE ON public.seller_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_seller_application_updated_at();

-- ============================================================================
-- PART 9: INSERT DEFAULT DATA
-- ============================================================================

-- Insert default global settings
INSERT INTO public.global_settings (
  id,
  default_tax_rate,
  tax_type,
  free_shipping_threshold,
  platform_fulfillment_enabled,
  delivery_tracking_enabled
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  10.00,
  'GST',
  99.00,
  true,
  true
)
ON CONFLICT (id) DO UPDATE SET
  default_tax_rate = EXCLUDED.default_tax_rate,
  tax_type = EXCLUDED.tax_type,
  updated_at = now();

-- Insert default shipping carriers
INSERT INTO public.shipping_carriers (name, code, tracking_url_template, is_active) VALUES
  ('Australia Post', 'auspost', 'https://auspost.com.au/mypost/track/#/details/{tracking_number}', true),
  ('FedEx', 'fedex', 'https://www.fedex.com/fedextrack/?tracknumbers={tracking_number}', true),
  ('DHL', 'dhl', 'https://www.dhl.com/au-en/home/tracking/tracking-express.html?submit=1&tracking-id={tracking_number}', true),
  ('TNT', 'tnt', 'https://www.tnt.com/express/en_au/site/tracking.html?searchType=con&cons={tracking_number}', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- PART 10: VERIFICATION QUERIES (Run these to check if setup succeeded)
-- ============================================================================

-- Check all tables exist
DO $$
DECLARE
  table_count integer;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

  RAISE NOTICE 'Total tables created: %', table_count;

  IF table_count >= 20 THEN
    RAISE NOTICE '✓ Database setup completed successfully!';
  ELSE
    RAISE WARNING '⚠ Some tables may be missing. Expected at least 20 tables.';
  END IF;
END $$;

-- List all tables
SELECT
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
--
-- Next steps:
-- 1. Register your first user at /register
-- 2. Promote to admin: SELECT promote_user_to_admin('your-email@example.com');
-- 3. Test password reset flow
-- 4. Create seller application
-- 5. Follow the TESTING_GUIDE.md for comprehensive testing
--
-- ============================================================================
