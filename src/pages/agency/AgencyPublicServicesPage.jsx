// src/pages/agency/AgencyPublicServicesPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { agencyOrdersAPI } from '../../services/agencyOrdersAPI';

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
}

function formatMoney(amount, currency = 'LKR') {
  const n = Number(amount || 0);
  const cur = String(currency || 'LKR').toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(n);
  } catch {
    return `${cur} ${n.toFixed(2)}`;
  }
}

export default function AgencyPublicServicesPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [agency, setAgency] = useState(null);
  const [services, setServices] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthed = useMemo(() => {
    // your app stores accessToken in cookie; api.getToken exists as a named export,
    // but since you imported default api object here, do a safe check:
    // (if you prefer: import { getToken } from '../../services/api')
    try {
      return Boolean(document.cookie.includes('accessToken='));
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!agencyId) {
      setErr('Missing agencyId');
      setLoading(false);
      return;
    }

    const ctrl = new AbortController();

    (async () => {
      try {
        setErr('');
        setLoading(true);

        const res = await api.apiCall(`/agency/${agencyId}/services`, { signal: ctrl.signal });

        setAgency(res?.agency || null);
        setServices(Array.isArray(res?.services) ? res.services : []);
      } catch (e) {
        if (e?.name === 'AbortError') return;
        setErr(e?.message || 'Failed to load services');
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [agencyId]);

  const bookNow = async (serviceId) => {
    if (!serviceId) return;

    // ✅ Better UX than waiting for a 401 redirect
    if (!isAuthed) {
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }

    if (busy) return; // prevent double-click
    setBusy(serviceId);

    try {
      const res = await agencyOrdersAPI.createCheckout({ serviceId });
      if (res?.checkoutUrl && res?.payload) {
        postToPayHere(res.checkoutUrl, res.payload);
      } else {
        alert('Checkout response missing checkoutUrl/payload');
        setBusy(null);
      }
    } catch (e) {
      alert(e?.message || 'Failed to start checkout');
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 page-container max-w-4xl mx-auto">
      <h1 className="heading-lg mb-2">{agency?.name || 'Agency Services'}</h1>

      {loading && (
        <div className="text-[var(--text-muted)] mt-3">
          Loading services...
        </div>
      )}

      {err && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 mt-4">
          {err}
        </div>
      )}

      {!loading && !err && services.length === 0 && (
        <div className="text-[var(--text-muted)] mt-6">No active services yet.</div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {services.map((s) => (
          <div key={s._id} className="card p-5">
            <div className="font-semibold text-lg">{s.title}</div>
            {s.description ? (
              <p className="text-[var(--text-muted)] mt-2">{s.description}</p>
            ) : null}

            <div className="mt-3 font-bold">
              {formatMoney(s.price, s.currency)}
            </div>

            <button
              className="btn-primary w-full mt-4"
              disabled={busy === s._id}
              onClick={() => bookNow(s._id)}
            >
              {busy === s._id ? 'Redirecting…' : 'Book & Pay'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}