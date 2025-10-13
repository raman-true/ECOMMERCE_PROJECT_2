// src/pages/OrderConfirmationPage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';

export function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const { closeCart } = useApp();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Close the cart when user reaches confirmation page
    closeCart();
    
    // If we have an order ID, we could fetch the order details to show order number
    if (orderId) {
      // For now, we'll generate a display order number from the order ID
      setOrderNumber(`ORD-${orderId.slice(-8).toUpperCase()}`);
    }
  }, [closeCart, orderId]);

  return (
    <div className="min-h-screen bg-brown-100 flex items-center justify-center py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-brown-900 mb-4">Order Confirmed!</h1>
        {orderNumber && (
          <p className="text-brown-600 mb-4">
            Order Number: <span className="font-semibold">{orderNumber}</span>
          </p>
        )}
        <p className="text-lg text-brown-700 mb-6">
          Thank you for your purchase. Your order has been successfully placed and will be processed shortly.
        </p>
        <p className="text-brown-600 mb-8">
          You will receive an email confirmation with your order details.
        </p>
        <div className="space-y-4">
          <Link to="/account">
            <Button className="w-full" size="lg">
              View My Orders
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline" className="w-full" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
