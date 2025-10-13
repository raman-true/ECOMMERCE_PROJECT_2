import Stripe from 'npm:stripe@16.0.0';
import { createClient } from 'npm:@supabase/supabase-js@2.57.2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, stripe-signature',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      return new Response(JSON.stringify({ error: 'Stripe-Signature header or webhook secret missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        const userId = session.metadata?.user_id;

        if (orderId) {
          // Update order status in your database
          const { error: updateError } = await supabaseClient
            .from('orders')
            .update({ status: 'processing' })
            .eq('id', orderId);

          if (updateError) {
            console.error(`Error updating order ${orderId} status:`, updateError.message);
            return new Response(JSON.stringify({ error: 'Failed to update order status' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            });
          }

          console.log(`Order ${orderId} status updated to 'processing'.`);

          // Clear user's cart after successful payment
          if (userId) {
            const { error: clearCartError } = await supabaseClient
              .from('cart_items')
              .delete()
              .eq('user_id', userId);

            if (clearCartError) {
              console.error(`Error clearing cart for user ${userId}:`, clearCartError.message);
            } else {
              console.log(`Cart cleared for user ${userId}.`);
            }
          }
        }
        break;
      
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Webhook handler failed:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});