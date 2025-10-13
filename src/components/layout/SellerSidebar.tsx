// src/components/layout/SellerSidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, List, Settings, X } from 'lucide-react';

interface SellerSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function SellerSidebar({ isSidebarOpen, toggleSidebar }: SellerSidebarProps) {
  const location = useLocation();

  const navItems = [
    { path: '/seller', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/seller/products', icon: Package, label: 'Products' },
    { path: '/seller/categories', icon: List, label: 'Categories & Depts.' },
    { path: '/seller/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-brown-900 text-brown-100 flex flex-col p-4 shadow-lg
      transform transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0 md:flex-shrink-0
    `}>
      <div className="flex justify-between items-center mb-8">
        <img
          src="/EcoConnect Supply Chain Logo - Earth Tones (1).png"
          alt="EcoConnect Supply Chain Logo"
          className="h-40 w-auto"
        />
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-white hover:bg-brown-700 rounded-md"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/seller' && location.pathname === '/seller/');

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-brown-700 text-white'
                      : 'hover:bg-brown-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
