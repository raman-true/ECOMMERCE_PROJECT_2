import { useState, useEffect } from 'react';
import { Calculator, Info } from 'lucide-react';
import { usePlatformSettings } from '../../hooks/useSupabase';

interface PricingBreakdownProps {
  productPrice: number;
  isTaxable: boolean;
  isShippingExempt: boolean;
  quantity?: number;
}

interface PricingCalculation {
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  loading: boolean;
  error: string | null;
}

export function PricingBreakdown({ 
  productPrice, 
  isTaxable, 
  isShippingExempt, 
  quantity = 1 
}: PricingBreakdownProps) {
  const { settings: platformSettings, loading: settingsLoading } = usePlatformSettings();
  
  const [calculation, setCalculation] = useState<PricingCalculation>({
    subtotal: '0.00',
    tax: '0.00',
    shipping: '0.00',
    total: '0.00',
    loading: false,
    error: null
  });

  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    if (!settingsLoading && platformSettings) {
      calculatePricing();
    }
  }, [productPrice, isTaxable, isShippingExempt, quantity, platformSettings, settingsLoading]);

  const calculatePricing = async () => {
    setCalculation(prev => ({ ...prev, loading: true, error: null }));

    try {
      const subtotal = productPrice * quantity;
      
      // Get tax rate from platform settings or default to 10%
      const taxRate = isTaxable ? (platformSettings?.default_tax_rate || 10) : 0;
      const taxAmount = (subtotal * taxRate) / 100;
      
      // Get free shipping threshold from platform settings or default to 99
      const freeShippingThreshold = platformSettings?.free_shipping_threshold || 99;
      const shippingAmount = isShippingExempt ? 0 : (subtotal >= freeShippingThreshold ? 0 : 9.95);
      
      const total = subtotal + taxAmount + shippingAmount;

      setCalculation({
        subtotal: subtotal.toFixed(2),
        tax: taxAmount.toFixed(2),
        shipping: shippingAmount.toFixed(2),
        total: total.toFixed(2),
        loading: false,
        error: null
      });
    } catch (error) {
      setCalculation(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to calculate pricing'
      }));
    }
  };

  return (
    <div className="bg-brown-50 border border-brown-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-brown-900 flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Pricing Breakdown
        </h3>
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-brown-600 hover:text-brown-800"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {calculation.loading ? (
        <div className="text-brown-600">Calculating...</div>
      ) : calculation.error ? (
        <div className="text-red-600">{calculation.error}</div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between text-brown-700">
            <span>Subtotal ({quantity} item{quantity > 1 ? 's' : ''}):</span>
            <span>${calculation.subtotal}</span>
          </div>
          
          <div className="flex justify-between text-brown-700">
            <span className="flex items-center">
              Tax (GST {platformSettings?.default_tax_rate || 10}%):
              {!isTaxable && (
                <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1 rounded">
                  Exempt
                </span>
              )}
            </span>
            <span>${calculation.tax}</span>
          </div>
          
          <div className="flex justify-between text-brown-700">
            <span className="flex items-center">
              Shipping:
              {isShippingExempt && (
                <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 rounded">
                  Free
                </span>
              )}
              {!isShippingExempt && parseFloat(calculation.subtotal) >= (platformSettings?.free_shipping_threshold || 99) && (
                <span className="ml-1 text-xs bg-green-100 text-green-600 px-1 rounded">
                  Free over ${platformSettings?.free_shipping_threshold || 99}
                </span>
              )}
            </span>
            <span>${calculation.shipping}</span>
          </div>
          
          <div className="border-t border-brown-300 pt-2 mt-2">
            <div className="flex justify-between text-lg font-bold text-brown-900">
              <span>Total:</span>
              <span>${calculation.total}</span>
            </div>
          </div>

          {showBreakdown && (
            <div className="mt-4 pt-4 border-t border-brown-200 text-sm text-brown-600 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Tax Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    isTaxable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isTaxable ? 'Taxable' : 'Tax Exempt'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Shipping:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    isShippingExempt ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isShippingExempt ? 'Free Shipping' : 'Standard Rates'}
                  </span>
                </div>
              </div>
              <div className="text-xs text-brown-500">
                • GST ({platformSettings?.default_tax_rate || 10}%) applies to taxable items in Australia<br/>
                • Free shipping on orders over ${platformSettings?.free_shipping_threshold || 99} (unless product is shipping exempt)<br/>
                • Standard shipping: $9.95
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
