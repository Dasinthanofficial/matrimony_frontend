import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icons } from '../components/Icons';

export default function PaymentCancelPage() {
  const [sp] = useSearchParams();
  const orderId = sp.get('order_id');

  return (
    <div className="min-h-screen pt-28 pb-16 page-container max-w-2xl mx-auto">
      <h1 className="heading-lg mb-4">Payment Cancelled</h1>

      <div className="card p-5 space-y-3">
        <p className="text-[var(--text-muted)]">
          Your payment was cancelled{orderId ? ` (Order: ${orderId})` : ''}.
        </p>

        <Link className="btn-primary inline-flex items-center gap-2" to="/dashboard">
          <Icons.Home size={16} /> Dashboard
        </Link>
      </div>
    </div>
  );
}