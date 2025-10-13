import Stripe from 'npm:stripe@16.0.0';
import { createClient } from 'npm:@supabase/supabase-js@2.57.2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Order ID is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch order details and order items
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(
        `
        id,
        user_id,
        order_number,
        total,
        order_items (
          product_id,
          variant_id,
          quantity,
          price,
          products (
            name,
            images
          ),
          product_variants (
            name
          )
        )
      `
      )
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order:', orderError?.message || 'Order not found');
      return new Response(JSON.stringify({ error: 'Order not found or could not be fetched' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const line_items = order.order_items.map((item: any) => {
      const productName = item.products?.name || 'Unknown Product';
      const variantName = item.product_variants?.name ? ` (${item.product_variants.name})` : '';
      const imageUrl = item.products?.images?.[0] || 'https://via.placeholder.com/150';

      return {
        price_data: {
          currency: 'aud',
          product_data: {
            name: `${productName}${variantName}`,
            images: [imageUrl],
          },
          unit_amount: Math.round(item.price * 100), // Price in cents
        },
        quantity: item.quantity,
      };
    });

    // Get the app URL from environment variables for success/cancel redirects
    const appUrl = Deno.env.get('VITE_APP_URL') || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${appUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${appUrl}/checkout?canceled=true&order_id=${order.id}`,
      metadata: {
        order_id: order.id,
        user_id: order.user_id,
      },
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Stripe Checkout Session creation failed:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});