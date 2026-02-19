// src/components/AgencyRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from './Icons';

export default function AgencyRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icons.Loader className="animate-spin" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  if (user?.role !== 'agency') return <Navigate to="/dashboard" replace />;

  const status = user?.agencyVerification?.status || 'none';
  if (status !== 'approved') return <Navigate to="/agency/pending" replace />;

  return children;
}