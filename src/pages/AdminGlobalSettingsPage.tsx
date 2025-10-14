// src/pages/AdminGlobalSettingsPage.tsx
import React, { useState } from 'react';
import { useGlobalSettings } from '../hooks/useSupabase';
import { Button } from '../components/ui/Button';
import { useAdminProducts } from '../hooks/useSupabase';

export function AdminGlobalSettingsPage() {
  const { settings, loading, error, updateGlobalSettings } = useGlobalSettings();
  const { fetchAllProducts, updateProduct } = useAdminProducts();

  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(0);
  const [taxType, setTaxType] = useState<string>('GST');
  const [allowSellerTaxOverride, setAllowSellerTaxOverride] = useState<boolean>(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(0);
  const [platformFulfillmentEnabled, setPlatformFulfillmentEnabled] = useState<boolean>(true);
  const [standardDeliveryDays, setStandardDeliveryDays] = useState<string>('2-5');
  const [expressDeliveryDays, setExpressDeliveryDays] = useState<string>('1-2');
  const [deliveryTrackingEnabled, setDeliveryTrackingEnabled] = useState<boolean>(true);
  
  const [applyToAllProducts, setApplyToAllProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  React.useEffect(() => {
    if (settings) {
      setDefaultTaxRate(settings.default_tax_rate ?? 0);
      setTaxType(settings.tax_type ?? 'GST');
      setAllowSellerTaxOverride(settings.allow_seller_tax_override ?? false);
      setFreeShippingThreshold(settings.free_shipping_threshold ?? 0);
      setPlatformFulfillmentEnabled(settings.platform_fulfillment_enabled ?? true);
      setStandardDeliveryDays(settings.standard_delivery_days ?? '2-5');
      setExpressDeliveryDays(settings.express_delivery_days ?? '1-2');
      setDeliveryTrackingEnabled(settings.delivery_tracking_enabled ?? true);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      const result = await updateGlobalSettings({
        default_tax_rate: defaultTaxRate,
        tax_type: taxType,
        allow_seller_tax_override: allowSellerTaxOverride,
        free_shipping_threshold: freeShippingThreshold,
        platform_fulfillment_enabled: platformFulfillmentEnabled,
        standard_delivery_days: standardDeliveryDays,
        express_delivery_days: expressDeliveryDays,
        delivery_tracking_enabled: deliveryTrackingEnabled,
      });

      // If "Apply to All Products" is checked, update all products
      if (applyToAllProducts && result) {
        const allProducts = await fetchAllProducts();
        if (allProducts) {
          const updatePromises = allProducts.map(product => 
            updateProduct(product.id, {
              is_taxable: true, // Enable tax for all products
              // Note: Individual product tax rates will use global settings
            })
          );
          await Promise.all(updatePromises);
        }
      }

      if (result) {
        alert(applyToAllProducts ? 'Global settings saved and applied to all products!' : 'Global settings saved successfully!');
      } else {
        setSaveError('Failed to save global settings.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save global settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading global settings...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Global Settings</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {saveError && <p className="text-red-500 text-sm mb-4">{saveError}</p>}

          {/* Tax Configuration Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brown-800 border-b pb-2">Tax Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="defaultTaxRate" className="block text-sm font-medium text-gray-700">
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  id="defaultTaxRate"
                  value={defaultTaxRate}
                  onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="taxType" className="block text-sm font-medium text-gray-700">
                  Tax Type
                </label>
                <select
                  id="taxType"
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
                >
                  <option value="GST">GST (Goods & Services Tax)</option>
                  <option value="VAT">VAT (Value Added Tax)</option>
                  <option value="Sales_Tax">Sales Tax</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="allowSellerTaxOverride"
                name="allowSellerTaxOverride"
                type="checkbox"
                checked={allowSellerTaxOverride}
                onChange={(e) => setAllowSellerTaxOverride(e.target.checked)}
                className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
              />
              <label htmlFor="allowSellerTaxOverride" className="ml-2 block text-sm text-gray-900">
                Allow sellers to override tax settings
              </label>
            </div>
          </div>

          {/* Shipping Configuration Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brown-800 border-b pb-2">Shipping Configuration</h3>
            
            <div>
              <label htmlFor="freeShippingThreshold" className="block text-sm font-medium text-gray-700">
                Free Shipping Threshold ($)
              </label>
              <input
                type="number"
                id="freeShippingThreshold"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(parseFloat(e.target.value) || 0)}
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Orders above this amount get free shipping (unless seller overrides)
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                id="platformFulfillmentEnabled"
                name="platformFulfillmentEnabled"
                type="checkbox"
                checked={platformFulfillmentEnabled}
                onChange={(e) => setPlatformFulfillmentEnabled(e.target.checked)}
                className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
              />
              <label htmlFor="platformFulfillmentEnabled" className="ml-2 block text-sm text-gray-900">
                Enable platform fulfillment (FBA-style)
              </label>
            </div>
          </div>

          {/* Delivery Configuration Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brown-800 border-b pb-2">Delivery Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="standardDeliveryDays" className="block text-sm font-medium text-gray-700">
                  Standard Delivery (days)
                </label>
                <input
                  type="text"
                  id="standardDeliveryDays"
                  value={standardDeliveryDays}
                  onChange={(e) => setStandardDeliveryDays(e.target.value)}
                  placeholder="e.g., 2-5"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="expressDeliveryDays" className="block text-sm font-medium text-gray-700">
                  Express Delivery (days)
                </label>
                <input
                  type="text"
                  id="expressDeliveryDays"
                  value={expressDeliveryDays}
                  onChange={(e) => setExpressDeliveryDays(e.target.value)}
                  placeholder="e.g., 1-2"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="deliveryTrackingEnabled"
                name="deliveryTrackingEnabled"
                type="checkbox"
                checked={deliveryTrackingEnabled}
                onChange={(e) => setDeliveryTrackingEnabled(e.target.checked)}
                className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
              />
              <label htmlFor="deliveryTrackingEnabled" className="ml-2 block text-sm text-gray-900">
                Enable delivery tracking system
              </label>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="applyToAllProducts"
              name="applyToAllProducts"
              type="checkbox"
              checked={applyToAllProducts}
              onChange={(e) => setApplyToAllProducts(e.target.checked)}
              className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
            />
            <label htmlFor="applyToAllProducts" className="ml-2 block text-sm text-gray-900">
              Apply these settings to ALL existing products
            </label>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4" role="alert">
            <p className="font-bold">Multi-Vendor Platform Settings:</p>
            <p className="text-sm">
              • <strong>Admin (You):</strong> Control global tax rules, shipping carriers, and delivery framework<br/>
              • <strong>Sellers:</strong> Can add tax registration, define shipping charges, choose fulfillment method<br/>
              • <strong>Customers:</strong> View price breakdowns, select delivery options, track orders<br/>
              • These are platform-wide defaults that sellers can override if allowed
            </p>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Global Settings'}
          </Button>
        </form>
      </div>
    </div>
  );
}