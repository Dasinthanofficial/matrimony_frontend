import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { subscriptionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';

export default function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const orderId = searchParams.get('order_id');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [subscription, setSubscription] = useState(null);

  const stopRef = useRef(false);

  useEffect(() => {
    stopRef.current = false;

    if (!orderId) {
      setLoading(false);
      setStatus('failed');
      return;
    }

    let tries = 0;
    const maxTries = 25; // ~50s if interval=2s

    const tick = async () => {
      tries += 1;
      try {
        const res = await subscriptionAPI.verifyPayment({ orderId });
        const s = res?.status || 'pending';
        setStatus(s);
        setSubscription(res?.subscription || null);

        if (s === 'succeeded') {
          try {
            await refreshUser();
          } catch {}
          stopRef.current = true;
        }

        if (s === 'failed' || s === 'cancelled') {
          stopRef.current = true;
        }
      } catch {
        // keep polling (PayHere notify may be delayed)
      } finally {
        setLoading(false);
      }
    };

    tick();
    const id = setInterval(() => {
      if (stopRef.current || tries >= maxTries) {
        clearInterval(id);
        return;
      }
      tick();
    }, 2000);

    return () => {
      stopRef.current = true;
      clearInterval(id);
    };
  }, [orderId, refreshUser]);

  const success = status === 'succeeded';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-lg mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full text-center">
        {success ? (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Icons.Check size={40} className="text-green-500" />
            </div>

            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-[var(--text-secondary)] mb-6">Welcome to Premium! Your subscription is now active.</p>

            {subscription && (
              <div className="card p-4 mb-6 text-left">
                <div className="flex justify-between mb-2">
                  <span className="text-[var(--text-muted)]">Plan</span>
                  <span className="font-medium">{subscription.plan}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-[var(--text-muted)]">Status</span>
                  <span className="text-green-500 font-medium">Active</span>
                </div>
                {subscription.endDate && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Valid Until</span>
                    <span>{new Date(subscription.endDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
                Go to Dashboard
              </button>
              <button onClick={() => navigate('/search')} className="btn-secondary w-full">
                Start Finding Matches
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Icons.Clock size={40} className="text-amber-500" />
            </div>

            <h1 className="text-2xl font-bold mb-2">Payment Pending</h1>
            <p className="text-[var(--text-secondary)] mb-6">
              PayHere confirmation can take a moment. This page will auto-check for a short time.
            </p>

            <div className="space-y-3">
              <button onClick={() => window.location.reload()} className="btn-primary w-full">
                Refresh
              </button>
              <button onClick={() => navigate('/pricing')} className="btn-secondary w-full">
                Back to Pricing
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}