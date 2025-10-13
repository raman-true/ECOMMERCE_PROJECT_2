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
  taxInfo?: {
    taxType: string;
    taxRate: number;
    taxLabel: string;
    isMixed?: boolean;
    breakdown?: string[];
  };
  shippingInfo?: {
    method: string;
    label: string;
  };
  processedItems?: any[];
  breakdown?: {
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
