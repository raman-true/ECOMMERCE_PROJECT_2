/*
  # Add product-level tax and shipping control

  1. Schema Changes
    - Add `is_taxable` column to products table (boolean, default true)
    - Add `is_shipping_exempt` column to products table (boolean, default false)
    - Create `global_settings` table for admin-controlled default tax rate

  2. Security
    - Enable RLS on `global_settings` table
    - Add policy for admins to manage global settings
*/

-- Add new columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_taxable BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_shipping_exempt BOOLEAN DEFAULT FALSE;

-- Create global_settings table
CREATE TABLE IF NOT EXISTS public.global_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  default_tax_rate NUMERIC(5, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT global_settings_pkey PRIMARY KEY (id)
);

-- Insert a default row
INSERT INTO public.global_settings (id, default_tax_rate)
VALUES ('00000000-0000-0000-0000-000000000001', 0.10)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow only admins to read/update
CREATE POLICY "Admins can manage global settings"
ON public.global_settings
FOR ALL
TO authenticated
USING (EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.role = 'admin'::text))))
WITH CHECK (EXISTS ( SELECT 1 FROM user_profiles WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.role = 'admin'::text))));