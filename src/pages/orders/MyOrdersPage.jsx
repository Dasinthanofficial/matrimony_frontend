import React, { useEffect, useState } from 'react';
import { agencyOrdersAPI } from '../../services/agencyOrdersAPI';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErr('');
        const res = await agencyOrdersAPI.myOrders();
        if (!mounted) return;
        setOrders(res?.orders || []);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.data?.message || e?.message || 'Failed to load orders');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-16 page-container max-w-4xl mx-auto">
      <h1 className="heading-lg mb-4">My Orders</h1>

      {err && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">{err}</div>}

      <div className="space-y-3 mt-4">
        {orders.map((o) => (
          <div key={o._id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold">{o?.serviceId?.title || 'Service'}</div>
              <div className="text-sm text-[var(--text-muted)]">{new Date(o.createdAt).toLocaleString()}</div>
            </div>

            <div className="mt-2 text-sm">
              Agency: <span className="font-medium">{o?.agencyId?.name || '—'}</span>
            </div>
            <div className="mt-1 text-sm">
              Amount: <span className="font-medium">{o.currency} {Number(o.amount).toFixed(2)}</span>
            </div>
            <div className="mt-1 text-sm">
              Payment: <span className="font-medium">{o.paymentStatus}</span> | Status:{' '}
              <span className="font-medium">{o.status}</span>
            </div>

            <div className="mt-2 text-xs text-[var(--text-muted)]">Order ID: {o.payhereOrderId}</div>
          </div>
        ))}
      </div>

      {!err && orders.length === 0 && <div className="text-[var(--text-muted)] mt-6">No orders yet.</div>}
    </div>
  );
}