# Updated Database Schema for Multi-Vendor Platform

## Key Changes for 3-Tier Role System (Admin → Seller → Customer)

### 1. Enhanced Global Settings (Admin Controls)

```sql
-- Enhanced global settings for platform-wide rules
CREATE TABLE public.global_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  -- Tax Configuration
  default_tax_rate numeric DEFAULT 0.00,
  tax_type text DEFAULT 'GST' CHECK (tax_type = ANY (ARRAY['GST', 'VAT', 'Sales_Tax'])),
  allow_seller_tax_override boolean DEFAULT false,
  
  -- Shipping Configuration  
  free_shipping_threshold numeric DEFAULT 0.00,
  default_shipping_carriers jsonb DEFAULT '[]'::jsonb, -- ["FedEx", "DHL", "Amazon Logistics"]
  platform_fulfillment_enabled boolean DEFAULT true,
  
  -- Delivery Configuration
  standard_delivery_days text DEFAULT '2-5',
  express_delivery_days text DEFAULT '1-2',
  delivery_tracking_enabled boolean DEFAULT true,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT global_settings_pkey PRIMARY KEY (id)
);
```

### 2. New Shipping Carriers Table (Admin Managed)

```sql
-- Platform shipping carriers (Admin configures)
CREATE TABLE public.shipping_carriers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL, -- "FedEx", "DHL", "Amazon Logistics"
  code text NOT NULL UNIQUE, -- "fedex", "dhl", "amazon"
  api_endpoint text,
  tracking_url_template text, -- "https://fedex.com/track?id={tracking_number}"
  is_active boolean DEFAULT true,
  supported_countries text[] DEFAULT '{"Australia"}',
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shipping_carriers_pkey PRIMARY KEY (id)
);
```

### 3. Enhanced Seller Settings (Seller Controls)

```sql
-- Enhanced seller settings for tax, shipping, delivery preferences
CREATE TABLE public.seller_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid UNIQUE,
  
  -- Tax Settings
  tax_registration_number text, -- GSTIN, VAT ID, etc.
  tax_rate_override numeric, -- Only if global allows override
  prices_include_tax boolean DEFAULT false,
  
  -- Shipping Settings
  fulfillment_method text DEFAULT 'platform' CHECK (fulfillment_method = ANY (ARRAY['platform', 'self'])),
  shipping_rules jsonb DEFAULT '{}'::jsonb, -- Custom shipping charges
  free_shipping_threshold numeric, -- Seller-specific threshold
  
  -- Delivery Settings  
  self_delivery_enabled boolean DEFAULT false,
  pickup_address_id uuid, -- Reference to addresses table
  delivery_sla_days integer DEFAULT 5,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT seller_settings_pkey PRIMARY KEY (id),
  CONSTRAINT seller_settings_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users(id),
  CONSTRAINT seller_settings_pickup_address_fkey FOREIGN KEY (pickup_address_id) REFERENCES public.addresses(id)
);
```

### 4. New Shipping Rules Table (Seller Configures)

```sql
-- Seller-specific shipping rules
CREATE TABLE public.shipping_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid,
  rule_name text NOT NULL, -- "Free Shipping", "Flat Rate", "Weight Based"
  rule_type text NOT NULL CHECK (rule_type = ANY (ARRAY['free', 'flat_rate', 'weight_based', 'price_based'])),
  conditions jsonb DEFAULT '{}'::jsonb, -- {"min_order": 100, "max_weight": 5}
  shipping_cost numeric DEFAULT 0.00,
  carrier_id uuid, -- Reference to shipping_carriers
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shipping_rules_pkey PRIMARY KEY (id),
  CONSTRAINT shipping_rules_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users(id),
  CONSTRAINT shipping_rules_carrier_id_fkey FOREIGN KEY (carrier_id) REFERENCES public.shipping_carriers(id)
);
```

### 5. Enhanced Products Table (Weight/Dimensions for Shipping)

```sql
-- Add shipping-related fields to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_kg numeric DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS dimensions_cm jsonb DEFAULT '{"length": 0, "width": 0, "height": 0}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shipping_class text DEFAULT 'standard'; -- standard, fragile, hazardous
```

### 6. Enhanced Orders Table (Delivery Tracking)

```sql
-- Add delivery tracking fields to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fulfillment_method text DEFAULT 'platform' CHECK (fulfillment_method = ANY (ARRAY['platform', 'seller']));
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS carrier_id uuid REFERENCES public.shipping_carriers(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_delivery_date timestamp with time zone;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS actual_delivery_date timestamp with time zone;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_instructions text;
```

### 7. New Order Tracking Table (Delivery Status Updates)

```sql
-- Detailed order tracking for delivery status
CREATE TABLE public.order_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  status text NOT NULL, -- "order_placed", "processing", "picked_up", "in_transit", "out_for_delivery", "delivered"
  location text,
  notes text,
  updated_by uuid, -- Admin, Seller, or System
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_tracking_pkey PRIMARY KEY (id),
  CONSTRAINT order_tracking_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_tracking_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);
```

### 8. Tax Calculations Table (For Complex Tax Rules)

```sql
-- Store calculated taxes for orders (audit trail)
CREATE TABLE public.order_taxes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  tax_type text NOT NULL, -- "GST", "VAT", "State_Tax"
  tax_rate numeric NOT NULL,
  tax_amount numeric NOT NULL,
  applied_by text NOT NULL CHECK (applied_by = ANY (ARRAY['global', 'seller'])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_taxes_pkey PRIMARY KEY (id),
  CONSTRAINT order_taxes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
```

## Role-Based Access Summary

### Admin (Platform Owner) Can:
- Configure `global_settings` (tax rates, shipping thresholds, delivery SLAs)
- Manage `shipping_carriers` (add/remove carriers, API configs)
- View all `order_tracking` and override delivery status
- Set platform-wide tax and shipping policies

### Seller (Merchant) Can:
- Configure `seller_settings` (tax registration, fulfillment method, delivery preferences)
- Create `shipping_rules` for their products
- Update `order_tracking` for their orders (if self-fulfilling)
- Set product `weight_kg` and `dimensions_cm` for shipping calculations

### Customer (User) Can:
- View calculated prices (product + tax + shipping) - READ ONLY
- Select delivery options during checkout - LIMITED WRITE
- Track order status via `order_tracking` - READ ONLY
- Cannot modify any tax, shipping, or delivery configurations

## Key Features Enabled:

1. **Flexible Tax System**: Global defaults with seller overrides
2. **Multi-Fulfillment**: Platform fulfillment (FBA-style) or seller self-ship
3. **Dynamic Shipping**: Weight-based, price-based, or flat-rate shipping rules
4. **Comprehensive Tracking**: Real-time delivery status updates
5. **Audit Trail**: Complete history of tax calculations and delivery updates
