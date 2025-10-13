import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable auto-detection to handle manually
    flowType: 'pkce'
  }
});

// Database types based on our schema
export type Database = {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          image: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string;
          image?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          image?: string;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          image: string;
          product_count: number;
          department_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string;
          image?: string;
          product_count?: number;
          department_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          image?: string;
          product_count?: number;
          department_id?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          price: number;
          original_price: number | null;
          images: string[];
          category_id: string | null;
          department_id: string | null;
          brand: string;
          rating: number;
          review_count: number;
          stock: number;
          specifications: Record<string, any>;
          created_at: string;
          discount_type?: 'percentage' | 'flat_amount' | null; // NEW
          discount_value?: number | null; // NEW
          is_taxable?: boolean;
          is_shipping_exempt?: boolean;
          override_global_settings?: boolean;
          custom_tax_rate?: number | null;
          custom_shipping_cost?: number | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string;
          price: number;
          original_price?: number | null;
          images?: string[];
          category_id?: string | null;
          department_id?: string | null;
          brand?: string;
          rating?: number;
          review_count?: number;
          stock?: number;
          specifications?: Record<string, any>;
          created_at?: string;
          discount_type?: 'percentage' | 'flat_amount' | null; // NEW
          discount_value?: number | null; // NEW
          is_taxable?: boolean;
          is_shipping_exempt?: boolean;
          override_global_settings?: boolean;
          custom_tax_rate?: number | null;
          custom_shipping_cost?: number | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          price?: number;
          original_price?: number | null;
          images?: string[];
          category_id?: string | null;
          department_id?: string | null;
          brand?: string;
          rating?: number;
          review_count?: number;
          stock?: number;
          specifications?: Record<string, any>;
          created_at?: string;
          discount_type?: 'percentage' | 'flat_amount' | null; // NEW
          discount_value?: number | null; // NEW
          is_taxable?: boolean;
          is_shipping_exempt?: boolean;
          override_global_settings?: boolean;
          custom_tax_rate?: number | null;
          custom_shipping_cost?: number | null;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          price: number;
          stock: number;
          attributes: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          price: number;
          stock?: number;
          attributes?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          price?: number;
          stock?: number;
          attributes?: Record<string, any>;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          first_name?: string;
          last_name?: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          role?: string;
          created_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          first_name: string;
          last_name: string;
          company: string | null;
          address1: string;
          address2: string | null;
          city: string;
          state: string;
          postcode: string;
          country: string;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          first_name: string;
          last_name: string;
          company?: string | null;
          address1: string;
          address2?: string | null;
          city: string;
          state: string;
          postcode: string;
          country?: string;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          first_name?: string;
          last_name?: string;
          company?: string | null;
          address1?: string;
          address2?: string | null;
          city?: string;
          state?: string;
          postcode?: string;
          country?: string;
          phone?: string | null;
          created_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          variant_id?: string | null;
          quantity?: number;
          created_at?: string;
        };
      };
      platform_settings: {
        Row: {
          id: string;
          default_tax_rate: number;
          tax_type: string;
          allow_seller_tax_override: boolean;
          free_shipping_threshold: number;
          default_shipping_carriers: string[];
          platform_fulfillment_enabled: boolean;
          standard_delivery_days: string;
          express_delivery_days: string;
          delivery_tracking_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          default_tax_rate?: number;
          tax_type?: string;
          allow_seller_tax_override?: boolean;
          free_shipping_threshold?: number;
          default_shipping_carriers?: string[];
          platform_fulfillment_enabled?: boolean;
          standard_delivery_days?: string;
          express_delivery_days?: string;
          delivery_tracking_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          default_tax_rate?: number;
          tax_type?: string;
          allow_seller_tax_override?: boolean;
          free_shipping_threshold?: number;
          default_shipping_carriers?: string[];
          platform_fulfillment_enabled?: boolean;
          standard_delivery_days?: string;
          express_delivery_days?: string;
          delivery_tracking_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status: string;
          total: number;
          shipping_address_id: string | null;
          billing_address_id: string | null;
          delivery_method: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_number: string;
          status?: string;
          total: number;
          shipping_address_id?: string | null;
          billing_address_id?: string | null;
          delivery_method?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_number?: string;
          status?: string;
          total?: number;
          shipping_address_id?: string | null;
          billing_address_id?: string | null;
          delivery_method?: string;
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity?: number;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          variant_id?: string | null;
          quantity?: number;
          price?: number;
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          image: string;
          price: number;
          duration: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string;
          image?: string;
          price: number;
          duration?: string;
          category?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          image?: string;
          price?: number;
          duration?: string;
          category?: string;
          created_at?: string;
        };
      };
      diy_articles: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          content: string;
          featured_image: string;
          author: string;
          published_at: string;
          category: string;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt?: string;
          content?: string;
          featured_image?: string;
          author?: string;
          published_at?: string;
          category?: string;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string;
          content?: string;
          featured_image?: string;
          author?: string;
          published_at?: string;
          category?: string;
          tags?: string[];
          created_at?: string;
        };
        global_settings: {
          Row: {
            id: string;
            default_tax_rate: number;
            default_shipping_cost: number;
            free_shipping_threshold: number;
            apply_tax_to_shipping: boolean;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            default_tax_rate?: number;
            default_shipping_cost?: number;
            free_shipping_threshold?: number;
            apply_tax_to_shipping?: boolean;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            default_tax_rate?: number;
            default_shipping_cost?: number;
            free_shipping_threshold?: number;
            apply_tax_to_shipping?: boolean;
            created_at?: string;
            updated_at?: string;
          };
        };
      };
    };
  };
};
