// src/types/index.ts
export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  department: string;
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  specifications: Record<string, string>;
  variants?: ProductVariant[];
  category_id?: string | null;
  department_id?: string | null;
  discountType?: 'percentage' | 'flat_amount';
  discountValue?: number;
  isTaxable?: boolean;
  isShippingExempt?: boolean;
  override_global_settings?: boolean;
  custom_tax_rate?: number | null;
  custom_shipping_cost?: number | null;
  seller_id?: string | null;
  has_installation_service?: boolean;
  installation_price?: number;
  installation_description?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface Department {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  categories: Category[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  department_id?: string | null;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
  includes_installation?: boolean;
  products: Product;
  product_variants: ProductVariant | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  addresses: Address[];
  orders: Order[];
  wishlist: string[];
  role?: string;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: CartItem[];
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  deliveryMethod: 'shipping' | 'click-collect';
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  category: string;
}

export interface DIYArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
}

export interface EmailNotificationPreferences {
  id: string;
  user_id: string;
  order_confirmations: boolean;
  order_updates: boolean;
  marketing_emails: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailNotificationLog {
  id: string;
  recipient_email: string;
  recipient_user_id: string | null;
  email_type: 'order_confirmation' | 'order_update' | 'supplier_notification' | 'admin_notification' | 'password_reset';
  order_id: string | null;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

export interface SellerSettings {
  id: string;
  seller_id: string;
  tax_registration_number?: string;
  tax_rate_override?: number;
  prices_include_tax: boolean;
  fulfillment_method: 'platform' | 'self';
  shipping_rules?: Record<string, unknown>;
  free_shipping_threshold?: number;
  self_delivery_enabled: boolean;
  pickup_address_id?: string;
  delivery_sla_days: number;
  pickup_location_name?: string;
  pickup_location_address?: string;
  pickup_instructions?: string;
  pickup_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price: number;
  includes_installation?: boolean;
  installation_price?: number;
  created_at: string;
}

export interface SellerApplication {
  id: string;
  user_id: string;
  business_name: string;
  business_type: 'sole_trader' | 'partnership' | 'company' | 'trust';
  abn: string;
  business_address: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  website?: string;
  description: string;
  bank_account_name: string;
  bank_bsb: string;
  bank_account_number: string;
  documents?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}