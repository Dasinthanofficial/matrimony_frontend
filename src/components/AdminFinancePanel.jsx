import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { Icons } from './Icons';

export default function AdminFinancePanel() {
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, po] = await Promise.all([
        adminAPI.getFinancePayments({ page: 1, limit: 50 }),
        adminAPI.getFinancePayouts({ page: 1, limit: 50 }),
      ]);
      setPayments(p.payments || []);
      setPayouts(po.payouts || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Icons.CreditCard size={16} /> Payments & Payouts
        </h3>
        <button className="btn-secondary" onClick={load} disabled={loading}>
          <Icons.RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-primary)] font-semibold">Payments (latest 50)</div>
        <div className="divide-y divide-[var(--border-primary)]">
          {payments.map((x) => (
            <div key={x._id} className="p-4 text-sm">
              <div className="flex justify-between gap-2">
                <span className="badge">{x.plan}</span>
                <span className="text-[var(--text-muted)]">{new Date(x.createdAt).toLocaleString()}</span>
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                {x.currency} {x.amount} ({x.amountMinor ?? '—'}) • {x.status} • agency: {x.agencyId || '—'}
              </div>
            </div>
          ))}
          {payments.length === 0 && <div className="p-10 text-center text-[var(--text-muted)]">No payments.</div>}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-primary)] font-semibold">Payouts (agency service)</div>
        <div className="divide-y divide-[var(--border-primary)]">
          {payouts.map((x) => (
            <div key={x._id} className="p-4 text-sm">
              <div className="flex justify-between gap-2">
                <span className="badge">{x.payout?.status || '—'}</span>
                <span className="text-[var(--text-muted)]">
                  Release: {x.payout?.releaseAt ? new Date(x.payout.releaseAt).toLocaleString() : '—'}
                </span>
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                {x.currency} • to agency: {x.commission?.agencyAmountMinor ?? '—'} • fee: {x.commission?.platformFeeMinor ?? '—'} • ref: {x.payout?.transferRef || '—'}
              </div>
              {x.payout?.error ? <div className="text-xs text-red-500 mt-1">Error: {x.payout.error}</div> : null}
            </div>
          ))}
          {payouts.length === 0 && <div className="p-10 text-center text-[var(--text-muted)]">No payouts.</div>}
        </div>
      </div>
    </div>
  );
}