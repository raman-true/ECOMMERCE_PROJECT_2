-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type text NOT NULL CHECK (type = ANY (ARRAY['billing'::text, 'shipping'::text])),
  first_name text NOT NULL,
  last_name text NOT NULL,
  company text,
  address1 text NOT NULL,
  address2 text,
  city text NOT NULL,
  state text NOT NULL,
  postcode text NOT NULL,
  country text NOT NULL DEFAULT 'Australia'::text,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  product_id uuid,
  variant_id uuid,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  includes_installation boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text DEFAULT ''::text,
  image text DEFAULT ''::text,
  product_count integer DEFAULT 0,
  department_id uuid,
  seller_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT categories_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users(id)
);
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text DEFAULT ''::text,
  image text DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT departments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.diy_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text DEFAULT ''::text,
  content text DEFAULT ''::text,
  featured_image text DEFAULT ''::text,
  author text DEFAULT ''::text,
  published_at timestamp with time zone DEFAULT now(),
  category text DEFAULT ''::text,
  tags ARRAY DEFAULT ARRAY[]::text[],
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT diy_articles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.email_notification_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  recipient_user_id uuid,
  email_type text NOT NULL CHECK (email_type = ANY (ARRAY['order_confirmation'::text, 'order_update'::text, 'supplier_notification'::text, 'admin_notification'::text, 'password_reset'::text])),
  order_id uuid,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text])),
  error_message text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT email_notification_log_pkey PRIMARY KEY (id),
  CONSTRAINT email_notification_log_recipient_user_id_fkey FOREIGN KEY (recipient_user_id) REFERENCES auth.users(id),
  CONSTRAINT email_notification_log_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.email_notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  order_confirmations boolean DEFAULT true,
  order_updates boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT email_notification_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT email_notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.global_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  default_tax_rate numeric DEFAULT 0.00,
  tax_type text DEFAULT 'GST'::text CHECK (tax_type = ANY (ARRAY['GST'::text, 'VAT'::text, 'Sales_Tax'::text])),
  allow_seller_tax_override boolean DEFAULT false,
  free_shipping_threshold numeric DEFAULT 0.00,
  default_shipping_carriers jsonb DEFAULT '[]'::jsonb,
  platform_fulfillment_enabled boolean DEFAULT true,
  standard_delivery_days text DEFAULT '2-5'::text,
  express_delivery_days text DEFAULT '1-2'::text,
  delivery_tracking_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT global_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  product_id uuid,
  variant_id uuid,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price numeric NOT NULL,
  includes_installation boolean DEFAULT false,
  installation_price numeric DEFAULT 0 CHECK (installation_price >= 0::numeric),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);
CREATE TABLE public.order_taxes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  tax_type text NOT NULL,
  tax_rate numeric NOT NULL,
  tax_amount numeric NOT NULL,
  applied_by text NOT NULL CHECK (applied_by = ANY (ARRAY['global'::text, 'seller'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_taxes_pkey PRIMARY KEY (id),
  CONSTRAINT order_taxes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.order_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid,
  status text NOT NULL,
  location text,
  notes text,
  updated_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_tracking_pkey PRIMARY KEY (id),
  CONSTRAINT order_tracking_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_tracking_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  order_number text NOT NULL UNIQUE,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text])),
  total numeric NOT NULL,
  shipping_address_id uuid,
  billing_address_id uuid,
  delivery_method text DEFAULT 'shipping'::text CHECK (delivery_method = ANY (ARRAY['shipping'::text, 'click-collect'::text])),
  fulfillment_method text DEFAULT 'platform'::text CHECK (fulfillment_method = ANY (ARRAY['platform'::text, 'seller'::text])),
  carrier_id uuid,
  tracking_number text,
  estimated_delivery_date timestamp with time zone,
  actual_delivery_date timestamp with time zone,
  delivery_instructions text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT orders_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES public.addresses(id),
  CONSTRAINT orders_billing_address_id_fkey FOREIGN KEY (billing_address_id) REFERENCES public.addresses(id),
  CONSTRAINT orders_carrier_id_fkey FOREIGN KEY (carrier_id) REFERENCES public.shipping_carriers(id)
);
CREATE TABLE public.password_reset_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.product_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid,
  name text NOT NULL,
  price numeric NOT NULL,
  stock integer DEFAULT 0,
  attributes jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text DEFAULT ''::text,
  price numeric NOT NULL,
  original_price numeric,
  images ARRAY DEFAULT ARRAY[]::text[],
  category_id uuid,
  department_id uuid,
  brand text DEFAULT ''::text,
  rating numeric DEFAULT 0 CHECK (rating >= 0::numeric AND rating <= 5::numeric),
  review_count integer DEFAULT 0,
  stock integer DEFAULT 0,
  specifications jsonb DEFAULT '{}'::jsonb,
  seller_id uuid,
  discount_type text,
  discount_value numeric,
  is_taxable boolean DEFAULT true,
  is_shipping_exempt boolean DEFAULT false,
  weight_kg numeric DEFAULT 0,
  dimensions_cm jsonb DEFAULT '{"width": 0, "height": 0, "length": 0}'::jsonb,
  shipping_class text DEFAULT 'standard'::text,
  has_installation_service boolean DEFAULT false,
  installation_price numeric DEFAULT 0 CHECK (installation_price >= 0::numeric),
  installation_description text DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT products_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users(id)
);
CREATE TABLE public.seller_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  business_name text NOT NULL,
  business_type text NOT NULL CHECK (business_type = ANY (ARRAY['sole_trader'::text, 'partnership'::text, 'company'::text, 'trust'::text])),
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
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  rejection_reason text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT seller_applications_pkey PRIMARY KEY (id),
  CONSTRAINT seller_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT seller_applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id)
);
CREATE TABLE public.seller_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid UNIQUE,
  tax_registration_number text,
  tax_rate_override numeric,
  prices_include_tax boolean DEFAULT false,
  fulfillment_method text DEFAULT 'platform'::text CHECK (fulfillment_method = ANY (ARRAY['platform'::text, 'self'::text])),
  shipping_rules jsonb DEFAULT '{}'::jsonb,
  free_shipping_threshold numeric,
  self_delivery_enabled boolean DEFAULT false,
  pickup_address_id uuid,
  delivery_sla_days integer DEFAULT 5,
  pickup_enabled boolean DEFAULT true,
  pickup_location_name text DEFAULT ''::text,
  pickup_location_address text DEFAULT ''::text,
  pickup_instructions text DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT seller_settings_pkey PRIMARY KEY (id),
  CONSTRAINT seller_settings_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users(id),
  CONSTRAINT seller_settings_pickup_address_id_fkey FOREIGN KEY (pickup_address_id) REFERENCES public.addresses(id)
);
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text DEFAULT ''::text,
  image text DEFAULT ''::text,
  price numeric NOT NULL,
  duration text DEFAULT ''::text,
  category text DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);
CREATE TABLE public.shipping_carriers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  api_endpoint text,
  tracking_url_template text,
  is_active boolean DEFAULT true,
  supported_countries ARRAY DEFAULT ARRAY['Australia'::text],
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shipping_carriers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.shipping_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid,
  rule_name text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type = ANY (ARRAY['free'::text, 'flat_rate'::text, 'weight_based'::text, 'price_based'::text])),
  conditions jsonb DEFAULT '{}'::jsonb,
  shipping_cost numeric DEFAULT 0.00,
  carrier_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shipping_rules_pkey PRIMARY KEY (id),
  CONSTRAINT shipping_rules_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users(id),
  CONSTRAINT shipping_rules_carrier_id_fkey FOREIGN KEY (carrier_id) REFERENCES public.shipping_carriers(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  first_name text DEFAULT ''::text,
  last_name text DEFAULT ''::text,
  role text DEFAULT 'customer'::text CHECK (role = ANY (ARRAY['customer'::text, 'admin'::text, 'seller'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.wishlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  product_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wishlist_pkey PRIMARY KEY (id),
  CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT wishlist_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);