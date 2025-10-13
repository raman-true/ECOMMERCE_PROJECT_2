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
    const { data: globalSettings, error: globalSettingsError } = await supabaseClient.from('global_settings').select('*').maybeSingle();
    if (globalSettingsError) {
      console.error('Error fetching global settings:', globalSettingsError.message);
    }
    // Convert tax rate from decimal to percentage (0.10 -> 10.0)
    const globalDefaultTaxRate = globalSettings?.default_tax_rate ? parseFloat(globalSettings.default_tax_rate.toString()) * 100 : 10.0;
    const globalFreeShippingThreshold = globalSettings?.free_shipping_threshold || 99.00;
    const globalDefaultShippingCost = 9.95; // Default shipping cost when threshold not met
    const allowSellerTaxOverride = globalSettings?.allow_seller_tax_override || false;
    const taxType = globalSettings?.tax_type || 'GST';
    console.log(`[calculate-order-total] Global settings - Tax Rate: ${globalDefaultTaxRate}%, Free Shipping: $${globalFreeShippingThreshold}, Tax Type: ${taxType}`);
    // Batch fetch all products at once for better performance
    console.log(`[calculate-order-total] Processing ${items.length} items`);
    const productIds = items.map((item)=>item.product_id);
    console.log(`[calculate-order-total] Fetching products with IDs:`, productIds);
    const { data: productsData, error: productsError } = await supabaseClient.from('products').select(`
        id,
        price,
        seller_id,
        discount_type,
        discount_value,
        is_taxable,
        is_shipping_exempt,
        product_variants (id, price)
      `).in('id', productIds);
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
    const productMap = new Map(productsData.map((p)=>[
        p.id,
        p
      ]));
    // Verify all requested products were found
    for (const item of items){
      if (!productMap.has(item.product_id)) {
        console.error(`[calculate-order-total] Product not found for ID: ${item.product_id}`);
        throw new Error(`Product not found for ID: ${item.product_id}`);
      }
    }
    // Group items by seller to fetch settings once per seller
    const itemsBySeller = {};
    for (const item of items){
      const productData = productMap.get(item.product_id);
      const sellerId = productData.seller_id || 'admin'; // Handle admin products (null seller_id)
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
      // Fetch seller settings (skip for admin products)
      let sellerSettings = null;
      if (sellerId !== 'admin') {
        const { data: settings, error: settingsError } = await supabaseClient.from('seller_settings').select('*').eq('seller_id', sellerId).maybeSingle();
        if (settingsError) {
          console.error(`Error fetching seller settings for ${sellerId}:`, settingsError.message);
        }
        sellerSettings = settings;
        console.log(`[calculate-order-total] Seller ${sellerId} settings:`, sellerSettings);
      }
      // Determine effective tax rate for this seller
      let effectiveSellerTaxRate = globalDefaultTaxRate;
      if (allowSellerTaxOverride && sellerSettings?.tax_rate_override !== undefined && sellerSettings.tax_rate_override !== null) {
        // Convert seller tax rate from decimal to percentage (0.15 -> 15.0)
        effectiveSellerTaxRate = parseFloat(sellerSettings.tax_rate_override.toString()) * 100;
        console.log(`[calculate-order-total] Using seller tax override: ${effectiveSellerTaxRate}%`);
      } else {
        console.log(`[calculate-order-total] Using global tax rate: ${effectiveSellerTaxRate}%`);
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
        // Calculate tax for this item if it's taxable
        const itemTaxAmount = 0;
        console.log(`[calculate-order-total] Item tax check - Product: ${item.product_id}, Taxable: ${item.productData.is_taxable}, Country: ${shippingAddress?.country}, Tax Rate: ${effectiveSellerTaxRate}%`);
        if (item.productData.is_taxable && shippingAddress?.country === 'Australia') {
          const applicableTaxRate = effectiveSellerTaxRate;
          if (applicableTaxRate > 0) {
            const itemTaxAmount = effectivePrice * item.quantity * (parseFloat(applicableTaxRate.toString()) / 100);
            totalTax += itemTaxAmount;
            console.log(`[calculate-order-total] Tax applied - Item: ${item.product_id}, Price: $${effectivePrice}, Qty: ${item.quantity}, Rate: ${applicableTaxRate}%, Tax: $${itemTaxAmount.toFixed(2)}`);
          } else {
            console.log(`[calculate-order-total] No tax applied - zero tax rate`);
          }
        } else {
          console.log(`[calculate-order-total] No tax applied - Product not taxable or not in Australia`);
        }
      }
      // Calculate freight for this seller based on items NOT shipping exempt
      if (totalQuantityForFreightCalculation > 0) {
        // Check if free shipping threshold is met
        if (sellerSubtotalForFreightCalculation >= effectiveSellerFreeShippingThreshold) {
          sellerFreightForThisSeller = 0; // Free shipping threshold met
          console.log(`[calculate-order-total] Free shipping applied for seller ${sellerId} (subtotal: $${sellerSubtotalForFreightCalculation} >= threshold: $${effectiveSellerFreeShippingThreshold})`);
        } else {
          // Apply standard shipping cost
          sellerFreightForThisSeller = globalDefaultShippingCost;
          console.log(`[calculate-order-total] Standard shipping applied for seller ${sellerId}: $${sellerFreightForThisSeller}`);
        }
      } else {
        console.log(`[calculate-order-total] No shipping charges for seller ${sellerId} (all items shipping exempt)`);
      }
      totalFreight += sellerFreightForThisSeller;
      subtotal += sellerSubtotal; // This subtotal includes all items, even non-taxable ones
    }
    const grandTotal = subtotal + totalTax + totalFreight;
    console.log(`[calculate-order-total] Final totals - Subtotal: $${subtotal.toFixed(2)}, Tax: $${totalTax.toFixed(2)}, Shipping: $${totalFreight.toFixed(2)}, Grand Total: $${grandTotal.toFixed(2)}`);
    return new Response(JSON.stringify({
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      totalFreight: parseFloat(totalFreight.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      taxInfo: {
        taxType: taxType,
        taxRate: globalDefaultTaxRate,
        taxLabel: `${taxType} ${globalDefaultTaxRate}%`
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
