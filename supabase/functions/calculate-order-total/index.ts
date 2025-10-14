import { createClient } from 'npm:@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { items, shippingAddress } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart items are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let subtotal = 0;
    let totalTax = 0;
    let totalFreight = 0;
    const processedItems: any[] = [];

    // Fetch global settings for default tax rate and shipping threshold
    const { data: globalSettings, error: globalSettingsError } = await supabaseClient
      .from('global_settings')
      .select('*')
      .maybeSingle();

    if (globalSettingsError) {
      console.error('Error fetching global settings:', globalSettingsError.message);
    }
    
    // Tax rate is already stored as percentage in database (10.0 means 10%)
    const globalDefaultTaxRate = globalSettings?.default_tax_rate ? parseFloat(globalSettings.default_tax_rate.toString()) : 10.0;
    const globalFreeShippingThreshold = globalSettings?.free_shipping_threshold ? parseFloat(globalSettings.free_shipping_threshold.toString()) : 99.00;
    const globalDefaultShippingCost = 9.95; // Default shipping cost when threshold not met
    const allowSellerTaxOverride = globalSettings?.allow_seller_tax_override || false;
    const taxType = globalSettings?.tax_type || 'GST';
    
    console.log(`[calculate-order-total] Global settings - Tax Rate: ${globalDefaultTaxRate}%, Free Shipping: $${globalFreeShippingThreshold}, Tax Type: ${taxType}`);

    // Batch fetch all products at once for better performance
    console.log(`[calculate-order-total] Processing ${items.length} items`);

    const productIds = items.map(item => item.product_id);
    console.log(`[calculate-order-total] Fetching products with IDs:`, productIds);

    const { data: productsData, error: productsError } = await supabaseClient
      .from('products')
      .select(`
        id,
        price,
        seller_id,
        discount_type,
        discount_value,
        is_taxable,
        is_shipping_exempt,
        product_variants (id, price)
      `)
      .in('id', productIds);

    if (productsError) {
      console.error(`[calculate-order-total] Error batch fetching products:`, productsError);
      throw new Error(`Database error fetching products: ${productsError.message}`);
    }

    if (!productsData || productsData.length === 0) {
      console.error(`[calculate-order-total] No products found for IDs:`, productIds);
      throw new Error(`No products found for the requested items`);
    }

    console.log(`[calculate-order-total] Successfully fetched ${productsData.length} products`);

    // Create a map of product_id to product data for quick lookup
    const productMap = new Map(productsData.map(p => [p.id, p]));

    // Verify all requested products were found
    for (const item of items) {
      if (!productMap.has(item.product_id)) {
        console.error(`[calculate-order-total] Product not found for ID: ${item.product_id}`);
        throw new Error(`Product not found for ID: ${item.product_id}`);
      }
    }

    // Group items by seller to fetch settings once per seller
    const itemsBySeller: { [sellerId: string]: any[] } = {};

    for (const item of items) {
      const productData = productMap.get(item.product_id);
      const sellerId = (productData as any)?.seller_id || 'admin';
      
      // Debug: Product assignment
      console.log('[DEBUG] Product assignment:', {
        productId: item.product_id,
        sellerId: sellerId,
        productName: (productData as any)?.name
      });

      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }
      itemsBySeller[sellerId].push({ ...item, productData });
    }

    for (const sellerId in itemsBySeller) {
      const sellerItems = itemsBySeller[sellerId];

      // Fetch seller settings (skip for admin products)
      let sellerSettings: any = null;
      if (sellerId !== 'admin') {
        const { data: settings, error: settingsError } = await supabaseClient
          .from('seller_settings')
          .select('*')
          .eq('seller_id', sellerId)
          .maybeSingle();

        if (settingsError) {
          console.error(`Error fetching seller settings for ${sellerId}:`, settingsError.message);
        }
        sellerSettings = settings;
        // Debug: Seller settings
        console.log('[DEBUG] Seller settings:', {
          sellerId: sellerId,
          settings: sellerSettings,
          taxRateOverride: sellerSettings?.tax_rate_override
        });
      }

      // Determine effective tax rate for this seller
      let effectiveSellerTaxRate = globalDefaultTaxRate;
      
      // Debug: Tax override logic
      console.log('[DEBUG] Tax override check:', {
        allowOverride: allowSellerTaxOverride,
        hasSettings: !!sellerSettings,
        taxRateOverride: sellerSettings?.tax_rate_override,
        isOverrideValid: sellerSettings?.tax_rate_override !== undefined && sellerSettings.tax_rate_override !== null
      });
      
      if (allowSellerTaxOverride && sellerSettings?.tax_rate_override !== undefined && sellerSettings.tax_rate_override !== null) {
        effectiveSellerTaxRate = parseFloat(sellerSettings.tax_rate_override.toString());
        console.log('[DEBUG] Using seller tax override:', effectiveSellerTaxRate + '%');
      } else {
        console.log('[DEBUG] Using global tax rate:', effectiveSellerTaxRate + '%');
      }

      // Determine effective shipping rules for this seller
      let effectiveSellerFreeShippingThreshold = globalFreeShippingThreshold;
      if (sellerSettings?.free_shipping_threshold !== undefined && sellerSettings.free_shipping_threshold !== null) {
        effectiveSellerFreeShippingThreshold = sellerSettings.free_shipping_threshold;
        console.log(`[calculate-order-total] Using seller free shipping threshold: $${effectiveSellerFreeShippingThreshold}`);
      } else {
        console.log(`[calculate-order-total] Using global free shipping threshold: $${effectiveSellerFreeShippingThreshold}`);
      }

      let sellerSubtotal = 0;
      let sellerFreightForThisSeller = 0;
      let sellerSubtotalForFreightCalculation = 0; // Subtotal of items NOT shipping exempt
      let totalQuantityForFreightCalculation = 0; // Quantity of items NOT shipping exempt

      for (const item of sellerItems) {
        const basePrice = item.variant_id
          ? item.productData.product_variants.find((v: any) => v.id === item.variant_id)?.price || item.productData.price
          : item.productData.price;

        let effectivePrice = basePrice;

        // Apply discount
        if (item.productData.discount_type === 'percentage' && item.productData.discount_value !== null) {
          effectivePrice = basePrice * (1 - item.productData.discount_value / 100);
        } else if (item.productData.discount_type === 'flat_amount' && item.productData.discount_value !== null) {
          effectivePrice = basePrice - item.productData.discount_value;
        }
        effectivePrice = Math.max(0, effectivePrice); // Ensure price doesn't go below zero

        sellerSubtotal += effectivePrice * item.quantity;
        processedItems.push({ ...item, effectivePrice });

        // Only include items that are NOT shipping exempt in freight calculation
        if (!item.productData.is_shipping_exempt) {
          sellerSubtotalForFreightCalculation += effectivePrice * item.quantity;
          totalQuantityForFreightCalculation += item.quantity;
        }

        // Calculate tax for this item if it's taxable
        console.log('[DEBUG] Tax calculation for item:', {
          productId: item.product_id,
          isTaxable: item.productData.is_taxable,
          country: shippingAddress?.country,
          effectivePrice: effectivePrice,
          quantity: item.quantity,
          taxRate: effectiveSellerTaxRate
        });
        
        if (item.productData.is_taxable && shippingAddress?.country === 'Australia') {
          const applicableTaxRate = effectiveSellerTaxRate;

          if (applicableTaxRate > 0) {
            const itemTaxAmount = effectivePrice * item.quantity * (parseFloat(applicableTaxRate.toString()) / 100);
            totalTax += itemTaxAmount;
            console.log('[DEBUG] Tax applied:', {
              itemId: item.product_id,
              taxAmount: itemTaxAmount,
              calculation: `${effectivePrice} * ${item.quantity} * ${applicableTaxRate}% = ${itemTaxAmount}`
            });
          } else {
            console.log('[DEBUG] No tax - zero rate');
          }
        } else {
          console.log('[DEBUG] No tax - not taxable or not Australia');
        }
      }

      // Calculate freight for this seller based on items NOT shipping exempt
      if (totalQuantityForFreightCalculation > 0) { // Only apply freight if there are non-exempt items
        // Check if free shipping threshold is met
        if (sellerSubtotalForFreightCalculation >= effectiveSellerFreeShippingThreshold) {
          sellerFreightForThisSeller = 0; // Free shipping threshold met
          console.log(`[calculate-order-total] Free shipping applied for seller ${sellerId} (subtotal: $${sellerSubtotalForFreightCalculation} >= threshold: $${effectiveSellerFreeShippingThreshold})`);
        } else {
          // Apply seller shipping rules or global default
          if (sellerSettings?.shipping_rules && sellerSettings.shipping_rules.type) {
            const shippingRules = sellerSettings.shipping_rules;
            console.log('[DEBUG] Using seller shipping rules:', shippingRules);
            
            if (shippingRules.type === 'flat_rate' && shippingRules.cost !== undefined) {
              sellerFreightForThisSeller = parseFloat(shippingRules.cost.toString());
            } else if (shippingRules.type === 'per_item' && shippingRules.cost !== undefined) {
              sellerFreightForThisSeller = parseFloat(shippingRules.cost.toString()) * totalQuantityForFreightCalculation;
            } else if (shippingRules.type === 'free_shipping_threshold') {
              // Check both shipping_rules.free_shipping_threshold and seller's free_shipping_threshold
              const threshold = shippingRules.free_shipping_threshold || sellerSettings.free_shipping_threshold || globalFreeShippingThreshold;
              if (sellerSubtotalForFreightCalculation < parseFloat(threshold.toString())) {
                sellerFreightForThisSeller = globalDefaultShippingCost;
              } else {
                sellerFreightForThisSeller = 0;
              }
              console.log(`[DEBUG] Free shipping threshold check: subtotal $${sellerSubtotalForFreightCalculation} vs threshold $${threshold}`);
            } else {
              sellerFreightForThisSeller = globalDefaultShippingCost;
            }
            console.log(`[calculate-order-total] Seller shipping applied for ${sellerId}: $${sellerFreightForThisSeller}`);
          } else {
            // Use global default shipping cost
            sellerFreightForThisSeller = globalDefaultShippingCost;
            console.log(`[calculate-order-total] Global shipping applied for seller ${sellerId}: $${sellerFreightForThisSeller}`);
          }
        }
      } else {
        console.log(`[calculate-order-total] No shipping charges for seller ${sellerId} (all items shipping exempt)`);
      }

      totalFreight += sellerFreightForThisSeller;
      subtotal += sellerSubtotal; // This subtotal includes all items, even non-taxable ones
    }

    const grandTotal = subtotal + totalTax + totalFreight;
    console.log(`[calculate-order-total] Final totals - Subtotal: $${subtotal.toFixed(2)}, Tax: $${totalTax.toFixed(2)}, Shipping: $${totalFreight.toFixed(2)}, Grand Total: $${grandTotal.toFixed(2)}`);

    // Determine the actual tax rate used (for display purposes)
    let displayTaxRate = globalDefaultTaxRate;
    let taxBreakdown = [];
    let mixedCart = false;
    
    if (totalTax > 0) {
      // Check if we have mixed sellers with different tax rates
      const sellerTaxRates = new Set();
      let hasAdminProducts = false;
      let hasSellerProducts = false;
      
      for (const sellerId in itemsBySeller) {
        if (sellerId === 'admin') {
          hasAdminProducts = true;
          sellerTaxRates.add(globalDefaultTaxRate);
        } else {
          hasSellerProducts = true;
          const sellerItems = itemsBySeller[sellerId];
          const { data: sellerSettings } = await supabaseClient
            .from('seller_settings')
            .select('tax_rate_override')
            .eq('seller_id', sellerId)
            .maybeSingle();
          
          const effectiveSellerTaxRate = sellerSettings?.tax_rate_override
            ? parseFloat(sellerSettings.tax_rate_override.toString())
            : globalDefaultTaxRate;
          sellerTaxRates.add(effectiveSellerTaxRate);
        }
      }
      
      mixedCart = sellerTaxRates.size > 1;
      
      if (mixedCart) {
        // Build tax breakdown for mixed cart
        if (hasAdminProducts && hasSellerProducts) {
          const adminRate = globalDefaultTaxRate;
          const sellerRates = Array.from(sellerTaxRates).filter(rate => rate !== adminRate);
          if (sellerRates.length === 1) {
            taxBreakdown.push(`Admin ${adminRate}%`, `Seller ${sellerRates[0]}%`);
          } else {
            taxBreakdown.push(`Admin ${adminRate}%`, `Sellers ${sellerRates.join('%, ')}%`);
          }
        }
        displayTaxRate = (totalTax / subtotal) * 100; // Effective blended rate for calculation
      } else {
        // Single tax rate across all products
        displayTaxRate = Array.from(sellerTaxRates)[0];
      }
    }

    // Determine shipping method for display
    let shippingMethod = 'Standard';
    let shippingLabel = 'Shipping';
    
    // Find the shipping method used (check first seller with shipping rules)
    for (const sellerId in itemsBySeller) {
      if (sellerId !== 'admin') {
        const { data: settings } = await supabaseClient
          .from('seller_settings')
          .select('shipping_rules, free_shipping_threshold')
          .eq('seller_id', sellerId)
          .maybeSingle();
          
        if (settings?.shipping_rules?.type) {
          const type = settings.shipping_rules.type;
          if (type === 'flat_rate') {
            shippingMethod = 'Flat Rate';
          } else if (type === 'per_item') {
            shippingMethod = 'Per Item';
          } else if (type === 'free_shipping_threshold') {
            const threshold = settings.shipping_rules.free_shipping_threshold || settings.free_shipping_threshold || globalFreeShippingThreshold;
            shippingMethod = `Free Shipping over $${threshold}`;
          }
          
          // Add free shipping threshold info if applicable and not already free
          const effectiveThreshold = settings.free_shipping_threshold || globalFreeShippingThreshold;
          if (totalFreight === 0 && subtotal >= effectiveThreshold) {
            shippingLabel = `Shipping (Free - over $${effectiveThreshold})`;
          } else if (totalFreight > 0 && effectiveThreshold > 0) {
            const remaining = effectiveThreshold - subtotal;
            if (remaining > 0) {
              // shippingLabel = `Shipping (${shippingMethod}) - Free over $${effectiveThreshold}`;
              shippingLabel = `Shipping (${shippingMethod})`;
            } else {
              shippingLabel = `Shipping (${shippingMethod})`;
            }
          } else {
            shippingLabel = `Shipping (${shippingMethod})`;
          }
          break;
        }
      }
    }
    
    // If no seller-specific shipping found, check global free shipping threshold
    if (shippingLabel === 'Shipping' && globalFreeShippingThreshold > 0) {
      if (totalFreight === 0 && subtotal >= globalFreeShippingThreshold) {
        shippingLabel = `Shipping (Free - over $${globalFreeShippingThreshold})`;
      } else if (totalFreight > 0) {
        const remaining = globalFreeShippingThreshold - subtotal;
        if (remaining > 0) {
          shippingLabel = `Shipping - Free over $${globalFreeShippingThreshold}`;
        }
      }
    }

    return new Response(JSON.stringify({
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      totalFreight: parseFloat(totalFreight.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      taxInfo: {
        taxType: taxType,
        taxRate: parseFloat(displayTaxRate.toFixed(2)),
        taxLabel: mixedCart && taxBreakdown.length > 0 
          ? `${taxType} (${taxBreakdown.join(', ')})`
          : `${taxType} ${displayTaxRate.toFixed(1)}%`,
        isMixed: mixedCart,
        breakdown: taxBreakdown
      },
      shippingInfo: {
        method: shippingMethod,
        label: shippingLabel
      },
      processedItems: processedItems, // Optional: return processed items for debugging
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Order total calculation failed:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});