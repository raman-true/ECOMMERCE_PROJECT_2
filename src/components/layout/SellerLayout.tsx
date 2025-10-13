// src/components/layout/SellerLayout.tsx
import React, { useState } from 'react';
import { SellerHeader } from './SellerHeader'; // Will create this next
import { SellerSidebar } from './SellerSidebar';

interface SellerLayoutProps {
  children: React.ReactNode;
}

export function SellerLayout({ children }: SellerLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SellerSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <SellerHeader toggleSidebar={toggleSidebar} />

        {/* Main content area */}
        <main className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-0'
        }`}>
          <div className="bg-white rounded-lg shadow-md p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
