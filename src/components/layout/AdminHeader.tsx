// src/components/layout/AdminHeader.tsx
import React from 'react';
import { LogOut, Menu } from 'lucide-react'; // Import Menu icon
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

export function AdminHeader({ toggleSidebar }: AdminHeaderProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login'; // Redirect to admin login after logout
  };

  return (
    <header className="bg-brown-900 text-white p-4 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-white hover:bg-brown-700 rounded-md mr-4"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
      </div>
      <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-brown-700">
        <LogOut className="w-5 h-5 mr-2" />
        Logout
      </Button>
    </header>
  );
}
