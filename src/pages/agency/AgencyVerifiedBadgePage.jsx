// src/pages/agency/AgencyVerifiedBadgePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Icons } from '../../components/Icons';
import { verifiedBadgeAPI } from '../../services/api';

const postToPayHere = (checkoutUrl, payload) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = checkoutUrl;

  Object.entries(payload || {}).forEach(([k, v]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = String(v ?? '');
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};

export default function AgencyVerifiedBadgePage() {
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get('orderId');
  const cancelled = searchParams.get('cancelled') === '1';

  const [cfg, setCfg] = useState(null);
  const [status, setStatus] = useState(null);
  const [badge, setBadge] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const priceMajor = useMemo(() => Number(cfg?.priceMinor || 0) / 100, [cfg]);

  const load = async () => {
    setMsg('');
    const [c, s] = await Promise.all([verifiedBadgeAPI.getConfig(), verifiedBadgeAPI.getStatus()]);
    setCfg(c?.config || null);
    setBadge(s?.verifiedBadge || null);
  };

  useEffect(() => {
    load().catch((e) => setMsg(e?.message || 'Failed to load'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After PayHere return, verify payment status
  useEffect(() => {
    const run = async () => {
      if (!orderIdFromUrl) return;

      try {
        const v = await verifiedBadgeAPI.verifyPayment({ orderId: orderIdFromUrl });
        setStatus(v?.status || null);
        if (v?.verifiedBadge) setBadge(v.verifiedBadge);

        if (v?.status === 'pending') {
          let tries = 0;
          const t = setInterval(async () => {
            tries += 1;
            try {
              const vv = await verifiedBadgeAPI.verifyPayment({ orderId: orderIdFromUrl });
              setStatus(vv?.status || null);
              if (vv?.verifiedBadge) setBadge(vv.verifiedBadge);
              if (vv?.status !== 'pending' || tries >= 8) clearInterval(t);
            } catch {
              if (tries >= 8) clearInterval(t);
            }
          }, 2000);
        }
      } catch (e) {
        setMsg(e?.message || 'Failed to verify payment');
      }
    };

    run();
  }, [orderIdFromUrl]);

  const buy = async () => {
    setBusy(true);
    setMsg('');
    try {
      const r = await verifiedBadgeAPI.createCheckout();
      if (!r?.checkoutUrl || !r?.payload) throw new Error('Checkout is not ready');
      postToPayHere(r.checkoutUrl, r.payload);
    } catch (e) {
      setMsg(e?.message || 'Failed to start checkout');
      setBusy(false);
    }
  };

  const isEnabled = !!cfg?.isEnabled;
  const isActive = !!badge?.isActive && (!badge?.expiresAt || new Date(badge.expiresAt) > new Date());

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Icons.BadgeCheck size={18} className="text-[var(--accent-500)]" />
              Agency Verified Badge
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">Buy/renew your verified badge.</p>
          </div>

          <Link className="btn-secondary" to="/agency">
            Back
          </Link>
        </div>

        {msg && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {msg}
          </div>
        )}

        {cancelled && (
          <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300">
            Payment cancelled.
          </div>
        )}

        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--surface-glass)]">
            <div className="text-sm text-[var(--text-muted)]">Offer</div>
            <div className="mt-1 font-semibold">
              {isEnabled ? `${cfg?.currency || 'LKR'} ${priceMajor.toLocaleString()}` : 'Not available'}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              Duration: {Number(cfg?.durationDays ?? 365) <= 0 ? 'Lifetime' : `${cfg?.durationDays} days`}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--surface-glass)]">
            <div className="text-sm text-[var(--text-muted)]">Your badge</div>
            <div className={`mt-1 font-semibold ${isActive ? 'text-green-400' : 'text-gray-300'}`}>
              {isActive ? 'Active' : 'Not active'}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              Expires: {badge?.expiresAt ? new Date(badge.expiresAt).toLocaleString() : '—'}
            </div>
          </div>
        </div>

        {status && (
          <div className="mt-4 text-sm text-[var(--text-secondary)]">
            Last payment status: <span className="font-semibold">{status}</span>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <button className="btn-secondary" onClick={load} disabled={busy}>
            <Icons.RefreshCw size={16} />
            Refresh
          </button>

          <button className="btn-primary" onClick={buy} disabled={busy || !isEnabled}>
            {busy ? <Icons.Loader size={16} className="animate-spin" /> : <Icons.CreditCard size={16} />}
            Buy / Renew
          </button>
        </div>
      </div>
    </div>
  );
}