import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link

export function Footer() {
  return (
    <footer className="bg-brown-900 text-brown-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">BuildMart</h3>
            <p className="text-brown-300 mb-4">
              Your trusted partner for all building, hardware, and home improvement needs.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-brown-300 hover:text-white cursor-pointer" />
              <Instagram className="w-5 h-5 text-brown-300 hover:text-white cursor-pointer" />
              <Youtube className="w-5 h-5 text-brown-300 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-brown-300">
              <li><Link to="/shop" className="hover:text-white transition-colors">Our Range</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/diy-advice" className="hover:text-white transition-colors">DIY Advice</Link></li>
              <li><Link to="/find-a-store" className="hover:text-white transition-colors">Find a Store</Link></li>
              <li><Link to="/seller-register" className="hover:text-white transition-colors">Become a Seller</Link></li>

            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-brown-300">
              <li><Link to="/account" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link to="/checkout" className="hover:text-white transition-colors">Checkout</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Help & Support</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-brown-300">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>1800-HARDWARE</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@buildmart.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>123 Builder Street, Hardware City</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-brown-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-brown-300 text-sm">
            © 2024 BuildMart. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-brown-300">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/returns" className="hover:text-white transition-colors">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
