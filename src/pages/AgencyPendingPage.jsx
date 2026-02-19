import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';

export default function AgencyPendingPage() {
  return (
    <div className="min-h-screen pt-28 pb-16 page-container">
      <div className="max-w-md mx-auto card p-6 text-center">
        <div className="icon-box-xl icon-box-accent mx-auto mb-4">
          <Icons.Clock size={28} />
        </div>
        <h1 className="text-xl font-bold mb-2">Agency Approval Pending</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Your agency account has been submitted for admin review. You can use basic features, but creating/managing
          agency profiles and services requires approval.
        </p>
        <Link to="/" className="btn-secondary w-full justify-center">
          Go Home
        </Link>
      </div>
    </div>
  );
}