import React from 'react';
import { Search, ShoppingCart, User, Menu, Heart, MapPin } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom'; // Import Link for internal navigation

export function Header() {
  const { state: { user, authLoading }, cartItems, toggleCart } = useApp();
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-brown-900 text-brown-100 shadow-lg fixed top-0 left-0 right-0 z-50">
      {/* Top bar */}
      <div className="bg-brown-500 text-brown-900 border-b border-brown-600">
        <div className="container mx-auto px-4 py-1"> {/* Changed py-3 to py-1 */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Find a Store
              </span>
              <span>📞 1800-HARDWARE</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Free shipping on orders over $99</span>
              <span className="text-brown-700">|</span>
              <span>Price match guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-2"> {/* Changed py-5 to py-2 */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-brown-100 hover:text-brown-500 p-2"
              onClick={toggleCart}
            >
              <Menu className="w-6 h-6" />
            </Button>
            {/* Replaced h1 with img tag for the logo */}
           <img
  src="/EcoConnect Supply Chain Logo - Earth Tones (1).png"
  alt="EcoConnect Supply Chain Logo"
  className="h-24 w-auto" // Changed h-40 to h-24
/>

          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for tools, materials, and more..."
                className="w-full px-4 py-2.5 pl-12 rounded-lg text-brown-900 focus:outline-none focus:ring-2 focus:ring-brown-500 border border-brown-700 shadow-sm"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brown-600 w-6 h-6" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link to="/wishlist">
              <Button variant="ghost" size="sm" className="text-brown-100 hover:text-brown-500 hidden sm:flex p-2">
                <Heart className="w-6 h-6" />
                <span className="ml-2 hidden lg:inline">Wishlist</span>
              </Button>
            </Link>
            
            {/* Conditional rendering based on authLoading and user state */}
            {authLoading ? (
              <Button variant="ghost" size="sm" className="text-brown-100 hover:text-brown-500 hidden sm:flex p-2">
                <User className="w-6 h-6" />
                <span className="ml-2 hidden lg:inline">Loading...</span>
              </Button>
            ) : user ? (
              <Link to="/account">
                <Button variant="ghost" size="sm" className="text-brown-100 hover:text-brown-500 hidden sm:flex p-2">
                  <User className="w-6 h-6" />
                  <span className="ml-2 hidden lg:inline">Account</span>
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-brown-100 hover:text-brown-500 hidden sm:flex p-2">
                  <User className="w-6 h-6" />
                  <span className="ml-2 hidden lg:inline">Login</span>
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-brown-100 hover:text-brown-500 relative p-2"
              onClick={toggleCart}
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="ml-2 hidden lg:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brown-500 text-brown-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="mt-4 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2.5 pl-12 rounded-lg text-brown-900 focus:outline-none focus:ring-2 focus:ring-500 border border-brown-700 shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brown-600 w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-brown-700 border-t border-brown-500">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-8 py-2 text-sm font-medium"> {/* Changed py-3.5 to py-2 */}
            <Link to="/" className="text-brown-100 hover:text-brown-300 transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-brown-100 hover:text-brown-300 transition-colors">
              Shop
            </Link>
            <Link to="/services" className="text-brown-100 hover:text-brown-300 transition-colors">
              Services
            </Link>
            <Link to="/diy-advice" className="text-brown-100 hover:text-brown-300 transition-colors">
              DIY Advice
            </Link>
            <span className="text-brown-900 bg-brown-300 px-2 py-1 rounded text-xs font-semibold">
              SALE
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}
