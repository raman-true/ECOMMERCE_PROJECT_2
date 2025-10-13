-- Migration: Update global_settings table for multi-vendor platform
-- Run this in your Supabase SQL Editor

-- First, check if the table exists and add missing columns
DO $$
BEGIN
  -- Add new columns to global_settings table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'global_settings' AND column_name = 'tax_type') THEN
    ALTER TABLE public.global_settings ADD COLUMN tax_type text DEFAULT 'GST' CHECK (tax_type = ANY (ARRAY['GST'::text, 'VAT'::text, 'Sales_Tax'::text]));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'global_settings' AND column_name = 'allow_seller_tax_override') THEN
    ALTER TABLE public.global_settings ADD COLUMN allow_seller_tax_override boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'global_settings' AND column_name = 'free_shipping_threshold') THEN
    ALTER TABLE public.global_settings ADD COLUMN free_shipping_threshold numeric DEFAULT 0.00;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'global_settings' AND column_name = 'default_shipping_carriers') THEN
    ALTER TABLE public.global_settings ADD COLUMN default_shipping_carriers jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'global_settings' AND column_name = 'platform_fulfillment_enabled') THEN
    ALTER TABLE public.global_settings ADD COLUMN platform_fulfillment_enabled boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'global_settings' AND column_name = 'standard_delivery_days') THEN
    ALTER TABLE public.global_settings ADD COLUMN standard_delivery_days text DEFAULT '2-5';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'global_settings' AND column_name = 'express_delivery_days') THEN
    ALTER TABLE public.global_settings ADD COLUMN express_delivery_days text DEFAULT '1-2';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'global_settings' AND column_name = 'delivery_tracking_enabled') THEN
    ALTER TABLE public.global_settings ADD COLUMN delivery_tracking_enabled boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'global_settings' AND column_name = 'updated_at') THEN
    ALTER TABLE public.global_settings ADD COLUMN updated_at timestamp with time zone DEFAULT now();
  END IF;
END $$;

-- Insert default global settings if none exist
INSERT INTO public.global_settings (
  id,
  default_tax_rate,
  tax_type,
  allow_seller_tax_override,
  free_shipping_threshold,
  default_shipping_carriers,
  platform_fulfillment_enabled,
  standard_delivery_days,
  express_delivery_days,
  delivery_tracking_enabled,
  created_at,
  updated_at
) 
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  10.00, -- 10% default tax rate
  'GST',
  false,
  99.00, -- Free shipping above $99
  '["Australia Post", "FedEx", "DHL"]'::jsonb,
  true,
  '2-5',
  '1-2',
  true,
  now(),
  now()
WHERE NOT EXISTS (SELECT 1 FROM public.global_settings);

-- Create an update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_global_settings_updated_at ON public.global_settings;
CREATE TRIGGER update_global_settings_updated_at
    BEFORE UPDATE ON public.global_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
GRANT ALL ON public.global_settings TO authenticated;
GRANT ALL ON public.global_settings TO service_role;
