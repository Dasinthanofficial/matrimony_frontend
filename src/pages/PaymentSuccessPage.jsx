// src/pages/PaymentSuccessPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { agencyOrderAPI } from '../services/api';
import { Icons } from '../components/Icons';

export default function PaymentSuccessPage() {
  const [sp] = useSearchParams();
  const orderId = sp.get('order_id');

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!orderId) {
      setLoading(false);
      setError('Missing order_id');
      return;
    }

    (async () => {
      try {
        const res = await agencyOrderAPI.verifyPayment({ orderId });
        setStatus(res?.status || 'pending');
      } catch (e) {
        setError(e?.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  return (
    <div className="min-h-screen pt-28 pb-16 page-container max-w-2xl mx-auto">
      <h1 className="heading-lg mb-4">Payment Status</h1>

      {loading && (
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Icons.Loader className="animate-spin" size={18} />
          Checking payment...
        </div>
      )}

      {!loading && error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">{error}</div>
      )}

      {!loading && !error && (
        <div className="card p-5 space-y-3">
          <p>
            Order: <span className="font-semibold">{orderId}</span>
          </p>
          <p>
            Status: <span className="font-semibold">{status}</span>
          </p>

          <div className="flex gap-3 flex-wrap pt-2">
            <button className="btn-secondary" onClick={() => window.location.reload()}>
              <Icons.RefreshCw size={16} /> Refresh
            </button>
            <Link className="btn-primary" to="/orders">
              My Orders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}