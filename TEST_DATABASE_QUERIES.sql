-- ============================================
-- Test Database Queries
-- Copy these queries into Supabase SQL Editor to test your database setup
-- ============================================

-- ============================================
-- 1. VERIFY MIGRATION COMPLETED
-- ============================================

-- Check all new tables exist
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'email_notification_preferences',
  'email_notification_log'
)
ORDER BY table_name;

-- Should show 2 tables


-- ============================================
-- 2. CHECK PRODUCT TABLE UPDATES
-- ============================================

-- Verify installation service columns exist
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN (
  'has_installation_service',
  'installation_price',
  'installation_description'
)
ORDER BY column_name;

-- Should show 3 rows


-- ============================================
-- 3. CHECK SELLER SETTINGS UPDATES
-- ============================================

-- Verify pickup columns exist
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'seller_settings'
AND column_name IN (
  'pickup_enabled',
  'pickup_location_name',
  'pickup_location_address',
  'pickup_instructions'
)
ORDER BY column_name;

-- Should show 4 rows


-- ============================================
-- 4. CHECK ADMIN USER
-- ============================================

-- Find admin user
SELECT
  u.id,
  u.email,
  u.created_at,
  up.role,
  up.first_name,
  up.last_name
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'support@abor-tech.com';

-- Should show admin with role = 'admin'


-- Check if user is promoted (alternative query)
SELECT
  id,
  role,
  first_name,
  last_name
FROM user_profiles
WHERE role = 'admin';

-- Should show at least one admin


-- ============================================
-- 5. TEST HELPER FUNCTIONS
-- ============================================

-- Test is_admin function (must be logged in as admin user)
SELECT is_admin();

-- Returns true if you're logged in as admin, false otherwise


-- List all functions created by migration
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'is_admin',
  'promote_user_to_admin',
  'create_default_email_preferences'
)
ORDER BY routine_name;

-- Should show 3 functions


-- ============================================
-- 6. CHECK RLS POLICIES
-- ============================================

-- List all RLS policies for new tables
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN (
  'email_notification_preferences',
  'email_notification_log'
)
ORDER BY tablename, policyname;

-- Should show policies for notification tables


-- List admin-related policies
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE policyname LIKE '%Admin%'
ORDER BY tablename, policyname;

-- Should show admin policies on products, categories, departments, orders


-- ============================================
-- 7. CHECK INDEXES
-- ============================================

-- List all indexes created by migration
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
  'idx_orders_delivery_method',
  'idx_products_installation',
  'idx_email_log_status',
  'idx_email_log_order',
  'idx_email_log_recipient'
)
ORDER BY tablename, indexname;

-- Should show 5 indexes


-- ============================================
-- 8. CHECK TRIGGERS
-- ============================================

-- List triggers on user_profiles
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_profiles'
ORDER BY trigger_name;

-- Should include 'on_user_profile_created_email_prefs'


-- ============================================
-- 9. SAMPLE DATA QUERIES
-- ============================================

-- Create a test product with installation (optional - for testing)
/*
INSERT INTO products (
  slug, name, description, price, has_installation_service,
  installation_price, installation_description, stock
) VALUES (
  'test-product-install',
  'Test Product with Installation',
  'This is a test product that offers installation service',
  299.99,
  true,
  99.99,
  'Professional installation included: delivery, setup, and testing',
  10
);
*/


-- Query products with installation service
SELECT
  id,
  name,
  price,
  has_installation_service,
  installation_price,
  installation_description
FROM products
WHERE has_installation_service = true;

-- Shows all products offering installation


-- ============================================
-- 10. EMAIL NOTIFICATION QUERIES
-- ============================================

-- Check default email preferences for users
SELECT
  enp.user_id,
  u.email,
  enp.order_confirmations,
  enp.order_updates,
  enp.marketing_emails
FROM email_notification_preferences enp
JOIN auth.users u ON enp.user_id = u.id
LIMIT 10;

-- Shows email preferences for users


-- Check email notification log (when emails are sent)
SELECT
  recipient_email,
  email_type,
  status,
  created_at,
  sent_at
FROM email_notification_log
ORDER BY created_at DESC
LIMIT 10;

-- Shows recent email notifications


-- ============================================
-- 11. DELIVERY METHOD QUERIES
-- ============================================

-- Count orders by delivery method
SELECT
  delivery_method,
  COUNT(*) as order_count
FROM orders
GROUP BY delivery_method;

-- Shows shipping vs click-collect orders


-- Check seller pickup settings
SELECT
  seller_id,
  pickup_enabled,
  pickup_location_name,
  pickup_location_address,
  pickup_instructions
FROM seller_settings
WHERE pickup_enabled = true;

-- Shows sellers offering pickup


-- ============================================
-- 12. ORDER ITEMS WITH INSTALLATION
-- ============================================

-- Query order items that include installation
SELECT
  oi.id,
  oi.order_id,
  p.name as product_name,
  oi.quantity,
  oi.price as product_price,
  oi.includes_installation,
  oi.installation_price,
  (oi.price * oi.quantity) + COALESCE(oi.installation_price, 0) as total
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE oi.includes_installation = true;

-- Shows orders with installation service


-- ============================================
-- 13. ADMIN PERMISSIONS TEST
-- ============================================

-- Test if current user can access admin functions
-- (Run while logged in as admin)
DO $$
BEGIN
  IF is_admin() THEN
    RAISE NOTICE 'User is an admin - full access granted';
  ELSE
    RAISE NOTICE 'User is not an admin - limited access';
  END IF;
END $$;


-- ============================================
-- 14. COMPLETE DATABASE HEALTH CHECK
-- ============================================

-- Run this to verify everything is set up correctly
SELECT
  'Tables Created' as check_type,
  COUNT(*)::text as result
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('email_notification_preferences', 'email_notification_log')

UNION ALL

SELECT
  'Product Columns Added' as check_type,
  COUNT(*)::text as result
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('has_installation_service', 'installation_price', 'installation_description')

UNION ALL

SELECT
  'Seller Settings Columns Added' as check_type,
  COUNT(*)::text as result
FROM information_schema.columns
WHERE table_name = 'seller_settings'
AND column_name IN ('pickup_enabled', 'pickup_location_name', 'pickup_location_address', 'pickup_instructions')

UNION ALL

SELECT
  'Functions Created' as check_type,
  COUNT(*)::text as result
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('is_admin', 'promote_user_to_admin', 'create_default_email_preferences')

UNION ALL

SELECT
  'Indexes Created' as check_type,
  COUNT(*)::text as result
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN ('idx_orders_delivery_method', 'idx_products_installation', 'idx_email_log_status', 'idx_email_log_order', 'idx_email_log_recipient')

UNION ALL

SELECT
  'Admin Users' as check_type,
  COUNT(*)::text as result
FROM user_profiles
WHERE role = 'admin';

-- Expected results:
-- Tables Created: 2
-- Product Columns Added: 3
-- Seller Settings Columns Added: 4
-- Functions Created: 3
-- Indexes Created: 5
-- Admin Users: 1 (or more)


-- ============================================
-- 15. CLEANUP / ROLLBACK (DANGER - USE WITH CAUTION)
-- ============================================

-- UNCOMMENT ONLY IF YOU NEED TO REMOVE THE MIGRATION
-- WARNING: This will delete data!

/*
-- Drop new tables
DROP TABLE IF EXISTS email_notification_log CASCADE;
DROP TABLE IF EXISTS email_notification_preferences CASCADE;

-- Remove columns from products
ALTER TABLE products DROP COLUMN IF EXISTS has_installation_service;
ALTER TABLE products DROP COLUMN IF EXISTS installation_price;
ALTER TABLE products DROP COLUMN IF EXISTS installation_description;

-- Remove columns from order_items
ALTER TABLE order_items DROP COLUMN IF EXISTS includes_installation;
ALTER TABLE order_items DROP COLUMN IF EXISTS installation_price;

-- Remove columns from cart_items
ALTER TABLE cart_items DROP COLUMN IF EXISTS includes_installation;

-- Remove columns from seller_settings
ALTER TABLE seller_settings DROP COLUMN IF EXISTS pickup_enabled;
ALTER TABLE seller_settings DROP COLUMN IF EXISTS pickup_location_name;
ALTER TABLE seller_settings DROP COLUMN IF EXISTS pickup_location_address;
ALTER TABLE seller_settings DROP COLUMN IF EXISTS pickup_instructions;

-- Drop functions
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS promote_user_to_admin(text);
DROP FUNCTION IF EXISTS create_default_email_preferences();

-- Drop indexes
DROP INDEX IF EXISTS idx_orders_delivery_method;
DROP INDEX IF EXISTS idx_products_installation;
DROP INDEX IF EXISTS idx_email_log_status;
DROP INDEX IF EXISTS idx_email_log_order;
DROP INDEX IF EXISTS idx_email_log_recipient;
*/
