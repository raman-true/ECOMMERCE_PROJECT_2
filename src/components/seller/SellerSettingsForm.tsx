import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

interface SellerSettingsFormProps {
  initialData: {
    tax_rate_override: number | null;
    shipping_rules: any;
  };
  onSubmit: (data: { tax_rate_override: number | null; shipping_rules: any }) => void;
  loading: boolean;
  error: string | null;
}

export function SellerSettingsForm({ initialData, onSubmit, loading, error }: SellerSettingsFormProps) {
  const [taxRate, setTaxRate] = useState(
    initialData.tax_rate_override ? initialData.tax_rate_override * 100 : 0
  ); // Convert decimal to percentage for display
  // NEW: Structured states for shipping rules
  const [freightType, setFreightType] = useState<'none' | 'flat_rate' | 'per_item' | 'free_shipping_threshold'>(
    initialData.shipping_rules?.type || 'none'
  );
  const [freightCost, setFreightCost] = useState<number | null>(
    initialData.shipping_rules?.cost ?? null
  );
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(
    initialData.shipping_rules?.free_shipping_threshold ?? null
  );
  
  // Override states - determine based on whether values exist
  const [overrideGlobalTax, setOverrideGlobalTax] = useState(initialData.tax_rate_override !== null);
  const [overrideGlobalShipping, setOverrideGlobalShipping] = useState(
    initialData.shipping_rules && Object.keys(initialData.shipping_rules).length > 0
  );


  useEffect(() => {
    setTaxRate(initialData.tax_rate_override ? initialData.tax_rate_override * 100 : 0);
    // Parse initial shipping rules into structured states
    setFreightType(initialData.shipping_rules?.type || 'none');
    setFreightCost(initialData.shipping_rules?.cost ?? null);
    setFreeShippingThreshold(initialData.shipping_rules?.free_shipping_threshold ?? null);
    
    // Set override states based on whether values exist
    setOverrideGlobalTax(initialData.tax_rate_override !== null);
    setOverrideGlobalShipping(
      initialData.shipping_rules && Object.keys(initialData.shipping_rules).length > 0
    );
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct shipping_rules JSON from structured states
    let constructedShippingRules: any = {};
    if (overrideGlobalShipping) {
      constructedShippingRules = { type: freightType };
      if (freightType === 'flat_rate' || freightType === 'per_item') {
        constructedShippingRules.cost = freightCost;
      }
      if (freightType === 'free_shipping_threshold') {
        constructedShippingRules.free_shipping_threshold = freeShippingThreshold;
      }
    }

    onSubmit({
      tax_rate_override: overrideGlobalTax ? taxRate / 100 : null, // Convert percentage to decimal
      shipping_rules: constructedShippingRules,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Tax Settings Section */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Settings</h3>
        
        <div className="flex items-center mb-4">
          <input
            id="overrideGlobalTax"
            name="overrideGlobalTax"
            type="checkbox"
            checked={overrideGlobalTax}
            onChange={(e) => setOverrideGlobalTax(e.target.checked)}
            className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
          />
          <label htmlFor="overrideGlobalTax" className="ml-2 block text-sm text-gray-900">
            Override global tax rate for my products
          </label>
        </div>

        {overrideGlobalTax && (
          <div>
            <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
            <input
              type="number"
              id="taxRate"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Enter your applicable tax rate (e.g., 10.00 for 10% GST).</p>
          </div>
        )}
      </div>

      {/* Shipping Settings Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Settings</h3>
        
        <div className="flex items-center mb-4">
          <input
            id="overrideGlobalShipping"
            name="overrideGlobalShipping"
            type="checkbox"
            checked={overrideGlobalShipping}
            onChange={(e) => setOverrideGlobalShipping(e.target.checked)}
            className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
          />
          <label htmlFor="overrideGlobalShipping" className="ml-2 block text-sm text-gray-900">
            Override global shipping settings for my products
          </label>
        </div>

        {overrideGlobalShipping && (
          <>
            <div>
              <label htmlFor="freightType" className="block text-sm font-medium text-gray-700">Freight Type</label>
              <select
                id="freightType"
                value={freightType}
                onChange={(e) => {
                  setFreightType(e.target.value as 'none' | 'flat_rate' | 'per_item' | 'free_shipping_threshold');
                  setFreightCost(null);
                  setFreeShippingThreshold(null);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
              >
                <option value="none">No Freight</option>
                <option value="flat_rate">Flat Rate per Order</option>
                <option value="per_item">Per Item</option>
                <option value="free_shipping_threshold">Free Shipping over amount</option>
              </select>
            </div>

            {(freightType === 'flat_rate' || freightType === 'per_item') && (
              <div>
                <label htmlFor="freightCost" className="block text-sm font-medium text-gray-700">
                  Freight Cost {freightType === 'flat_rate' ? '($ per order)' : '($ per item)'}
                </label>
                <input
                  type="number"
                  id="freightCost"
                  value={freightCost ?? ''}
                  onChange={(e) => setFreightCost(parseFloat(e.target.value) || null)}
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
                  required
                />
              </div>
            )}

            {freightType === 'free_shipping_threshold' && (
              <div>
                <label htmlFor="freeShippingThreshold" className="block text-sm font-medium text-gray-700">
                  Free Shipping Threshold ($)
                </label>
                <input
                  type="number"
                  id="freeShippingThreshold"
                  value={freeShippingThreshold ?? ''}
                  onChange={(e) => setFreeShippingThreshold(parseFloat(e.target.value) || null)}
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Orders above this amount will have free shipping.</p>
              </div>
            )}
          </>
        )}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  );
}
