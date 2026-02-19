// src/pages/agency/AgencyDashboardPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../components/Icons';
import { agencyAPI, verifiedBadgeAPI } from '../../services/api';

export default function AgencyDashboardPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalProfiles: 0,
    activeProfiles: 0,
    totalViews: 0,
    totalEarnings: 0,
    pendingPayout: 0,
    totalTransactions: 0,
  });

  // ✅ Verified Badge (agency)
  const [badgeCfg, setBadgeCfg] = useState(null);
  const [badgeInfo, setBadgeInfo] = useState(null); // { isActive, purchasedAt, expiresAt, ... }
  const [badgeErr, setBadgeErr] = useState(null);

  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const badgeIsEnabled = !!badgeCfg?.isEnabled;
  const badgeIsActive = useMemo(() => {
    if (!badgeInfo?.isActive) return false;
    if (!badgeInfo?.expiresAt) return true; // lifetime
    return new Date(badgeInfo.expiresAt) > new Date();
  }, [badgeInfo]);

  const badgePriceMajor = useMemo(() => {
    const minor = Number(badgeCfg?.priceMinor || 0);
    return minor / 100;
  }, [badgeCfg]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    setBadgeErr(null);

    try {
      // ✅ Load overview + badge info in parallel (badge endpoints require approved agency)
      const [overviewRes, cfgRes, statusRes] = await Promise.allSettled([
        agencyAPI.getOverview(),
        verifiedBadgeAPI.getConfig(),
        verifiedBadgeAPI.getStatus(),
      ]);

      // overview
      if (overviewRes.status === 'fulfilled') {
        const res = overviewRes.value;
        const k = res?.kpis || {};
        const recentProfiles = res?.profiles?.recent || [];
        const recentPayments = res?.success?.recent || [];

        setProfiles(Array.isArray(recentProfiles) ? recentProfiles : []);
        setPayments(Array.isArray(recentPayments) ? recentPayments : []);

        setStats({
          totalProfiles: k?.profiles?.total || 0,
          activeProfiles: k?.profiles?.active || 0,
          totalViews: k?.profileViews?.total || 0,
          // show agency earnings (80% share) from success payments aggregation
          totalEarnings: k?.earnings?.totalAgency || 0,
          pendingPayout: k?.pendingPayout?.amount || 0,
          totalTransactions: k?.transactions?.total || 0,
        });
      } else {
        throw overviewRes.reason;
      }

      // badge config
      if (cfgRes.status === 'fulfilled') {
        setBadgeCfg(cfgRes.value?.config || null);
      } else {
        // keep non-fatal; dashboard can still work
        setBadgeCfg(null);
      }

      // badge status
      if (statusRes.status === 'fulfilled') {
        setBadgeInfo(statusRes.value?.verifiedBadge || null);
      } else {
        setBadgeInfo(null);
        // common: agency not approved yet => requireAgencyApproved blocks status/config
        setBadgeErr(statusRes.reason?.message || null);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('AgencyDashboard loadAll error:', err);
      setError(err?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleCreateProfile = () => navigate('/agency/profiles');
  const handleViewProfile = (id) => window.open(`/profile/${id}`, '_blank');
  const handleOpenVerifiedBadge = () => navigate('/agency/verified-badge');

  const handleDeleteProfile = async (profileId) => {
    if (!window.confirm('Delete profile? This cannot be undone.')) return;
    try {
      await agencyAPI.deleteProfile(profileId);
      refresh();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Delete profile failed', err);
      alert(err?.message || 'Failed to delete profile');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agency Dashboard</h1>
          <p className="text-[var(--text-secondary)]">
            Overview of your agency profiles, recent payments and earnings.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          <button onClick={refresh} className="btn-secondary" disabled={loading}>
            <Icons.RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="ml-2">Refresh</span>
          </button>

          <button onClick={handleOpenVerifiedBadge} className="btn-secondary" title="Verified Badge">
            <Icons.BadgeCheck size={16} />
            <span className="ml-2">Verified Badge</span>
          </button>

          <button onClick={handleCreateProfile} className="btn-primary">
            <Icons.Plus size={16} />
            <span className="ml-2">Create Profile</span>
          </button>

          <button onClick={() => navigate('/agency/payments')} className="btn-secondary">
            <Icons.CreditCard size={16} />
            <span className="ml-2">Payments</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* ✅ Verified Badge card */}
      <div className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Icons.BadgeCheck size={16} className="text-[var(--accent-500)]" />
              Verified Badge
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Boost trust with a verified badge (PayHere checkout).
            </p>
          </div>

          <button onClick={handleOpenVerifiedBadge} className="btn-primary">
            {badgeIsActive ? 'Manage' : 'Buy / Renew'}
          </button>
        </div>

        {badgeErr && (
          <div className="mt-3 text-sm text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
            {badgeErr}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--surface-glass)]">
            <div className="text-xs text-[var(--text-muted)]">Offer</div>
            <div className="mt-1 font-semibold">
              {badgeIsEnabled
                ? `${badgeCfg?.currency || 'LKR'} ${badgePriceMajor.toLocaleString()}`
                : 'Not available'}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              Duration:{' '}
              {Number(badgeCfg?.durationDays ?? 365) <= 0 ? 'Lifetime' : `${badgeCfg?.durationDays} days`}
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--surface-glass)]">
            <div className="text-xs text-[var(--text-muted)]">Status</div>
            <div className={`mt-1 font-semibold ${badgeIsActive ? 'text-green-400' : 'text-gray-300'}`}>
              {badgeIsActive ? 'Active' : 'Not active'}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              Expires: {badgeInfo?.expiresAt ? new Date(badgeInfo.expiresAt).toLocaleString() : '—'}
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[var(--border-primary)] bg-[var(--surface-glass)]">
            <div className="text-xs text-[var(--text-muted)]">Last purchase</div>
            <div className="mt-1 font-semibold">
              {badgeInfo?.purchasedAt ? new Date(badgeInfo.purchasedAt).toLocaleDateString() : '—'}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">
              Tip: Click “Verified Badge” to complete payment/verify.
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Icons.Users size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.totalProfiles}</p>
              <p className="text-xs text-[var(--text-secondary)]">Profiles</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Icons.Check size={18} className="text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.activeProfiles}</p>
              <p className="text-xs text-[var(--text-secondary)]">Active</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Icons.Eye size={18} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.totalViews}</p>
              <p className="text-xs text-[var(--text-secondary)]">Total Views</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Icons.CreditCard size={18} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-xl font-bold">LKR {(stats.totalEarnings || 0).toLocaleString()}</p>
              <p className="text-xs text-[var(--text-secondary)]">Total Earnings</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Icons.Clock size={18} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-xl font-bold">LKR {(stats.pendingPayout || 0).toLocaleString()}</p>
              <p className="text-xs text-[var(--text-secondary)]">Pending Payout</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Icons.Activity size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.totalTransactions}</p>
              <p className="text-xs text-[var(--text-secondary)]">Transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Profiles</h3>
            <div className="text-sm text-[var(--text-secondary)]">{profiles.length}</div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Icons.Loader size={24} className="animate-spin" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">No profiles yet.</div>
          ) : (
            <div className="space-y-3">
              {profiles.slice(0, 6).map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between gap-3 p-3 border border-[var(--border-primary)] rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center text-white overflow-hidden">
                      {p.photos?.[0]?.url ? (
                        <img src={p.photos[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        p.fullName?.charAt(0) || 'U'
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{p.fullName}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {p.city}, {p.country} • {p.profileViews || 0} views
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewProfile(p._id)}
                      className="p-2 rounded-md hover:bg-[var(--surface-glass)]"
                      title="View"
                    >
                      <Icons.Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProfile(p._id)}
                      className="p-2 rounded-md hover:bg-red-500/10 text-red-500"
                      title="Delete"
                    >
                      <Icons.Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Payments</h3>
            <div className="text-sm text-[var(--text-secondary)]">{payments.length}</div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Icons.Loader size={24} className="animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">No payments yet.</div>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 8).map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between gap-3 p-3 border border-[var(--border-primary)] rounded-md"
                >
                  <div>
                    <div className="font-medium">
                      {p.userProfileId?.fullName || p.userId?.fullName || 'User'}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {p.currency || 'LKR'} {p.successFee?.toLocaleString?.() || p.successFee || 0} •{' '}
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-medium text-green-600">
                      {p.currency || 'LKR'} {(p.agencyAmount || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {p.status === 'paid'
                        ? 'Paid (awaiting payout)'
                        : p.status === 'agency_paid'
                        ? 'Payout done'
                        : p.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => navigate('/agency/payments')} className="btn-secondary">
              View All Payments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}