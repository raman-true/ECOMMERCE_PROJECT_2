edgeFunctions.ts:106 POST https://yoaurficxcpzbqhaeptl.supabase.co/functions/v1/calculate-order-total 500 (Internal Server Error)
edgeFunctions.ts:126 Direct Edge Function call error: Error: Product not found for ID: 67e2f023-2fc6-4f18-9d46-361e878da7c1 at calculateOrderTotalDirect (edgeFunctions.ts:117:13) at async CheckoutPage.tsx:102:22
CheckoutPage.tsx:123 Error calculating totals: Error: Product not found for ID: 67e2f023-2fc6-4f18-9d46-361e878da7c1 at CheckoutPage.tsx:112:15
﻿
  --------------------- WARNING: This schema is for context only and is not meant to be run.
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
  tags ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT diy_articles_pkey PRIMARY KEY (id)
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
  created_at timestamp with time zone DEFAULT now(),
  fulfillment_method text DEFAULT 'platform'::text CHECK (fulfillment_method = ANY (ARRAY['platform'::text, 'seller'::text])),
  carrier_id uuid,
  tracking_number text,
  estimated_delivery_date timestamp with time zone,
  actual_delivery_date timestamp with time zone,
  delivery_instructions text,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT orders_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES public.addresses(id),
  CONSTRAINT orders_billing_address_id_fkey FOREIGN KEY (billing_address_id) REFERENCES public.addresses(id),
  CONSTRAINT orders_carrier_id_fkey FOREIGN KEY (carrier_id) REFERENCES public.shipping_carriers(id)
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
  images ARRAY DEFAULT '{}'::text[],
  category_id uuid,
  department_id uuid,
  brand text DEFAULT ''::text,
  rating numeric DEFAULT 0 CHECK (rating >= 0::numeric AND rating <= 5::numeric),
  review_count integer DEFAULT 0,
  stock integer DEFAULT 0,
  specifications jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  seller_id uuid,
  discount_type text,
  discount_value numeric,
  is_taxable boolean DEFAULT true,
  is_shipping_exempt boolean DEFAULT false,
  weight_kg numeric DEFAULT 0,
  dimensions_cm jsonb DEFAULT '{"width": 0, "height": 0, "length": 0}'::jsonb,
  shipping_class text DEFAULT 'standard'::text,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT products_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users(id)
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
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT seller_settings_pkey PRIMARY KEY (id),
  CONSTRAINT seller_settings_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES auth.users(id),
  CONSTRAINT seller_settings_pickup_address_fkey FOREIGN KEY (pickup_address_id) REFERENCES public.addresses(id)
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
  supported_countries ARRAY DEFAULT '{Australia}'::text[],
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
);Edge Functions

1.  

2. calculate-order-total

Docs
Download
Test

* Overview

* Invocations

* Logs

* Code

* Details

Function Configuration
Name
Your slug and endpoint URL will remain the same
Verify JWT with legacy secret
Requires that a JWT signed only by the legacy JWT secret is present in the Authorization header. The easy to obtain anon key can be used to satisfy this requirement. Recommendation: OFF with JWT and additional authorization logic implemented inside your function's code.
Save changes
Invoke function
cURLJavaScriptSwiftFlutterPython

```bash
curl -L -X POST 'https://yoaurficxcpzbqhaeptl.supabase.co/functions/v1/calculate-order-total' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvYXVyZmljeGNwemJxaGFlcHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTM2NzAsImV4cCI6MjA3NDk4OTY3MH0.i30uYs_5b_F0GHUEdu9uQ67hHgEaOLcNIbjfMbQ5vh8' \
  -H 'Content-Type: application/json' \
  --data '{"name":"Functions"}'
```

Develop locally
> 1. Download the function
$supabase functions download calculate-order-total
> Deploy a new version
$supabase functions deploy calculate-order-total
> Delete the function
$supabase functions delete calculate-order-total
Delete function
Once your function is deleted, it can no longer be restored
Make sure you have made a backup if you want to restore your edge function
Delete edge function
Details
Slug
calculate-order-total
Endpoint URL
Copy
 
Region
All functions are deployed globally
Created at
Friday, October 3, 2025 4:32 PM
Last updated at
Friday, October 3, 2025 4:32 PM
Deployments
1
Import Maps
Import maps are not used for this function
Import maps allow the use of bare specifiers in functions instead of explicit import URLs
More about import maps

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2.57.2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  try {
    const { items, shippingAddress } = await req.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({
        error: 'Cart items are required'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    let subtotal = 0;
    let totalTax = 0;
    let totalFreight = 0;
    const processedItems = [];
    // Fetch global settings for default tax rate and shipping threshold
    const { data: globalSettings, error: globalSettingsError } = await supabaseClient.from('global_settings').select('default_tax_rate, free_shipping_threshold, tax_type, allow_seller_tax_override').maybeSingle();
    if (globalSettingsError) {
      console.error('Error fetching global settings:', globalSettingsError.message);
    }
    const globalDefaultTaxRate = globalSettings?.default_tax_rate || 10; // Default 10% GST
    const globalFreeShippingThreshold = globalSettings?.free_shipping_threshold || 99.00;
    const globalDefaultShippingCost = 9.95; // Default shipping cost when threshold not met
    // Group items by seller to fetch settings once per seller
    const itemsBySeller = {};
    for (const item of items){
      const { data: productData, error: productError } = await supabaseClient.from('products').select(`
          price,
          seller_id,
          discount_type,
          discount_value,
          is_taxable,
          is_shipping_exempt,
          override_global_settings,
          custom_tax_rate,
          custom_shipping_cost,
          product_variants (id, price)
        `).eq('id', item.product_id).single();
      if (productError || !productData) {
        console.error('Error fetching product data:', productError?.message || 'Product not found');
        throw new Error(`Product not found for ID: ${item.product_id}`);
      }
      // ✅ FIXED: Handle admin products (null seller_id)
      const sellerId = productData.seller_id || 'admin';
      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }
      itemsBySeller[sellerId].push({
        ...item,
        productData
      });
    }
    for(const sellerId in itemsBySeller){
      const sellerItems = itemsBySeller[sellerId];
      // ✅ FIXED: Skip seller settings lookup for admin products
      let sellerSettings = null;
      if (sellerId !== 'admin') {
        const { data: settings, error: settingsError } = await supabaseClient.from('seller_settings').select('tax_rate, freight_rules, override_global_tax, override_global_shipping').eq('seller_id', sellerId).maybeSingle();
        if (settingsError) {
          console.error(`Error fetching seller settings for ${sellerId}:`, settingsError.message);
        }
        sellerSettings = settings;
      }
      // Determine effective tax rate and shipping rules for this seller
      const effectiveSellerTaxRate = sellerSettings?.override_global_tax && sellerSettings?.tax_rate !== undefined && sellerSettings.tax_rate !== null ? sellerSettings.tax_rate : globalDefaultTaxRate;
      const effectiveSellerFreightRules = sellerSettings?.override_global_shipping && sellerSettings?.freight_rules ? sellerSettings.freight_rules : {
        type: 'flat_rate',
        cost: globalDefaultShippingCost
      };
      let sellerSubtotal = 0;
      let sellerFreightForThisSeller = 0;
      let sellerSubtotalForFreightCalculation = 0; // Subtotal of items NOT shipping exempt
      let totalQuantityForFreightCalculation = 0; // Quantity of items NOT shipping exempt
      for (const item of sellerItems){
        const basePrice = item.variant_id ? item.productData.product_variants.find((v)=>v.id === item.variant_id)?.price || item.productData.price : item.productData.price;
        let effectivePrice = basePrice;
        // Apply discount
        if (item.productData.discount_type === 'percentage' && item.productData.discount_value !== null) {
          effectivePrice = basePrice * (1 - item.productData.discount_value / 100);
        } else if (item.productData.discount_type === 'flat_amount' && item.productData.discount_value !== null) {
          effectivePrice = basePrice - item.productData.discount_value;
        }
        effectivePrice = Math.max(0, effectivePrice); // Ensure price doesn't go below zero
        sellerSubtotal += effectivePrice * item.quantity;
        processedItems.push({
          ...item,
          effectivePrice
        });
        // Only include items that are NOT shipping exempt in freight calculation
        if (!item.productData.is_shipping_exempt) {
          sellerSubtotalForFreightCalculation += effectivePrice * item.quantity;
          totalQuantityForFreightCalculation += item.quantity;
        }
        // Calculate tax for this item if it's taxable - check for product-specific override first
        if (item.productData.is_taxable && shippingAddress?.country === 'Australia') {
          let applicableTaxRate = effectiveSellerTaxRate;
          // Check if product has custom tax rate override
          if (item.productData.override_global_settings && item.productData.custom_tax_rate !== null) {
            applicableTaxRate = item.productData.custom_tax_rate;
          }
          if (applicableTaxRate > 0) {
            totalTax += effectivePrice * item.quantity * (parseFloat(applicableTaxRate) / 100);
          }
        }
      }
      // Calculate freight for this seller based on items NOT shipping exempt
      if (totalQuantityForFreightCalculation > 0) {
        // Check global free shipping threshold first
        if (sellerSubtotalForFreightCalculation >= globalFreeShippingThreshold) {
          sellerFreightForThisSeller = 0; // Free shipping threshold met
        } else if (effectiveSellerFreightRules.type === 'flat_rate' && effectiveSellerFreightRules.cost !== undefined) {
          sellerFreightForThisSeller = parseFloat(effectiveSellerFreightRules.cost);
        } else if (effectiveSellerFreightRules.type === 'per_item' && effectiveSellerFreightRules.cost !== undefined) {
          sellerFreightForThisSeller = parseFloat(effectiveSellerFreightRules.cost) * totalQuantityForFreightCalculation;
        } else if (effectiveSellerFreightRules.type === 'free_shipping_threshold' && effectiveSellerFreightRules.free_shipping_threshold !== undefined) {
          if (sellerSubtotalForFreightCalculation < parseFloat(effectiveSellerFreightRules.free_shipping_threshold)) {
            sellerFreightForThisSeller = globalDefaultShippingCost;
          } else {
            sellerFreightForThisSeller = 0;
          }
        } else {
          // Default case: use global shipping cost
          sellerFreightForThisSeller = globalDefaultShippingCost;
        }
      }
      totalFreight += sellerFreightForThisSeller;
      subtotal += sellerSubtotal; // This subtotal includes all items, even non-taxable ones
    }
    const grandTotal = subtotal + totalTax + totalFreight;
    return new Response(JSON.stringify({
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      totalFreight: parseFloat(totalFreight.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      breakdown: {
        sellers: Object.keys(itemsBySeller).map((sellerId)=>({
            sellerId,
            subtotal: parseFloat(itemsBySeller[sellerId].reduce((sum, item)=>sum + (item.effectivePrice || 0) * item.quantity, 0).toFixed(2)),
            tax: 0,
            freight: 0,
            total: 0 // Could be calculated per seller if needed
          }))
      },
      processedItems: processedItems
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Order total calculation failed:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
```

```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAddresses } from '../hooks/useSupabase';
import { Button } from '../components/ui/Button';
import { QuickAddressForm } from '../components/address/QuickAddressForm';
import { AddressList } from '../components/account/AddressList';
import { MapPin, Package, CreditCard } from 'lucide-react';
import { Address } from '../types';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';
import { calculateOrderTotal, calculateOrderTotalDirect } from '../lib/edgeFunctions';

export function CheckoutPage() {
  const { cartItems, cartLoading, cartError, closeCart, state: { user } } = useApp();
  const { addresses, loading: addressesLoading, error: addressesError } = useAddresses(user?.id || null);
  const navigate = useNavigate();

  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<string | null>(null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formAddressType, setFormAddressType] = useState<'shipping' | 'billing'>('shipping');
  const [processingCheckout, setProcessingCheckout] = useState(false);

  // State for calculated totals
  const [calculatedSubtotal, setCalculatedSubtotal] = useState('0.00');
  const [calculatedTax, setCalculatedTax] = useState('0.00');
  const [calculatedFreight, setCalculatedFreight] = useState('0.00');
  const [calculatedGrandTotal, setCalculatedGrandTotal] = useState('0.00');
  const [calculationLoading, setCalculationLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, cartLoading, navigate]);

  useEffect(() => {
    if (!addressesLoading && addresses.length > 0) {
      const defaultShipping = addresses.find(addr => addr.type === 'shipping');
      const defaultBilling = addresses.find(addr => addr.type === 'billing');
      if (defaultShipping) setSelectedShippingAddressId(defaultShipping.id);
      if (defaultBilling) setSelectedBillingAddressId(defaultBilling.id);
    }
  }, [addresses, addressesLoading]);

  // Function to calculate totals using Edge Function
  const calculateTotals = useCallback(async () => {
    if (cartItems.length === 0) {
      setCalculatedSubtotal('0.00');
      setCalculatedTax('0.00');
      setCalculatedFreight('0.00');
      setCalculatedGrandTotal('0.00');
      setCalculationError(null);
      return;
    }

    // Calculate basic subtotal even without shipping address
    const basicSubtotal = cartItems.reduce((sum, item) => {
      const basePrice = item.product_variants?.price || item.products.price;
      let effectivePrice = basePrice;
      if (item.products.discountType === 'percentage' && item.products.discountValue !== undefined && item.products.discountValue !== null) {
        effectivePrice = basePrice * (1 - item.products.discountValue / 100);
      } else if (item.products.discountType === 'flat_amount' && item.products.discountValue !== undefined && item.products.discountValue !== null) {
        effectivePrice = basePrice - item.products.discountValue;
      }
      effectivePrice = Math.max(0, effectivePrice);
      return sum + (effectivePrice * item.quantity);
    }, 0);

    setCalculatedSubtotal(basicSubtotal.toFixed(2));

    if (!selectedShippingAddressId) {
      // Show subtotal but indicate shipping/tax need address
      setCalculatedTax('--');
      setCalculatedFreight('--');
      setCalculatedGrandTotal(basicSubtotal.toFixed(2));
      setCalculationError('Please select a shipping address to calculate tax and shipping.');
      return;
    }

    setCalculationLoading(true);
    setCalculationError(null);

    const shippingAddr = addresses.find(addr => addr.id === selectedShippingAddressId);
    if (!shippingAddr) {
      setCalculationError('Shipping address not found.');
      setCalculationLoading(false);
      return;
    }

    const itemsForCalculation = cartItems.map(item => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
    }));

    try {
      // Use direct method to avoid CORS issues
      const result = await calculateOrderTotalDirect({
        items: itemsForCalculation,
        shippingAddress: {
          country: shippingAddr.country,
          state: shippingAddr.state,
          postcode: shippingAddr.postcode,
        },
      });

      if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to calculate totals');
      }

      const data = result.data;
      setCalculatedSubtotal(data.subtotal.toFixed(2));
      setCalculatedTax(data.totalTax.toFixed(2));
      setCalculatedFreight(data.totalFreight.toFixed(2));
      setCalculatedGrandTotal(data.grandTotal.toFixed(2));

    } catch (err: any) {
      setCalculationError(err.message || 'Failed to calculate totals.');
      console.error('Error calculating totals:', err);
    } finally {
      setCalculationLoading(false);
    }
  }, [cartItems, selectedShippingAddressId, addresses]);

  // Recalculate totals when cart items or selected shipping address changes
  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const handleAddAddress = (type: 'shipping' | 'billing') => {
    setEditingAddress(null);
    setFormAddressType(type);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormAddressType(address.type);
    setShowAddressForm(true);
  };

  const handleFormSuccess = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleFormCancel = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleProceedToPayment = async () => {
    if (!selectedShippingAddressId || !selectedBillingAddressId) {
      alert('Please select both shipping and billing addresses.');
      return;
    }
    if (!user?.id) {
      alert('User not logged in. Please log in to proceed.');
      return;
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items to your cart.');
      navigate('/cart');
      return;
    }

    setProcessingCheckout(true);

    try {
      // 1. Create a new order in Supabase with 'pending' status
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status: 'pending',
          total: parseFloat(calculatedGrandTotal),
          shipping_address_id: selectedShippingAddressId,
          billing_address_id: selectedBillingAddressId,
          delivery_method: 'shipping',
        })
        .select('id')
        .single();

      if (orderError || !newOrder) {
        throw new Error(`Failed to create order: ${orderError?.message}`);
      }

      // 2. Add order items
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: newOrder.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.product_variants?.price || item.products.price, // Use original price for order_items
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (orderItemsError) {
        throw new Error(`Failed to create order items: ${orderItemsError.message}`);
      }

      // 3. Call Supabase Edge Function to create Stripe Checkout Session
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          orderId: newOrder.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create Stripe Checkout session: ${errorData.error}`);
      }

      const { sessionId } = await response.json();

      // 4. Redirect to Stripe Checkout
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      if (stripe) {
        const { error: stripeRedirectError } = await stripe.redirectToCheckout({ sessionId });
        if (stripeRedirectError) {
          throw new Error(`Stripe redirect error: ${stripeRedirectError.message}`);
        }
      } else {
        throw new Error('Stripe.js failed to load.');
      }

    } catch (error: any) {
      console.error('Checkout process failed:', error);
      alert(`Failed to proceed to payment: ${error.message}`);
    } finally {
      setProcessingCheckout(false);
    }
  };

  if (cartLoading || addressesLoading || processingCheckout) {
    return (
      <div className="min-h-screen flex items-center justify-center text-brown-600">
        {processingCheckout ? 'Processing checkout...' : 'Loading checkout details...'}
      </div>
    );
  }

  if (cartError || addressesError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {cartError || addressesError}
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-brown-600">
        Your cart is empty. <Link to="/shop" className="text-brown-700 hover:underline ml-2">Go to shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brown-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-brown-900 mb-8 text-center">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-brown-900 mb-6 flex items-center">
              <Package className="w-6 h-6 mr-3" /> Order Summary
            </h2>
            <div className="divide-y divide-brown-200">
              {cartItems.map((item) => {
                const basePrice = item.product_variants?.price || item.products.price;
                let effectivePrice = basePrice;
                if (item.products.discountType === 'percentage' && item.products.discountValue !== undefined && item.products.discountValue !== null) {
                  effectivePrice = basePrice * (1 - item.products.discountValue / 100);
                } else if (item.products.discountType === 'flat_amount' && item.products.discountValue !== undefined && item.products.discountValue !== null) {
                  effectivePrice = basePrice - item.products.discountValue;
                }
                effectivePrice = Math.max(0, effectivePrice); // Ensure price doesn't go below zero

                return (
                  <div key={item.id} className="flex items-center py-4">
                    <img
                      src={item.products.images[0] || 'https://placehold.co/80?text=Product'}
                      alt={item.products.name}
                      className="w-20 h-20 object-cover rounded-lg border border-brown-200"
                    />
                    <div className="flex-1 ml-4">
                      <h3 className="font-semibold text-lg text-brown-900">
                        {item.products.name}
                      </h3>
                      {item.product_variants && (
                        <p className="text-sm text-brown-600">Variant: {item.product_variants.name}</p>
                      )}
                      <p className="text-brown-700 mt-1">
                        {item.products.discountType && item.products.discountValue !== undefined && item.products.discountValue !== null ? (
                          <>
                            <span className="line-through">${basePrice.toFixed(2)}</span>{' '}
                            <span className="text-red-600">${effectivePrice.toFixed(2)}</span> each
                          </>
                        ) : (
                          `$${basePrice.toFixed(2)} each`
                        )}
                         x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-brown-900">
                        {"$" + (effectivePrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-lg text-brown-700 mt-6">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>{"$" + calculatedSubtotal}</span>
            </div>
            <div className="flex justify-between items-center text-lg text-brown-700 mb-3">
              <span>Shipping</span>
              {calculationLoading ? (
                <span>Calculating...</span>
              ) : calculatedFreight === '--' ? (
                <span className="text-brown-500">Select address</span>
              ) : (
                <span>{"$" + calculatedFreight}</span>
              )}
            </div>
            <div className="flex justify-between items-center text-lg text-brown-700 mb-6">
              <span>Tax (GST 10%)</span>
              {calculationLoading ? (
                <span>Calculating...</span>
              ) : calculatedTax === '--' ? (
                <span className="text-brown-500">Select address</span>
              ) : (
                <span>{"$" + calculatedTax}</span>
              )}
            </div>
            <div className="flex justify-between items-center text-2xl font-bold text-brown-900 border-t border-brown-200 pt-4">
              <span>Total</span>
              <span>{"$" + calculatedGrandTotal}</span>
            </div>
          </div>

          {/* Shipping & Billing Addresses */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit sticky top-8">
            <h2 className="text-2xl font-bold text-brown-900 mb-6 flex items-center">
              <MapPin className="w-6 h-6 mr-3" /> Shipping & Billing
            </h2>

            {showAddressForm ? (
              <>
                <h3 className="text-xl font-semibold text-brown-900 mb-4">
                  {editingAddress ? 'Edit Address' : `Add New ${formAddressType === 'shipping' ? 'Shipping' : 'Billing'} Address`}
                </h3>
                <QuickAddressForm
                  type={formAddressType}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              </>
            ) : (
              <div className="space-y-6">
                {/* Shipping Address Selection */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-brown-900">Shipping Address</h3>
                    <Button variant="outline" size="sm" onClick={() => handleAddAddress('shipping')}>
                      Add New
                    </Button>
                  </div>
                  {addresses.filter(addr => addr.type === 'shipping').length > 0 ? (
                    <div className="space-y-3">
                      {addresses.filter(addr => addr.type === 'shipping').map(addr => (
                        <div
                          key={addr.id}
                          className={`p-4 border rounded-lg cursor-pointer ${
                            selectedShippingAddressId === addr.id ? 'border-brown-500 ring-2 ring-brown-500' : 'border-brown-200'
                          }`}
                          onClick={() => setSelectedShippingAddressId(addr.id)}
                        >
                          <p className="font-medium text-brown-900">{addr.first_name} {addr.last_name}</p>
                          <p className="text-sm text-brown-600">{addr.address1}, {addr.city}, {addr.state} {addr.postcode}</p>
                          <div className="flex space-x-2 mt-2">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}>Edit</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-brown-600">No shipping addresses found. Please add one.</p>
                  )}
                </div>

                {/* Billing Address Selection */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-brown-900">Billing Address</h3>
                    <Button variant="outline" size="sm" onClick={() => handleAddAddress('billing')}>
                      Add New
                    </Button>
                  </div>
                  {addresses.filter(addr => addr.type === 'billing').length > 0 ? (
                    <div className="space-y-3">
                      {addresses.filter(addr => addr.type === 'billing').map(addr => (
                        <div
                          key={addr.id}
                          className={`p-4 border rounded-lg cursor-pointer ${
                            selectedBillingAddressId === addr.id ? 'border-brown-500 ring-2 ring-brown-500' : 'border-brown-200'
                          }`}
                          onClick={() => setSelectedBillingAddressId(addr.id)}
                        >
                          <p className="font-medium text-brown-900">{addr.first_name} {addr.last_name}</p>
                          <p className="text-sm text-brown-600">{addr.address1}, {addr.city}, {addr.state} {addr.postcode}</p>
                          <div className="flex space-x-2 mt-2">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}>Edit</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-brown-600">No billing addresses found. Please add one.</p>
                  )}
                </div>

                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={handleProceedToPayment}
                  disabled={!selectedShippingAddressId || !selectedBillingAddressId || processingCheckout || calculationLoading || !!calculationError}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {processingCheckout ? 'Processing...' : (calculationLoading ? 'Calculating...' : 'Proceed to Payment')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@stripe/stripe-js'],
    exclude: ['lucide-react'],
  },
  define: {
    // Ensure environment variables are available at build time
    'process.env': process.env,
  },
  server: {
    // Proxy Edge Functions during development
    proxy: {
      '/functions': {
        target: process.env.VITE_SUPABASE_URL || 'https://yoaurficxcpzbqhaeptl.supabase.co',
        changeOrigin: true,
        secure: true,
        headers: {
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvYXVyZmljeGNwemJxaGFlcHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTM2NzAsImV4cCI6MjA3NDk4OTY3MH0.i30uYs_5b_F0GHUEdu9uQ67hHgEaOLcNIbjfMbQ5vh8'}`,
        },
      },
    },
  },
});
```

```typescript
// src/lib/edgeFunctions.ts
import { supabase } from './supabase';

interface EdgeFunctionOptions {
  functionName: string;
  body?: any;
  headers?: Record<string, string>;
}

interface EdgeFunctionResponse<T = any> {
  data: T | null;
  error: string | null;
}

/**
 * Call a Supabase Edge Function with proper error handling
 */
export async function callEdgeFunction<T = any>({
  functionName,
  body,
  headers = {},
}: EdgeFunctionOptions): Promise<EdgeFunctionResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (error) {
      console.error(`Edge Function ${functionName} error:`, error);
      return {
        data: null,
        error: error.message || `Failed to call ${functionName}`,
      };
    }

    return {
      data,
      error: null,
    };
  } catch (err: any) {
    console.error(`Edge Function ${functionName} exception:`, err);
    return {
      data: null,
      error: err.message || `Exception calling ${functionName}`,
    };
  }
}

/**
 * Calculate order totals using the Edge Function
 */
export interface OrderCalculationRequest {
  items: Array<{
    product_id: string;
    variant_id?: string | null;
    quantity: number;
  }>;
  shippingAddress: {
    country: string;
    state: string;
    postcode: string;
  };
}

export interface OrderCalculationResponse {
  subtotal: number;
  totalTax: number;
  totalFreight: number;
  grandTotal: number;
  breakdown: {
    sellers: Array<{
      sellerId: string;
      subtotal: number;
      tax: number;
      freight: number;
      total: number;
    }>;
  };
}

export async function calculateOrderTotal(
  request: OrderCalculationRequest
): Promise<EdgeFunctionResponse<OrderCalculationResponse>> {
  // Use direct method to avoid CORS issues with Supabase client
  return calculateOrderTotalDirect(request);
}

/**
 * Alternative direct fetch method (fallback)
 */
export async function calculateOrderTotalDirect(
  request: OrderCalculationRequest
): Promise<EdgeFunctionResponse<OrderCalculationResponse>> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/calculate-order-total`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      data,
      error: null,
    };
  } catch (err: any) {
    console.error('Direct Edge Function call error:', err);
    return {
      data: null,
      error: err.message || 'Failed to calculate order total',
    };
  }
}
```