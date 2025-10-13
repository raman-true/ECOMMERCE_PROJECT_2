import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { AddressList } from '../components/account/AddressList';
import { AddressForm } from '../components/account/AddressForm';
import { Button } from '../components/ui/Button';
import { User, MapPin, Package, Heart, Settings, LogOut } from 'lucide-react'; // Added LogOut icon
import { supabase } from '../lib/supabase'; // Import supabase
import { OrderHistory } from '../components/account/OrderHistory'; // Import OrderHistory component

type ActiveTab = 'profile' | 'addresses' | 'orders' | 'wishlist' | 'settings';

export function AccountDashboardPage() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile'); // Changed default tab to profile
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const tabs = [
    { id: 'profile' as ActiveTab, label: 'Profile', icon: User },
    { id: 'addresses' as ActiveTab, label: 'Addresses', icon: MapPin },
    { id: 'orders' as ActiveTab, label: 'Orders', icon: Package },
    { id: 'wishlist' as ActiveTab, label: 'Wishlist', icon: Heart },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleFormClose = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Supabase's onAuthStateChange listener in AppContext will handle setting user to null
    // and ProtectedRoute will redirect to login if needed.
    // Optionally, you can navigate explicitly if you want to ensure a specific redirect.
    // For example: navigate('/login');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-brown-900 mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  First Name
                </label>
                <p className="text-brown-900">{state.user?.firstName || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Last Name
                </label>
                <p className="text-brown-900">{state.user?.lastName || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-1">
                  Email
                </label>
                <p className="text-brown-900">{state.user?.email}</p>
              </div>
            </div>
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-6">
            {!showAddressForm ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-brown-900">My Addresses</h2>
                  <Button onClick={handleAddAddress}>
                    Add New Address
                  </Button>
                </div>
                <AddressList
                  onEdit={handleEditAddress}
                />
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-brown-900">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h2>
                  <Button variant="outline" onClick={handleFormClose}>
                    Cancel
                  </Button>
                </div>
                <AddressForm
                  initialData={editingAddress}
                  onSuccess={handleFormClose}
                  onCancel={handleFormClose}
                />
              </>
            )}
          </div>
        );

      case 'orders':
        return <OrderHistory />; // Render the OrderHistory component here

      case 'wishlist':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-brown-900 mb-6">My Wishlist</h2>
            <p className="text-brown-600">Your wishlist is empty. Add some products to see them here!</p>
          </div>
        );

      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-brown-900 mb-6">Account Settings</h2>
            <p className="text-brown-600 mb-4">Account settings coming soon!</p>
            <Button onClick={handleLogout} variant="secondary">
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!state.user) {
    return (
      <div className="min-h-screen bg-brown-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brown-900 mb-4">Please log in</h2>
          <p className="text-brown-600">You need to be logged in to access your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brown-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brown-900 mb-2">
            Welcome back, {state.user.firstName || 'User'}!
          </h1>
          <p className="text-brown-600">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-brown-900 text-white'
                          : 'text-brown-700 hover:bg-brown-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
