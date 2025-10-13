// src/pages/SellerDashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useSellerProducts, // NEW HOOK
  useSellerCategories, // NEW HOOK
  useUserOrders, // Existing hook, but will filter by seller's products
} from '../hooks/useSupabase';
import {
  LayoutDashboard,
  Package,
  List,
  ShoppingCart,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext'; // To get current user's ID

export function SellerDashboardPage() {
  const { state: { user } } = useApp();
  const userId = user?.id || null;

  const { fetchAllProducts: fetchSellerProducts, loading: productsLoading, error: productsError } = useSellerProducts(userId); // Pass userId
  const { fetchAllDepartmentsWithCategories: fetchSellerCategories, loading: categoriesLoading, error: categoriesError } = useSellerCategories(userId); // Pass userId
  const { orders, loading: ordersLoading, error: ordersError } = useUserOrders(userId); // Use existing user orders hook

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0); // Orders for seller's products
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        const [
          productsData,
          categoriesData,
          userOrdersData,
        ] = await Promise.all([
          fetchSellerProducts(),
          fetchSellerCategories(),
          ordersLoading ? [] : orders, // Use already fetched orders if available
        ]);

        setTotalProducts(productsData?.length || 0);
        setTotalCategories(categoriesData?.flatMap(d => d.categories).length || 0);

        // Filter orders to only include items from this seller's products
        const sellerProductIds = productsData?.map(p => p.id) || [];
        const sellerOrders = userOrdersData.filter((order: any) =>
          order.order_items.some((item: any) => sellerProductIds.includes(item.product_id))
        );
        setTotalOrders(sellerOrders.length);
        setRecentOrders(sellerOrders.slice(0, 5)); // Show up to 5 recent orders

        setRecentProducts(productsData?.slice(0, 5) || []);

      } catch (err: any) {
        setDashboardError(err.message || 'Failed to load dashboard data.');
      } finally {
        setDashboardLoading(false);
      }
    };

    if (userId) { // Only load data if user ID is available
      loadDashboardData();
    }
  }, [userId, fetchSellerProducts, fetchSellerCategories, orders, ordersLoading]);

  if (dashboardLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-brown-600">Loading seller dashboard data...</p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: {dashboardError}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-brown-900 mb-6">Seller Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brown-600">Total Products</p>
            <p className="text-3xl font-bold text-brown-900">{totalProducts}</p>
          </div>
          <Package className="w-10 h-10 text-brown-500" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brown-600">Total Categories</p>
            <p className="text-3xl font-bold text-brown-900">{totalCategories}</p>
          </div>
          <List className="w-10 h-10 text-brown-500" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brown-600">Orders for My Products</p>
            <p className="text-3xl font-bold text-brown-900">{totalOrders}</p>
          </div>
          <ShoppingCart className="w-10 h-10 text-brown-500" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders for Seller's Products */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-brown-900 mb-4">Recent Orders for My Products</h3>
          {recentOrders.length === 0 ? (
            <p className="text-brown-600">No recent orders for your products.</p>
          ) : (
            <ul className="divide-y divide-brown-100">
              {recentOrders.map((order) => (
                <li key={order.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-brown-900">Order #{order.order_number}</p>
                    <p className="text-sm text-brown-600">Customer ID: {order.user_id}</p> {/* Can fetch customer name if needed */}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brown-900">${order.total.toFixed(2)}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="text-right mt-4">
            <Link to="/seller/orders" className="text-brown-600 hover:text-brown-900 text-sm font-medium flex items-center justify-end">
              View All Orders <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-brown-900 mb-4">Recent Products</h3>
          {recentProducts.length === 0 ? (
            <p className="text-brown-600">No recent products.</p>
          ) : (
            <ul className="divide-y divide-brown-100">
              {recentProducts.map((product) => (
                <li key={product.id} className="py-3 flex items-center">
                  <img src={product.images[0] || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 object-cover rounded mr-4" />
                  <div className="flex-1">
                    <p className="font-medium text-brown-900">{product.name}</p>
                    <p className="text-sm text-brown-600">${product.price.toFixed(2)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    product.stock > 10 ? 'bg-green-100 text-green-800' :
                    product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Stock: {product.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="text-right mt-4">
            <Link to="/seller/products" className="text-brown-600 hover:text-brown-900 text-sm font-medium flex items-center justify-end">
              View All Products <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
