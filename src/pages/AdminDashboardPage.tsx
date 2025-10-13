import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useAdminOrders,
  useAdminUsers,
  useAdminProducts,
  useAdminDIYArticles,
  useAdminServices,
} from '../hooks/useSupabase';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BookOpen,
  Settings,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

export function AdminDashboardPage() {
  const { fetchAllOrders, loading: ordersLoading, error: ordersError } = useAdminOrders();
  const { fetchAllUserProfiles, loading: usersLoading, error: usersError } = useAdminUsers();
  const { fetchAllProducts, loading: productsLoading, error: productsError } = useAdminProducts();
  const { fetchAllDIYArticles, loading: articlesLoading, error: articlesError } = useAdminDIYArticles();
  const { fetchAllServices, loading: servicesLoading, error: servicesError } = useAdminServices();

  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setDashboardLoading(true);
      setDashboardError(null);
      try {
        // Fetch all data concurrently
        const [
          ordersData,
          usersData,
          productsData,
          articlesData,
          servicesData,
          applicationsResult,
        ] = await Promise.all([
          fetchAllOrders(),
          fetchAllUserProfiles(),
          fetchAllProducts(),
          fetchAllDIYArticles(),
          fetchAllServices(),
          supabase.from('seller_applications').select('id').eq('status', 'pending'),
        ]);

        // Update summary counts
        setTotalOrders(ordersData?.length || 0);
        setTotalUsers(usersData?.length || 0);
        setTotalProducts(productsData?.length || 0);
        setTotalArticles(articlesData?.length || 0);
        setTotalServices(servicesData?.length || 0);
        setPendingApplications(applicationsResult?.data?.length || 0);

        // Set recent orders without fetching additional user info
        if (ordersData) {
          setRecentOrders(ordersData.slice(0, 5));
        }

        // Set recent users without fetching emails
        if (usersData) {
          setRecentUsers(usersData.slice(0, 5));
        }

        // Process recent products
        if (productsData) {
          setRecentProducts(productsData.slice(0, 5));
        }

      } catch (err: any) {
        setDashboardError(err.message || 'Failed to load dashboard data.');
      } finally {
        setDashboardLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (dashboardLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-brown-600">Loading admin dashboard data...</p>
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
      <h2 className="text-3xl font-bold text-brown-900 mb-6">Admin Dashboard</h2>

      {/* Pending Applications Alert */}
      {pendingApplications > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ClipboardList className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-yellow-700">
                You have <strong>{pendingApplications}</strong> pending seller {pendingApplications === 1 ? 'application' : 'applications'} awaiting review.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <Link to="/admin/seller-applications">
                <Button size="sm">Review Applications</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brown-600">Total Orders</p>
            <p className="text-3xl font-bold text-brown-900">{totalOrders}</p>
          </div>
          <ShoppingCart className="w-10 h-10 text-brown-500" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brown-600">Total Users</p>
            <p className="text-3xl font-bold text-brown-900">{totalUsers}</p>
          </div>
          <Users className="w-10 h-10 text-brown-500" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brown-600">Total Products</p>
            <p className="text-3xl font-bold text-brown-900">{totalProducts}</p>
          </div>
          <Package className="w-10 h-10 text-brown-500" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brown-600">DIY Articles</p>
            <p className="text-3xl font-bold text-brown-900">{totalArticles}</p>
          </div>
          <BookOpen className="w-10 h-10 text-brown-500" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brown-600">Services Offered</p>
            <p className="text-3xl font-bold text-brown-900">{totalServices}</p>
          </div>
          <Settings className="w-10 h-10 text-brown-500" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-brown-900 mb-4">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-brown-600">No recent orders.</p>
          ) : (
            <ul className="divide-y divide-brown-100">
              {recentOrders.map((order) => (
                <li key={order.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-brown-900">Order #{order.order_number}</p>
                    <p className="text-sm text-brown-600">User ID: {order.user_id}</p>
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
            <Link to="/admin/orders" className="text-brown-600 hover:text-brown-900 text-sm font-medium flex items-center justify-end">
              View All Orders <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-brown-900 mb-4">Recent Users</h3>
          {recentUsers.length === 0 ? (
            <p className="text-brown-600">No recent users.</p>
          ) : (
            <ul className="divide-y divide-brown-100">
              {recentUsers.map((user) => (
                <li key={user.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-brown-900">{user.first_name} {user.last_name}</p>
                    <p className="text-sm text-brown-600">User ID: {user.id.slice(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-brown-600 mt-1">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="text-right mt-4">
            <Link to="/admin/users" className="text-brown-600 hover:text-brown-900 text-sm font-medium flex items-center justify-end">
              View All Users <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Recent Products (Example - you can add more sections) */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <h3 className="text-xl font-bold text-brown-900 mb-4">Recent Products</h3>
          {recentProducts.length === 0 ? (
            <p className="text-brown-600">No recent products.</p>
          ) : (
            <ul className="divide-y divide-brown-100">
              {recentProducts.map((product) => (
                <li key={product.id} className="py-3 flex items-center">
                  <img src={product.images[0] || 'https://placehold.co/40'} alt={product.name} className="w-10 h-10 object-cover rounded mr-4" />
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
            <Link to="/admin/products" className="text-brown-600 hover:text-brown-900 text-sm font-medium flex items-center justify-end">
              View All Products <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
