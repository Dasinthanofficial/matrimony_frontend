import { useEffect, useMemo, useState } from 'react';
import { subscriptionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FEATURE_LABELS = {
  chatAccess: 'Chat access',
  seeWhoLiked: 'See who liked you',
  unlimitedLikes: 'Unlimited likes',
  profileBoost: 'Profile boost',
  readReceipts: 'Read receipts',
  prioritySupport: 'Priority support',
  contactUnlock: 'Contact unlock',
  personalManager: 'Personal manager',
  vipEvents: 'VIP events',
  profileHighlight: 'Profile highlight',
};

function formatInterval(plan) {
  if (plan.interval === 'lifetime') return 'Lifetime';
  const n = Number(plan.intervalCount || 1);
  const unit = plan.interval === 'month' ? 'Month' : plan.interval === 'year' ? 'Year' : plan.interval;
  return n === 1 ? `per ${unit}` : `per ${n} ${unit}s`;
}

function formatMoney(amount, currency) {
  const num = Number(amount);
  const safe = Number.isFinite(num) ? num : 0;

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: String(currency || 'LKR').toUpperCase(),
      maximumFractionDigits: 0,
    }).format(safe);
  } catch {
    return `${String(currency || 'LKR').toUpperCase()} ${safe.toFixed(0)}`;
  }
}

function postToPayHere(checkoutUrl, payload) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = checkoutUrl;

  Object.entries(payload || {}).forEach(([k, v]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = v == null ? '' : String(v);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

export default function PricingPage() {
  const { user } = useAuth();

  if (user?.role === 'agency') {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Pricing</h1>
        <p style={{ marginTop: 12 }}>Premium plans are not applicable for agency accounts.</p>
      </div>
    );
  }

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await subscriptionAPI.getPlans(); // GET /api/plans
        if (!mounted) return;
        setPlans(res?.plans || []);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Failed to load plans');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const visiblePlans = useMemo(
    () => (plans || []).filter((p) => p?.isActive === true),
    [plans]
  );

  const startCheckout = async (plan) => {
    if (!plan?._id) return alert('Plan id missing (plan._id).');

    setBusyId(plan._id);
    try {
      const res = await subscriptionAPI.createCheckoutSession(plan._id);

      if (res?.checkoutUrl && res?.payload) {
        postToPayHere(res.checkoutUrl, res.payload);
        return;
      }

      alert('Checkout response missing checkoutUrl/payload');
    } catch (e) {
      alert(e?.message || 'Failed to start checkout');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Pricing</h1>

      {loading && <p style={{ marginTop: 12 }}>Loading plans...</p>}
      {!loading && err && <p style={{ marginTop: 12, color: 'crimson' }}>{err}</p>}

      {!loading && !err && visiblePlans.length === 0 && (
        <p style={{ marginTop: 12 }}>No active plans yet. Ask admin to create plans.</p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
          marginTop: 16,
        }}
      >
        {visiblePlans.map((plan) => (
          <div key={plan._id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{plan.name}</h3>
              {plan.description ? <p style={{ margin: '6px 0 0', color: '#555' }}>{plan.description}</p> : null}
              <p style={{ margin: '6px 0 0', color: '#777', fontSize: 12 }}>
                code: <b>{plan.code || '—'}</b>
              </p>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{formatMoney(plan.price, plan.currency)}</div>
              <div style={{ color: '#666', marginTop: 4 }}>{formatInterval(plan)}</div>
            </div>

            {Array.isArray(plan.features) && plan.features.length > 0 && (
              <ul style={{ marginTop: 12, paddingLeft: 18 }}>
                {plan.features.map((f, idx) => (
                  <li key={`${f}-${idx}`} style={{ marginBottom: 6 }}>
                    {FEATURE_LABELS[f] || f}
                  </li>
                ))}
              </ul>
            )}

            <button
              style={{
                marginTop: 12,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #111',
                background: '#111',
                color: '#fff',
              }}
              disabled={!!busyId}
              onClick={() => startCheckout(plan)}
            >
              {busyId === plan._id ? 'Redirecting…' : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}