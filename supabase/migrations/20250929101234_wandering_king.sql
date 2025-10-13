/*
  # Add Global Product Settings and Enhanced Tax/Shipping System

  1. New Tables
    - `global_product_settings` - Global tax and shipping settings that apply to all products by default
    - Enhanced `seller_settings` - Seller-specific overrides
    - Enhanced `products` - Product-specific overrides

  2. Security
    - Enable RLS on new tables
    - Add policies for admin and seller access

  3. Features
    - Global default tax rate and shipping rules
    - Seller-level overrides for their products
    - Product-level overrides for specific products
    - Hierarchical application: Global → Seller → Product
*/

-- Create global product settings table
CREATE TABLE IF NOT EXISTS global_product_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_tax_rate numeric(5,2) DEFAULT 0.00,
  default_shipping_cost numeric(10,2) DEFAULT 0.00,
  free_shipping_threshold numeric(10,2) DEFAULT 99.00,
  apply_tax_to_shipping boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE global_product_settings ENABLE ROW LEVEL SECURITY;

-- Add policy for admins to manage global settings
CREATE POLICY "Admins can manage global product settings"
  ON global_product_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = uid() AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = uid() AND user_profiles.role = 'admin'
    )
  );

-- Add policy for public read access to global settings (needed for calculations)
CREATE POLICY "Public can read global product settings"
  ON global_product_settings
  FOR SELECT
  TO public
  USING (true);

-- Add columns to products table for product-specific overrides
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'custom_tax_rate'
  ) THEN
    ALTER TABLE products ADD COLUMN custom_tax_rate numeric(5,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'custom_shipping_cost'
  ) THEN
    ALTER TABLE products ADD COLUMN custom_shipping_cost numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'override_global_settings'
  ) THEN
    ALTER TABLE products ADD COLUMN override_global_settings boolean DEFAULT false;
  END IF;
END $$;

-- Enhance seller_settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_settings' AND column_name = 'override_global_tax'
  ) THEN
    ALTER TABLE seller_settings ADD COLUMN override_global_tax boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seller_settings' AND column_name = 'override_global_shipping'
  ) THEN
    ALTER TABLE seller_settings ADD COLUMN override_global_shipping boolean DEFAULT false;
  END IF;
END $$;

-- Insert default global settings
INSERT INTO global_product_settings (id, default_tax_rate, default_shipping_cost, free_shipping_threshold, apply_tax_to_shipping)
VALUES ('00000000-0000-0000-0000-000000000001', 10.00, 9.95, 99.00, false)
ON CONFLICT (id) DO NOTHING;

-- Update existing global_settings table to be more comprehensive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'global_settings' AND column_name = 'default_shipping_cost'
  ) THEN
    ALTER TABLE global_settings ADD COLUMN default_shipping_cost numeric(10,2) DEFAULT 9.95;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'global_settings' AND column_name = 'free_shipping_threshold'
  ) THEN
    ALTER TABLE global_settings ADD COLUMN free_shipping_threshold numeric(10,2) DEFAULT 99.00;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'global_settings' AND column_name = 'apply_tax_to_shipping'
  ) THEN
    ALTER TABLE global_settings ADD COLUMN apply_tax_to_shipping boolean DEFAULT false;
  END IF;
END $$;