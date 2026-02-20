import React, { useEffect, useMemo, useState } from 'react';
import { subscriptionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';

// --- CONSTANTS ---
const FEATURE_LABELS = {
  chatAccess: 'Unlimited Chat Access',
  seeWhoLiked: 'See Who Liked You',
  unlimitedLikes: 'Unlimited Likes',
  profileBoost: '3x Profile Boost',
  readReceipts: 'Message Read Receipts',
  prioritySupport: 'Priority Support',
  contactUnlock: 'View Contact Numbers',
  personalManager: 'Personal Relationship Manager',
  vipEvents: 'Access to VIP Events',
  profileHighlight: 'Featured Profile Highlight',
};

// --- HELPERS ---
function formatInterval(plan) {
  if (plan.interval === 'lifetime') return 'One-time payment';
  const n = Number(plan.intervalCount || 1);
  const unit = plan.interval === 'month' ? 'month' : plan.interval === 'year' ? 'year' : plan.interval;
  return n === 1 ? `Billed monthly` : `Billed every ${n} ${unit}s`;
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
        const res = await subscriptionAPI.getPlans();
        if (!mounted) return;
        setPlans(res?.plans || []);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || 'Failed to load plans');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const visiblePlans = useMemo(
    () => (plans || []).filter((p) => p?.isActive === true),
    [plans]
  );

const startCheckout = async (plan) => {
  if (!plan?._id) return alert('Plan id missing (plan._id).');

  const price = Number(plan.price || 0);
  if (price <= 0) {
    alert('This plan is free and does not require payment.');
    return;
  }

  setBusyId(plan._id);
  try {
    const res = await subscriptionAPI.createCheckoutSession(plan._id);
    if (res?.checkoutUrl && res?.payload) {
      postToPayHere(res.checkoutUrl, res.payload);
      return;
    }
    alert('Checkout response missing checkoutUrl/payload');
  } catch (e) {
    // apiCall() errors: prefer e.data.message if present
    alert(e?.data?.message || e?.message || 'Failed to start checkout');
  } finally {
    setBusyId(null);
  }
};

  if (user?.role === 'agency') {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="card p-8 text-center max-w-md bg-white dark:bg-[var(--surface-glass)] shadow-xl rounded-2xl">
           <div className="mx-auto mb-4 text-[var(--accent-500)]">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
           </div>
           <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Agency Account</h1>
           <p className="text-gray-600 dark:text-[var(--text-secondary)]">
             Premium plans are for individual users. Agencies have separate billing arrangements.
           </p>
        </div>
      </div>
    );
  }

  return (
    // Increased top padding/margin to prevent navbar overlap
    <div className="min-h-screen pb-20 p-4 pt-10 lg:p-6 max-w-[1200px] mx-auto">
      {/* Header - Fixed Colors for Light/Dark Mode */}
      <div className="text-center mb-12 mt-8 lg:mt-10 space-y-3 px-2">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Simple, Transparent <span className="text-gradient">Pricing</span>
        </h1>
        <p className="text-gray-600 dark:text-[var(--text-secondary)] text-base md:text-lg max-w-xl mx-auto leading-relaxed font-medium">
          Upgrade to unlock exclusive features and find your match faster.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
           <Icons.Loader className="animate-spin text-[var(--accent-500)]" size={40} />
           <p className="text-gray-500 dark:text-[var(--text-muted)] animate-pulse">Loading best offers...</p>
        </div>
      )}

      {err && (
        <div className="max-w-md mx-auto p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 text-center flex items-center justify-center gap-2">
           <Icons.AlertCircle size={20} />
           <span>{err}</span>
        </div>
      )}

      {!loading && !err && visiblePlans.length === 0 && (
        <div className="text-center p-12 border border-dashed border-gray-300 dark:border-[var(--border-primary)] rounded-3xl">
           <p className="text-gray-500 dark:text-[var(--text-muted)]">No active subscription plans available at the moment.</p>
        </div>
      )}

      {/* Plans Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
        {visiblePlans.map((plan) => {
          const isPopular = plan.name.toLowerCase().includes('gold') || plan.name.toLowerCase().includes('premium');
          const isFree = plan.price === 0;

          return (
            <div 
              key={plan._id} 
              className={`
                relative flex flex-col h-full rounded-3xl p-6 md:p-8 transition-all duration-300
                ${isPopular 
                  ? 'bg-white dark:bg-gradient-to-b dark:from-[var(--surface-glass)] dark:to-[var(--bg-secondary)] border-2 border-[var(--accent-500)] shadow-[0_10px_40px_-10px_rgba(239,68,68,0.2)] transform md:-translate-y-4' 
                  : 'bg-white dark:bg-[var(--surface-glass)] border border-gray-200 dark:border-[var(--border-primary)] shadow-xl hover:shadow-2xl'
                }
              `}
            >
              {isPopular && (
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[var(--accent-500)] text-white text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    Most Popular
                 </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="text-gray-500 dark:text-[var(--text-secondary)] text-sm leading-snug min-h-[40px]">
                  {plan.description || "Perfect for getting started"}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-gray-100 dark:border-[var(--border-subtle)]">
                 <div className="flex items-end gap-1">
                    <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                       {isFree ? 'Free' : formatMoney(plan.price, plan.currency).replace('.00', '')}
                    </span>
                    {!isFree && (
                      <span className="text-gray-500 dark:text-[var(--text-muted)] font-medium mb-1.5">
                         /{plan.interval === 'month' ? 'mo' : plan.interval === 'year' ? 'yr' : 'fixed'}
                      </span>
                    )}
                 </div>
                 {!isFree && (
                   <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] mt-2 font-medium bg-gray-100 dark:bg-[var(--bg-secondary)] inline-block px-2 py-1 rounded-md">
                      {formatInterval(plan)}
                   </p>
                 )}
              </div>

              {/* Features List */}
              <div className="flex-1 mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-[var(--text-primary)] dark:opacity-70 mb-4">
                  What's included:
                </p>
                <ul className="space-y-4">
                  {Array.isArray(plan.features) && plan.features.length > 0 ? (
                    plan.features.map((f, idx) => (
                      <li key={`${f}-${idx}`} className="flex items-start gap-3">
                        <div className={`mt-0.5 p-0.5 rounded-full flex-shrink-0 ${isPopular ? 'bg-[var(--accent-500)] text-white' : 'bg-gray-200 dark:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-primary)]'}`}>
                           <Icons.Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-gray-700 dark:text-[var(--text-primary)] text-sm md:text-[15px] font-medium leading-tight">
                           {FEATURE_LABELS[f] || f}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-3">
                       <div className="mt-0.5 p-0.5 rounded-full bg-gray-200 dark:bg-[var(--bg-secondary)] text-gray-500 dark:text-[var(--text-muted)]">
                          <Icons.Check size={12} strokeWidth={3} />
                       </div>
                       <span className="text-gray-500 dark:text-[var(--text-secondary)] text-sm font-medium">Basic profile visibility</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Action Button - Updated Colors */}
              <button
                disabled={!!busyId}
                onClick={() => startCheckout(plan)}
                className={`
                  w-full py-4 px-6 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300
                  flex items-center justify-center gap-2
                  ${isPopular 
                     ? 'bg-[var(--accent-500)] text-white hover:bg-[var(--accent-600)] shadow-lg hover:shadow-[var(--accent-500)]/40 hover:-translate-y-1' 
                     : 'bg-[var(--bg-tertiary)] border-2 border-gray-200 hover:border-gray-900 text-gray-900 dark:bg-[var(--bg-secondary)] dark:border-[var(--border-subtle)] dark:text-[var(--text-primary)] dark:hover:bg-[var(--border-secondary)] hover:-translate-y-1'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                `}
              >
                {busyId === plan._id ? (
                  <>
                    <Icons.Loader className="animate-spin" size={18} /> 
                    Processing...
                  </>
                ) : (
                  isFree ? 'Get Started' : `Choose ${plan.name}`
                )}
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Footer Trust */}
      <div className="mt-20 pt-10 border-t border-gray-200 dark:border-[var(--border-subtle)] text-center">
         <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-gray-500 dark:text-[var(--text-muted)] opacity-80">
            <div className="flex items-center gap-2">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
               <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
               <span className="text-sm font-medium">Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
               <span className="text-sm font-medium">24/7 Support</span>
            </div>
         </div>
      </div>
    </div>
  );
}