// src/components/auth/SellerProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

interface SellerProtectedRouteProps {
  children: React.ReactNode;
}

export function SellerProtectedRoute({ children }: SellerProtectedRouteProps) {
  const { state: { user, authLoading } } = useApp();

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'seller' && user.role !== 'admin') { // Allow admins to access seller routes too
    return <Navigate to="/" replace />; // Redirect non-sellers/non-admins
  }

  return <>{children}</>;
}
