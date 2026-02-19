import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from './Icons';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icons.Loader className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-[var(--text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user?.role;
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isAgency = role === 'agency';

  // Admins should never see user routes
  if (isAdmin && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

  // ✅ FIX: Agencies should not see the user dashboard
  if (isAgency && location.pathname === '/dashboard') {
    const status = user?.agencyVerification?.status || 'none';
    return <Navigate to={status === 'approved' ? '/agency' : '/agency/pending'} replace />;
  }

  return children;
}