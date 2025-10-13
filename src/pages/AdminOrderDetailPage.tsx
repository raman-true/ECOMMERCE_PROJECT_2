import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminOrders } from '../hooks/useSupabase';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Package, User, MapPin, DollarSign } from 'lucide-react';

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchOrderById, updateOrderStatus, loading, error } = useAdminOrders();
  const [order, setOrder] = useState<any>(null); // Use 'any' for now for the base order data
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    const getOrder = async () => {
      if (!id) return;

      const fetchedOrder = await fetchOrderById(id);
      if (fetchedOrder) {
        setOrder(fetchedOrder);
      }
    };
    getOrder();
  }, [id, fetchOrderById]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !order) return;
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      const result = await updateOrderStatus(id, newStatus);
      if (result) {
        setOrder(result); // Update local state with new status
      } else {
        setUpdateError('Failed to update order status.');
      }
    } catch (err: any) {
      setUpdateError(err.message || 'An error occurred while updating status.');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading || !order) {
    return <div className="text-center py-8">Loading order details...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/admin/orders')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
      </Button>

      <h2 className="text-3xl font-bold text-brown-900">Order #{order.order_number}</h2>

      {updateError && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{updateError}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-brown-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" /> Order Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-brown-700 mb-6">
            <div>
              <p><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>{order.status}</span></p>
              <p><span className="font-medium">Order Date:</span> {new Date(order.created_at).toLocaleString()}</p>
              <p><span className="font-medium">Delivery Method:</span> {order.delivery_method}</p>
            </div>
            <div>
              <p><span className="font-medium">Total:</span> ${order.total.toFixed(2)}</p>
              <p><span className="font-medium">Customer ID:</span> {order.user_id}</p>
            </div>
          </div>

          <h4 className="text-lg font-semibold text-brown-900 mb-3">Items:</h4>
          <div className="divide-y divide-gray-200">
            {order.order_items.map((item: any) => (
              <div key={item.id} className="flex items-center py-3">
                <img src={item.products?.images[0] || 'https://via.placeholder.com/50'} alt={item.products?.name} className="w-12 h-12 object-cover rounded mr-4" />
                <div className="flex-1">
                  <p className="font-medium text-brown-900">{item.products?.name}</p>
                  {item.product_variants && <p className="text-sm text-gray-600">Variant: {item.product_variants.name}</p>}
                  <p className="text-sm text-gray-600">${item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <p className="font-semibold text-brown-900">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Addresses and Status Update */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-brown-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" /> Addresses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-brown-900 mb-2">Shipping Address:</h4>
                {order.shipping_address ? (
                  <address className="not-italic text-sm text-brown-700">
                    {order.shipping_address.first_name} {order.shipping_address.last_name}<br />
                    {order.shipping_address.address1}<br />
                    {order.shipping_address.address2 && <>{order.shipping_address.address2}<br /></>}
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postcode}<br />
                    {order.shipping_address.country}<br />
                    {order.shipping_address.phone && `Phone: ${order.shipping_address.phone}`}
                  </address>
                ) : <p className="text-gray-500">N/A</p>}
              </div>
              <div>
                <h4 className="font-medium text-brown-900 mb-2">Billing Address:</h4>
                {order.billing_address ? (
                  <address className="not-italic text-sm text-brown-700">
                    {order.billing_address.first_name} {order.billing_address.last_name}<br />
                    {order.billing_address.address1}<br />
                    {order.billing_address.address2 && <>{order.billing_address.address2}<br /></>}
                    {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postcode}<br />
                    {order.billing_address.country}<br />
                    {order.billing_address.phone && `Phone: ${order.billing_address.phone}`}
                  </address>
                ) : <p className="text-gray-500">N/A</p>}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-brown-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" /> Update Status
            </h3>
            <div className="space-y-3">
              <Button
                onClick={() => handleStatusChange('processing')}
                disabled={order.status === 'processing' || updateLoading}
                className="w-full"
              >
                {updateLoading && order.status !== 'processing' ? 'Updating...' : 'Set to Processing'}
              </Button>
              <Button
                onClick={() => handleStatusChange('shipped')}
                disabled={order.status === 'shipped' || updateLoading}
                className="w-full"
              >
                {updateLoading && order.status !== 'shipped' ? 'Updating...' : 'Set to Shipped'}
              </Button>
              <Button
                onClick={() => handleStatusChange('delivered')}
                disabled={order.status === 'delivered' || updateLoading}
                className="w-full"
              >
                {updateLoading && order.status !== 'delivered' ? 'Updating...' : 'Set to Delivered'}
              </Button>
              <Button
                onClick={() => handleStatusChange('cancelled')}
                disabled={order.status === 'cancelled' || updateLoading}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                {updateLoading && order.status !== 'cancelled' ? 'Updating...' : 'Set to Cancelled'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
