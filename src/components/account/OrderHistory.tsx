// src/components/account/OrderHistory.tsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useUserOrders } from '../../hooks/useSupabase';
import { Link } from 'react-router-dom';
import { Package, DollarSign, Calendar } from 'lucide-react';

export function OrderHistory() {
  const { state: { user } } = useApp();
  const { orders, loading, error } = useUserOrders(user?.id || null);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-brown-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-500">
          Error loading orders: {error}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <Package className="w-16 h-16 text-brown-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-brown-900 mb-2">No orders found</h3>
          <p className="text-brown-600">Looks like you haven't placed any orders yet.</p>
          <Link to="/shop">
            <button className="mt-6 px-6 py-3 bg-brown-900 text-white rounded-lg hover:bg-brown-700 transition-colors">
              Start Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-brown-900">My Orders</h2>
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-3 border-brown-100">
            <div>
              <p className="text-sm text-brown-600">Order Number</p>
              <p className="font-semibold text-brown-900">{order.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-brown-600">Order Date</p>
              <p className="font-semibold text-brown-900 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-brown-600">Total</p>
              <p className="font-semibold text-brown-900 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                {order.total.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-brown-600">Status</p>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {order.order_items.map((item: any) => (
              <div key={item.id} className="flex items-center">
                <img
                  src={item.products?.images[0] || 'https://placehold.co/50'}
                  alt={item.products?.name}
                  className="w-16 h-16 object-cover rounded-lg mr-4"
                />
                <div className="flex-1">
                  <p className="font-medium text-brown-900">{item.products?.name}</p>
                  {item.product_variants && (
                    <p className="text-sm text-brown-600">Variant: {item.product_variants.name}</p>
                  )}
                  <p className="text-sm text-brown-700">
                    ${item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-brown-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="text-right mt-4">
            <Link to={`/account/orders/${order.id}`} className="text-brown-600 hover:text-brown-900 text-sm font-medium">
              View Order Details &rarr;
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
