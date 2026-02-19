// src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';
import { adminAPI, marriageSuccessAPI } from '../services/api';

/* =========================
   Tailwind-safe color map
   (avoids bg-${color}-... which Tailwind won't compile)
========================= */
const COLOR = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  green: { bg: 'bg-green-500/10', text: 'text-green-500' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
  red: { bg: 'bg-red-500/10', text: 'text-red-500' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  gray: { bg: 'bg-gray-500/10', text: 'text-gray-500' },
};

/* Small helper so we can work with either id or _id */
const getId = (u) => u?._id || u?.id || u?.userId;

/* ========================= Dashboard Tab ========================= */
const DashboardTab = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Icons.Loader size={24} className="animate-spin" />
      </div>
    );
  }

  // { stats: {...}, recentUsers, reportsByType, recentLogs }
  const s = stats?.stats || stats || {};
  const recentLogs = stats?.recentLogs || [];

  const totalUsers = Number(s?.totalUsers || 0);
  const suspendedUsers = Number(s?.suspendedUsers || 0);
  const activeUsers = Number(s?.activeUsers ?? Math.max(0, totalUsers - suspendedUsers));
  const totalProfiles = Number(s?.totalProfiles || 0);
  const pendingReports = Number(s?.pendingReports || 0);
  const resolvedReports = Number(s?.resolvedReports || 0);

  const statCards = [
    { label: 'Total Users', value: totalUsers, icon: Icons.Users, color: 'blue' },
    { label: 'Active Users', value: activeUsers, icon: Icons.UserCheck, color: 'green' },
    { label: 'Suspended Users', value: suspendedUsers, icon: Icons.UserX, color: 'red' },
    { label: 'Total Profiles', value: totalProfiles, icon: Icons.User, color: 'purple' },
    { label: 'Pending Reports', value: pendingReports, icon: Icons.Flag, color: 'amber' },
    { label: 'Resolved Reports', value: resolvedReports, icon: Icons.CheckCircle, color: 'emerald' },
  ];

  const labelMap = {
    account_created: 'Account created',
    user_login: 'User login',
    user_logout: 'User logout',
    account_deleted_self: 'Account deleted (self)',
    user_suspended: 'User suspended',
    user_unsuspended: 'User unsuspended',
    user_deleted: 'User deleted',
    user_role_changed: 'Role changed',
    agency_approved: 'Agency approved',
    agency_rejected: 'Agency rejected',
    profile_approved: 'Profile approved',
    profile_rejected: 'Profile rejected',
    profile_deleted: 'Profile deleted',
    report_resolved: 'Report resolved',
    report_rejected: 'Report rejected',
    user_warned: 'User warned',
  };

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const cls = COLOR[stat.color] || COLOR.gray;
          const Icon = stat.icon;
          return (
            <div key={index} className="card p-4">
              <div className={`p-2 rounded-lg ${cls.bg} w-fit mb-2`}>
                <Icon size={20} className={cls.text} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Recent Activity</h3>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No activity yet.</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((l) => {
              const actor = l.actorId || l.adminId;
              const actorName = actor?.fullName || actor?.email || l.actorType || 'unknown';
              const targetName =
                l.targetUserId?.fullName ||
                l.targetUserId?.email ||
                l.metadata?.targetSnapshot?.email ||
                '—';

              return (
                <div
                  key={l._id}
                  className="flex items-start justify-between gap-3 border-t border-[var(--border-primary)] pt-2"
                >
                  <div className="text-sm">
                    <div className="font-medium">{labelMap[l.action] || l.action}</div>
                    <div className="text-[var(--text-muted)] text-xs">
                      Actor: {actorName} • Target: {targetName}
                      {l.reason ? ` • Reason: ${l.reason}` : ''}
                    </div>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                    {l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================= Users Tab (role change + superadmin details) ========================= */
const UsersTab = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // role edit state
  const [roleEdits, setRoleEdits] = useState({});
  const [roleSavingId, setRoleSavingId] = useState(null);

  const isSuperadmin = currentUser?.role === 'superadmin';

  // superadmin full-details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsData, setDetailsData] = useState(null);

  const isPremiumActive = (u) => {
    const plan = String(u?.subscription?.plan || 'free');
    const endDateRaw = u?.subscription?.endDate;

    if (plan !== 'free' && endDateRaw) {
      const end = new Date(endDateRaw);
      if (!Number.isNaN(end.valueOf())) return new Date() < end;
    }

    if (u?.premiumExpiry) {
      const exp = new Date(u.premiumExpiry);
      if (!Number.isNaN(exp.valueOf())) return new Date() < exp;
    }

    return false;
  };

  const premiumBadge = (u) => {
    const active = isPremiumActive(u);
    const plan = String(u?.subscription?.plan || 'free');

    if (active) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Icons.Crown size={12} />
          Premium
        </span>
      );
    }

    if (plan !== 'free' || u?.premiumExpiry) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-300">
          Expired
        </span>
      );
    }

    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-300">
        Free
      </span>
    );
  };

  const verifiedBadges = (u) => {
    const emailOk = !!u?.isEmailVerified;
    const phoneOk = !!u?.isPhoneVerified;
    const agencyStatus = u?.agencyVerification?.status || 'none';

    return (
      <div className="flex flex-wrap gap-1.5">
        <span
          className={`px-2 py-1 rounded-full text-[11px] font-medium ${
            emailOk ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-300'
          }`}
        >
          <Icons.Mail size={12} className="inline mr-1" />
          Email
        </span>

        <span
          className={`px-2 py-1 rounded-full text-[11px] font-medium ${
            phoneOk ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-300'
          }`}
        >
          <Icons.Phone size={12} className="inline mr-1" />
          Phone
        </span>

        {u?.role === 'agency' && (
          <span
            className={`px-2 py-1 rounded-full text-[11px] font-medium ${
              agencyStatus === 'approved'
                ? 'bg-green-500/10 text-green-500'
                : agencyStatus === 'pending'
                  ? 'bg-yellow-500/10 text-yellow-500'
                  : agencyStatus === 'rejected'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-gray-500/10 text-gray-300'
            }`}
          >
            <Icons.BadgeCheck size={12} className="inline mr-1" />
            {agencyStatus}
          </span>
        )}
      </div>
    );
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const response = await adminAPI.getUsers(params);
      const list = response?.users || response?.data || [];
      const arr = Array.isArray(list) ? list : [];
      setUsers(arr);

      setRoleEdits((prev) => {
        const next = { ...prev };
        for (const u of arr) {
          const id = getId(u);
          if (id && next[id] == null) next[id] = u.role;
        }
        return next;
      });

      const p = response?.pagination || {};
      const pages = Number(p.pages || p.totalPages || 0);
      if (pages > 0) setTotalPages(pages);
      else if (Number(p.total || 0) > 0 && Number(p.limit || 0) > 0) {
        setTotalPages(Math.max(1, Math.ceil(Number(p.total) / Number(p.limit))));
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (users || []).filter((u) => {
      const okRole = !roleFilter || u.role === roleFilter;
      if (!q) return okRole;
      const hay = `${u.fullName || ''} ${u.email || ''}`.toLowerCase();
      return okRole && hay.includes(q);
    });
  }, [users, search, roleFilter]);

  const handleSuspend = async (userId) => {
    if (!window.confirm('Are you sure you want to suspend this user?')) return;
    try {
      await adminAPI.suspendUser(userId, 'Suspended by admin');
      fetchUsers();
    } catch {
      alert('Failed to suspend user');
    }
  };

  const handleUnsuspend = async (userId) => {
    try {
      await adminAPI.unsuspendUser(userId);
      fetchUsers();
    } catch {
      alert('Failed to unsuspend user');
    }
  };

  const canEditRole = (targetUser) => {
    const currentId = String(getId(currentUser) || '');
    const targetId = String(getId(targetUser) || '');
    if (!currentId || !targetId) return false;
    if (currentId === targetId) return false;
    if (targetUser.role === 'superadmin' && currentUser.role !== 'superadmin') return false;
    return true;
  };

  const roleOptions = () => {
    const all = ['user', 'agency', 'admin', 'superadmin'];
    if (currentUser?.role !== 'superadmin') return all.filter((r) => r !== 'superadmin');
    return all;
  };

  const saveRole = async (targetUser) => {
    const id = getId(targetUser);
    if (!id) return;

    const newRole = roleEdits[id] ?? targetUser.role;
    if (!newRole || newRole === targetUser.role) return;

    if (
      !window.confirm(
        `Change role for ${targetUser.email || targetUser.fullName || 'this user'} to "${newRole}"?`
      )
    )
      return;

    try {
      setRoleSavingId(id);
      await adminAPI.updateUserRole(id, newRole);
      await fetchUsers();
    } catch (e) {
      alert(e?.message || 'Failed to update role');
      setRoleEdits((prev) => ({ ...prev, [id]: targetUser.role }));
    } finally {
      setRoleSavingId(null);
    }
  };

  const openDetails = async (userId) => {
    if (!isSuperadmin) return;
    try {
      setDetailsOpen(true);
      setDetailsLoading(true);
      const res = await adminAPI.getUserFullDetails(userId);
      setDetailsData(res);
    } catch (e) {
      alert(e?.message || 'Failed to load full details');
      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const roleBadgeClass = (role) => {
    if (role === 'superadmin') return 'bg-purple-500/10 text-purple-500';
    if (role === 'admin') return 'bg-violet-500/10 text-violet-500';
    if (role === 'agency') return 'bg-blue-500/10 text-blue-500';
    return 'bg-gray-500/10 text-gray-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input w-full"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="select"
        >
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="agency">Agencies</option>
          <option value="admin">Admins</option>
          <option value="superadmin">Superadmins</option>
        </select>

        <button onClick={fetchUsers} className="btn-secondary" title="Refresh">
          <Icons.RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Icons.Loader size={24} className="animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--surface-glass)] sticky top-0 z-10">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">User</th>
                  <th className="text-left p-4 text-sm font-medium">Role</th>
                  <th className="text-left p-4 text-sm font-medium">Premium</th>
                  <th className="text-left p-4 text-sm font-medium">Verified</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-sm font-medium">Joined</th>
                  <th className="text-left p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((u) => {
                  const id = getId(u);
                  const editable = canEditRole(u);
                  const selectedRole = roleEdits[id] ?? u.role;
                  const changed = selectedRole !== u.role;
                  const saving = roleSavingId === id;

                  return (
                    <tr key={id} className="border-t border-[var(--border-primary)]">
                      <td className="p-4 min-w-[220px]">
                        <p className="font-medium">{u.fullName || u.email}</p>
                        <p className="text-sm text-[var(--text-muted)]">{u.email}</p>
                      </td>

                      <td className="p-4">
                        {editable ? (
                          <select
                            className="select"
                            value={selectedRole}
                            onChange={(e) =>
                              setRoleEdits((prev) => ({ ...prev, [id]: e.target.value }))
                            }
                            disabled={saving}
                            title="Change role"
                          >
                            {roleOptions().map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadgeClass(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">{premiumBadge(u)}</td>
                      <td className="p-4 min-w-[240px]">{verifiedBadges(u)}</td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.isSuspended ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                          }`}
                        >
                          {u.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2 items-center">
                          {editable && (
                            <button
                              onClick={() => saveRole(u)}
                              disabled={!changed || saving}
                              className={`btn-primary text-xs py-1.5 px-3 ${
                                !changed ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title={changed ? 'Save role change' : 'No role change'}
                            >
                              {saving ? (
                                <Icons.Loader size={14} className="animate-spin" />
                              ) : (
                                <>
                                  <Icons.Check size={14} />
                                  <span>Save</span>
                                </>
                              )}
                            </button>
                          )}

                          {u.isSuspended ? (
                            <button
                              onClick={() => handleUnsuspend(id)}
                              className="p-2 rounded-lg hover:bg-green-500/10 text-green-500"
                              title="Unsuspend"
                            >
                              <Icons.Check size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspend(id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                              title="Suspend"
                            >
                              <Icons.X size={16} />
                            </button>
                          )}

                          {isSuperadmin && (
                            <button
                              onClick={() => openDetails(id)}
                              className="btn-secondary text-xs py-1.5 px-3"
                              title="Full details (superadmin only)"
                            >
                              <Icons.Eye size={14} />
                              <span>Details</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-[var(--text-muted)]">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary"
          >
            <Icons.ChevronLeft size={16} />
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary"
          >
            <Icons.ChevronRight size={16} />
          </button>
        </div>
      )}

      {isSuperadmin && detailsOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
          <div className="card w-full max-w-3xl p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Full User Details (Superadmin)</h3>
              <button className="btn-secondary" onClick={() => setDetailsOpen(false)}>
                <Icons.X size={16} />
                <span>Close</span>
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-10 flex justify-center">
                <Icons.Loader size={22} className="animate-spin" />
              </div>
            ) : (
              <pre className="mt-4 text-xs whitespace-pre-wrap bg-[var(--surface-glass)] border border-[var(--border-primary)] rounded-xl p-3 max-h-[70vh] overflow-auto">
                {JSON.stringify(detailsData, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ========================= Premium Packages / Plans Tab (UPDATED) ========================= */

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

const slugify = (s = '') =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const uniq = (arr) => {
  const seen = new Set();
  const out = [];
  for (const v of arr || []) {
    const s = String(v || '').trim();
    if (!s) continue;
    const k = s.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(s);
    }
  }
  return out;
};

const normalizePlan = (p) => {
  const isActive =
    p?.isActive != null
      ? !!p.isActive
      : p?.isEnabled != null
        ? !!p.isEnabled
        : p?.enabled != null
          ? !!p.enabled
          : false;

  const price =
    p?.price != null
      ? Number(p.price || 0)
      : p?.priceMajor != null
        ? Number(p.priceMajor || 0)
        : p?.priceMinor != null
          ? Number(p.priceMinor || 0) / 100
          : 0;

  // if backend doesn’t store interval yet, infer from durationDays
  let interval = p?.interval;
  let intervalCount = p?.intervalCount;

  const dd =
    p?.durationDays != null ? Number(p.durationDays || 0) :
    p?.days != null ? Number(p.days || 0) :
    null;

  if (!interval) {
    if (dd == null) interval = 'month';
    else if (dd <= 0) interval = 'lifetime';
    else if (dd % 365 === 0) interval = 'year';
    else if (dd % 30 === 0) interval = 'month';
    else interval = 'month';
  }

  if (!intervalCount) {
    if (interval === 'lifetime') intervalCount = 1;
    else if (dd != null && dd > 0 && interval === 'year' && dd % 365 === 0) intervalCount = dd / 365;
    else if (dd != null && dd > 0 && interval === 'month' && dd % 30 === 0) intervalCount = dd / 30;
    else intervalCount = 1;
  }

  return {
    ...p,
    name: p?.name || '',
    code: p?.code || p?.planCode || p?.key || slugify(p?.name || ''),
    description: p?.description || '',
    currency: String(p?.currency || 'LKR').toUpperCase(),
    price,
    interval,
    intervalCount: Number(intervalCount || 1),
    isActive,
    features: Array.isArray(p?.features) ? p.features : [],
  };
};

const formatInterval = (plan) => {
  if (plan.interval === 'lifetime') return 'Lifetime';
  const n = Number(plan.intervalCount || 1);
  const unit = plan.interval === 'month' ? 'Month' : plan.interval === 'year' ? 'Year' : plan.interval;
  return n === 1 ? `per ${unit}` : `per ${n} ${unit}s`;
};

const PlansTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState([]);
  const [err, setErr] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    currency: 'LKR',
    price: 0,
    interval: 'month', // month | year | lifetime
    intervalCount: 1,
    isActive: true,
    featureKeys: [],
    customFeaturesText: '',
  });

  const setField = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (err) setErr('');
  };

  const parseCustomFeatures = (text) =>
    uniq(
      String(text || '')
        .split('\n')
        .map((x) => x.trim())
    );

  const buildPayload = (state) => {
    const name = String(state.name || '').trim();
    const code = String(state.code || '').trim() || slugify(name);
    const currency = String(state.currency || 'LKR').toUpperCase();
    const price = Number(state.price || 0);
    const interval = String(state.interval || 'month');
    const intervalCount = Math.max(1, Number(state.intervalCount || 1));

    const features = uniq([...(state.featureKeys || []), ...parseCustomFeatures(state.customFeaturesText)]);

    // ✅ Send “modern” fields + “legacy” compatibility fields
    const durationDays =
      interval === 'lifetime'
        ? 0
        : interval === 'year'
          ? 365 * intervalCount
          : 30 * intervalCount;

    return {
      name,
      code,
      description: String(state.description || '').trim(),
      currency,
      price,
      interval,
      intervalCount: interval === 'lifetime' ? 1 : intervalCount,
      isActive: !!state.isActive,
      features,

      // compatibility for other backend validators:
      isEnabled: !!state.isActive,
      priceMajor: price,
      priceMinor: Math.round(price * 100),
      durationDays,
    };
  };

  const validate = (payload) => {
    if (!payload.name) return 'Plan name is required';
    if (!payload.code) return 'Plan code is required';
    if (!payload.currency) return 'Currency is required';
    if (Number.isNaN(payload.price) || payload.price < 0) return 'Price must be 0 or more';
    if (!payload.interval) return 'Interval is required';
    return '';
  };

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await adminAPI.getPlans();
      const list = res?.plans || res?.data?.plans || res?.data || [];
      const arr = Array.isArray(list) ? list : [];
      setPlans(arr.map(normalizePlan));
    } catch (e) {
      setPlans([]);
      setErr(e?.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setErr('');
    const payload = buildPayload(form);
    const v = validate(payload);
    if (v) return setErr(v);

    setSaving(true);
    try {
      await adminAPI.createPlan(payload);
      setForm({
        name: '',
        code: '',
        description: '',
        currency: 'LKR',
        price: 0,
        interval: 'month',
        intervalCount: 1,
        isActive: true,
        featureKeys: [],
        customFeaturesText: '',
      });
      await load();
    } catch (e) {
      setErr(e?.data?.message || e?.message || 'Failed to create plan');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (p) => {
    setEditPlan(normalizePlan(p));
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editPlan?._id) return;

    try {
      const payload = buildPayload({
        name: editPlan.name,
        code: editPlan.code,
        description: editPlan.description,
        currency: editPlan.currency,
        price: editPlan.price,
        interval: editPlan.interval,
        intervalCount: editPlan.intervalCount,
        isActive: editPlan.isActive,
        featureKeys: (editPlan.features || []).filter((x) => x in FEATURE_LABELS),
        customFeaturesText: (editPlan.features || []).filter((x) => !(x in FEATURE_LABELS)).join('\n'),
      });

      const v = validate(payload);
      if (v) return alert(v);

      await adminAPI.updatePlan(editPlan._id, payload);
      setEditOpen(false);
      setEditPlan(null);
      await load();
    } catch (e) {
      alert(e?.data?.message || e?.message || 'Failed to update plan');
    }
  };

  const toggle = async (planId) => {
    try {
      await adminAPI.togglePlan(planId);
      await load();
    } catch (e) {
      alert(e?.data?.message || e?.message || 'Failed to toggle plan');
    }
  };

  const remove = async (planId) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await adminAPI.deletePlan(planId);
      await load();
    } catch (e) {
      alert(e?.data?.message || e?.message || 'Failed to delete plan');
    }
  };

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h3 className="font-semibold flex items-center gap-2">
          <Icons.Crown size={16} className="text-amber-500" />
          Premium Packages
        </h3>

        {err && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {err}
          </div>
        )}

        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <div>
            <div className="label">Plan Name *</div>
            <input className="input w-full" value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </div>

          <div>
            <div className="label">Plan Code *</div>
            <input
              className="input w-full"
              value={form.code}
              onChange={(e) => setField('code', e.target.value)}
              placeholder="premium_yearly (leave empty to auto-generate)"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="label">Description</div>
            <input
              className="input w-full"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Shown on pricing page"
            />
          </div>

          <div>
            <div className="label">Currency</div>
            <select className="select w-full" value={form.currency} onChange={(e) => setField('currency', e.target.value.toUpperCase())}>
              <option value="LKR">LKR</option>
              <option value="USD">USD</option>
              <option value="INR">INR</option>
            </select>
          </div>

          <div>
            <div className="label">Price *</div>
            <input className="input w-full" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setField('price', Number(e.target.value))} />
          </div>

          <div>
            <div className="label">Interval *</div>
            <select className="select w-full" value={form.interval} onChange={(e) => setField('interval', e.target.value)}>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>

          <div>
            <div className="label">Interval Count</div>
            <input
              className="input w-full"
              type="number"
              min="1"
              disabled={form.interval === 'lifetime'}
              value={form.intervalCount}
              onChange={(e) => setField('intervalCount', Number(e.target.value))}
            />
          </div>

          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setField('isActive', e.target.checked)} />
            Active
          </label>

          <div className="sm:col-span-2">
            <div className="label">Features</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {Object.entries(FEATURE_LABELS).map(([k, label]) => (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featureKeys.includes(k)}
                    onChange={(e) => {
                      const on = e.target.checked;
                      setField('featureKeys', on ? uniq([...form.featureKeys, k]) : form.featureKeys.filter((x) => x !== k));
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="mt-3">
              <div className="text-xs text-[var(--text-muted)] mb-2">Custom features (one per line)</div>
              <textarea className="input w-full min-h-[110px]" value={form.customFeaturesText} onChange={(e) => setField('customFeaturesText', e.target.value)} />
            </div>
          </div>

          <button onClick={create} disabled={saving} className="btn-primary w-full justify-center sm:col-span-2">
            {saving ? <Icons.Loader size={16} className="animate-spin" /> : <Icons.Plus size={16} />}
            <span>{saving ? 'Creating…' : 'Create Package'}</span>
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
          <h3 className="font-semibold">Existing Packages</h3>
          <button onClick={load} className="btn-secondary">
            <Icons.RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Icons.Loader size={22} className="animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="p-10 text-center text-[var(--text-muted)]">No plans found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--surface-glass)]">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Name</th>
                  <th className="text-left p-4 text-sm font-medium">Code</th>
                  <th className="text-left p-4 text-sm font-medium">Price</th>
                  <th className="text-left p-4 text-sm font-medium">Interval</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-sm font-medium">Features</th>
                  <th className="text-left p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p._id} className="border-t border-[var(--border-primary)]">
                    <td className="p-4 font-medium">{p.name}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{p.code || '—'}</td>
                    <td className="p-4 text-sm">{p.currency} {Number(p.price || 0).toFixed(2)}</td>
                    <td className="p-4 text-sm">{formatInterval(p)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-300'}`}>
                        {p.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {Array.isArray(p.features) && p.features.length ? `${p.features.length} items` : '—'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="btn-secondary text-xs py-1.5 px-3">
                          <Icons.Eye size={14} />
                          <span>Edit</span>
                        </button>
                        <button onClick={() => toggle(p._id)} className="btn-secondary text-xs py-1.5 px-3">
                          <Icons.RefreshCw size={14} />
                          <span>Toggle</span>
                        </button>
                        <button onClick={() => remove(p._id)} className="btn-secondary text-xs py-1.5 px-3 text-red-400 hover:bg-red-500/10">
                          <Icons.X size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editOpen && editPlan && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
          <div className="card w-full max-w-2xl p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Edit Plan</h3>
              <button className="btn-secondary" onClick={() => { setEditOpen(false); setEditPlan(null); }}>
                <Icons.X size={16} />
                <span>Close</span>
              </button>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <div className="label">Name</div>
                <input className="input w-full" value={editPlan.name} onChange={(e) => setEditPlan((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <div className="label">Code</div>
                <input className="input w-full" value={editPlan.code} onChange={(e) => setEditPlan((p) => ({ ...p, code: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <div className="label">Description</div>
                <input className="input w-full" value={editPlan.description || ''} onChange={(e) => setEditPlan((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <div className="label">Price</div>
                <input className="input w-full" type="number" min="0" step="0.01" value={editPlan.price} onChange={(e) => setEditPlan((p) => ({ ...p, price: Number(e.target.value) }))} />
              </div>
              <div>
                <div className="label">Currency</div>
                <select className="select w-full" value={editPlan.currency} onChange={(e) => setEditPlan((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}>
                  <option value="LKR">LKR</option>
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <div>
                <div className="label">Interval</div>
                <select className="select w-full" value={editPlan.interval} onChange={(e) => setEditPlan((p) => ({ ...p, interval: e.target.value }))}>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
              <div>
                <div className="label">Interval Count</div>
                <input className="input w-full" type="number" min="1" disabled={editPlan.interval === 'lifetime'} value={editPlan.intervalCount} onChange={(e) => setEditPlan((p) => ({ ...p, intervalCount: Number(e.target.value) }))} />
              </div>

              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={!!editPlan.isActive} onChange={(e) => setEditPlan((p) => ({ ...p, isActive: e.target.checked }))} />
                Active
              </label>

              <div className="sm:col-span-2">
                <div className="label">Features (one per line)</div>
                <textarea
                  className="input w-full min-h-[120px]"
                  value={(editPlan.features || []).join('\n')}
                  onChange={(e) => setEditPlan((p) => ({ ...p, features: uniq(e.target.value.split('\n')) }))}
                />
              </div>

              <button onClick={saveEdit} className="btn-primary w-full justify-center sm:col-span-2">
                <Icons.Check size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ========================= Agency Payments Tab ========================= */
const AgencyPaymentsTab = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processing, setProcessing] = useState(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;

      const response = await marriageSuccessAPI.getAllPayments(params);
      setPayments(response.data || []);
      setStats(response.stats || []);
      setTotalPages(response.pagination?.pages || response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Fetch payments error:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleMarkPaid = async (paymentId) => {
    const reference = window.prompt('Enter payout reference (bank transfer ID, etc.):');
    if (!reference) return;

    try {
      setProcessing(paymentId);
      await marriageSuccessAPI.markAgencyPaid(paymentId, { payoutReference: reference });
      fetchPayments();
    } catch (error) {
      alert('Failed to mark as paid: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      payment_initiated: 'bg-blue-500/10 text-blue-500',
      paid: 'bg-green-500/10 text-green-500',
      agency_paid: 'bg-purple-500/10 text-purple-500',
      disputed: 'bg-red-500/10 text-red-500',
      cancelled: 'bg-gray-500/10 text-gray-500',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-500';
  };

  const totalStats = stats.reduce(
    (acc, s) => {
      acc.totalAmount += s.totalAmount || 0;
      acc.adminAmount += s.adminAmount || 0;
      acc.agencyAmount += s.agencyAmount || 0;
      acc.count += s.count || 0;
      return acc;
    },
    { totalAmount: 0, adminAmount: 0, agencyAmount: 0, count: 0 }
  );

  const paidStats = stats.find((s) => s._id === 'paid') || {};
  const pendingPayoutAmount = paidStats.agencyAmount || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Icons.CreditCard size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold">LKR {totalStats.totalAmount.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-secondary)]">Total Collected</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Icons.TrendingUp size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-green-500">
                LKR {totalStats.adminAmount.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">Admin Commission (20%)</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Icons.Clock size={20} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-yellow-500">
                LKR {pendingPayoutAmount.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">Pending Payouts</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Icons.Activity size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{totalStats.count}</p>
              <p className="text-xs text-[var(--text-secondary)]">Total Transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid (Awaiting Payout)</option>
          <option value="agency_paid">Agency Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={fetchPayments} className="btn-secondary">
          <Icons.RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Icons.Loader size={24} className="animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="card p-8 text-center">
          <Icons.CreditCard size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
          <p className="text-[var(--text-secondary)]">
            Marriage success payments will appear here when users complete payments.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--surface-glass)]">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">User</th>
                  <th className="text-left p-4 text-sm font-medium">Agency</th>
                  <th className="text-left p-4 text-sm font-medium">Profile</th>
                  <th className="text-left p-4 text-sm font-medium">Total Fee</th>
                  <th className="text-left p-4 text-sm font-medium">Admin (20%)</th>
                  <th className="text-left p-4 text-sm font-medium">Agency (80%)</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-sm font-medium">Date</th>
                  <th className="text-left p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-t border-[var(--border-primary)]">
                    <td className="p-4">
                      <p className="font-medium">{payment.userId?.fullName || 'User'}</p>
                      <p className="text-xs text-[var(--text-muted)]">{payment.userId?.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">
                        {payment.agencyId?.agencyName || payment.agencyId?.fullName || 'Agency'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{payment.agencyId?.email}</p>
                    </td>
                    <td className="p-4">
                      <p>{payment.agencyProfileId?.fullName || 'Profile'}</p>
                      <p className="text-xs text-[var(--text-muted)]">{payment.agencyProfileId?.profileId}</p>
                    </td>
                    <td className="p-4 font-medium">
                      {payment.currency} {payment.successFee?.toLocaleString?.() || 0}
                    </td>
                    <td className="p-4 text-green-500 font-medium">
                      {payment.currency} {payment.adminAmount?.toLocaleString?.() || 0}
                    </td>
                    <td className="p-4 text-blue-500 font-medium">
                      {payment.currency} {payment.agencyAmount?.toLocaleString?.() || 0}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4">
                      {payment.status === 'paid' && (
                        <button
                          onClick={() => handleMarkPaid(payment._id)}
                          disabled={processing === payment._id}
                          className="btn-primary text-xs py-1.5 px-3"
                        >
                          {processing === payment._id ? (
                            <Icons.Loader size={14} className="animate-spin" />
                          ) : (
                            <>
                              <Icons.Check size={14} />
                              <span>Pay Agency</span>
                            </>
                          )}
                        </button>
                      )}
                      {payment.status === 'agency_paid' && (
                        <span className="text-xs text-green-500">✓ Paid: {payment.agencyPayoutReference}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary">
            <Icons.ChevronLeft size={16} />
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary"
          >
            <Icons.ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

/* ========================= Reports Tab ========================= */
const ReportsTab = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getReports({ status: statusFilter });
      setReports(response.reports || []);
    } catch (error) {
      console.error('Fetch reports error:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResolve = async (reportId, action) => {
    const note = window.prompt('Enter resolution note:');
    if (!note) return;
    try {
      await adminAPI.resolveReport(reportId, action, note);
      fetchReports();
    } catch (error) {
      alert(error?.message || 'Failed to resolve report');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select">
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <button onClick={fetchReports} className="btn-secondary">
          <Icons.RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Icons.Loader size={24} className="animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="card p-8 text-center">
          <Icons.Flag size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-semibold">No Reports</h3>
          <p className="text-[var(--text-secondary)]">No {statusFilter} reports found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r._id} className="card p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium">{r.reportType || 'report'}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Reported by: {r.reportedByUserId?.fullName || r.reportedByUserId?.email || 'Anonymous'}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Against: {r.reportedUserId?.fullName || r.reportedUserId?.email || 'User'}
                  </p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-300">
                  {r.status}
                </span>
              </div>

              {r.description && <p className="text-sm text-[var(--text-secondary)] mb-3">{r.description}</p>}

              {(r.status === 'pending' || r.status === 'under_review') && (
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => handleResolve(r._id, 'warning')} className="btn-secondary text-sm">
                    Warn User
                  </button>
                  <button
                    onClick={() => handleResolve(r._id, 'suspension')}
                    className="btn-secondary text-sm text-red-500 hover:bg-red-500/10"
                  >
                    Suspend User
                  </button>
                  <button
                    onClick={() => handleResolve(r._id, 'deletion')}
                    className="btn-secondary text-sm text-red-500 hover:bg-red-500/10"
                  >
                    Delete User
                  </button>
                  <button
                    onClick={() => adminAPI.rejectReport(r._id, 'No action needed').then(fetchReports)}
                    className="btn-secondary text-sm"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ========================= Agency Profiles Tab ========================= */
const AgencyProfilesTab = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAgencyProfiles();
      setProfiles(response.profiles || []);
    } catch (error) {
      console.error('Fetch agency profiles error:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={fetchProfiles} className="btn-secondary">
          <Icons.RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Icons.Loader size={24} className="animate-spin" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="card p-8 text-center">
          <Icons.Users size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-semibold">No Agency Profiles</h3>
          <p className="text-[var(--text-secondary)]">No agency-managed profiles found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--surface-glass)]">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Profile</th>
                  <th className="text-left p-4 text-sm font-medium">Agency</th>
                  <th className="text-left p-4 text-sm font-medium">Success Fee</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-sm font-medium">Views</th>
                  <th className="text-left p-4 text-sm font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p._id} className="border-t border-[var(--border-primary)]">
                    <td className="p-4">
                      <p className="font-medium">{p.fullName}</p>
                      <p className="text-xs text-[var(--text-muted)]">{p.profileId}</p>
                    </td>
                    <td className="p-4">
                      <p>{p.agency?.fullName || p.agency?.name || p.agency?.email || 'Unknown'}</p>
                    </td>
                    <td className="p-4 text-green-500 font-medium">
                      {p.successFeeCurrency || 'LKR'} {p.successFee?.toLocaleString?.() || 0}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.isActive !== false ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {p.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">{p.profileViews || 0}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ========================= Verified Badge Tab ========================= */
const VerifiedBadgeTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const [cfg, setCfg] = useState({
    isEnabled: false,
    currency: 'LKR',
    priceMajor: 0,
    durationDays: 365,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await adminAPI.getVerifiedBadgeConfig();
      const c = res?.config || res?.data?.config || res?.data || res;
      setCfg({
        isEnabled: !!c?.isEnabled,
        currency: String(c?.currency || 'LKR').toUpperCase(),
        priceMajor: Number(c?.priceMajor ?? (Number(c?.priceMinor || 0) / 100) ?? 0),
        durationDays: Number(c?.durationDays ?? 365),
      });
    } catch (e) {
      setErr(e?.message || 'Failed to load verified badge config');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setErr('');
    try {
      const priceMajor = Number(cfg.priceMajor || 0);
      const priceMinor = Math.round(priceMajor * 100);

      await adminAPI.updateVerifiedBadgeConfig({
        isEnabled: !!cfg.isEnabled,
        currency: String(cfg.currency || 'LKR').toUpperCase(),
        durationDays: Number(cfg.durationDays ?? 365),
        priceMajor,
        priceMinor,
      });

      await load();
      alert('Verified badge config saved');
    } catch (e) {
      setErr(e?.message || 'Failed to save config');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Icons.BadgeCheck size={16} className="text-[var(--accent-500)]" />
            Verified Badge Settings
          </h3>
          <button onClick={load} className="btn-secondary" disabled={loading || saving}>
            <Icons.RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {err && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {err}
          </div>
        )}

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-[var(--text-muted)]">
            <Icons.Loader size={16} className="animate-spin" />
            Loading…
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={cfg.isEnabled}
                onChange={(e) => setCfg((p) => ({ ...p, isEnabled: e.target.checked }))}
              />
              Enabled
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="label">Currency</div>
                <select
                  className="select w-full"
                  value={cfg.currency}
                  onChange={(e) => setCfg((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
                >
                  <option value="LKR">LKR</option>
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                </select>
              </div>

              <div>
                <div className="label">Duration Days (0 = lifetime)</div>
                <input
                  className="input w-full"
                  type="number"
                  min="0"
                  value={cfg.durationDays}
                  onChange={(e) => setCfg((p) => ({ ...p, durationDays: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <div className="label">Price (Major units)</div>
              <input
                className="input w-full"
                type="number"
                min="0"
                step="0.01"
                value={cfg.priceMajor}
                onChange={(e) => setCfg((p) => ({ ...p, priceMajor: Number(e.target.value) }))}
              />
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Stored as minor: {Math.round(Number(cfg.priceMajor || 0) * 100).toLocaleString()}
              </p>
            </div>

            <button onClick={save} disabled={saving} className="btn-primary w-full justify-center">
              {saving ? <Icons.Loader size={16} className="animate-spin" /> : <Icons.Check size={16} />}
              <span>{saving ? 'Saving…' : 'Save'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================= Main Admin Dashboard Page ========================= */
export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response);
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isSuperadmin = user?.role === 'superadmin';

  // ✅ ADDED: plans tab so “premium package create option” shows in dashboard
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Home },
    { id: 'users', label: 'Users', icon: Icons.Users },
    { id: 'plans', label: 'Premium Packages', icon: Icons.Crown }, // ✅ NEW
    { id: 'agency-payments', label: 'Agency Payments', icon: Icons.CreditCard },
    ...(isSuperadmin ? [{ id: 'agency-profiles', label: 'Agency Profiles', icon: Icons.Building }] : []),
    { id: 'reports', label: 'Reports', icon: Icons.Flag },
    { id: 'verified-badge', label: 'Verified Badge', icon: Icons.BadgeCheck },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] p-4 hidden lg:block">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center">
            <Icons.Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold">Admin Panel</h1>
            <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
          </div>
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--accent-500)]/10 text-[var(--accent-500)] border border-[var(--accent-500)]/20'
                  : 'hover:bg-[var(--surface-glass)] text-[var(--text-secondary)]'
              }`}
            >
              <tab.icon size={18} />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-all"
          >
            <Icons.LogOut size={18} />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <Icons.Shield size={20} className="text-[var(--accent-500)]" />
          <span className="font-bold">Admin</span>
        </div>
        <button onClick={handleLogout} className="p-2 text-red-500">
          <Icons.LogOut size={18} />
        </button>
      </header>

      {/* Mobile Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] px-2 py-2 flex justify-around z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg ${
              activeTab === tab.id ? 'text-[var(--accent-500)]' : 'text-[var(--text-muted)]'
            }`}
          >
            <tab.icon size={18} />
            <span className="text-[10px]">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <div className="p-4 lg:p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold capitalize">
              {tabs.find((t) => t.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {activeTab === 'dashboard' && 'Overview of your platform'}
              {activeTab === 'users' && 'Manage all registered users'}
              {activeTab === 'plans' && 'Create and manage premium subscription packages'} {/* ✅ NEW */}
              {activeTab === 'agency-payments' && 'Manage marriage success payments and agency payouts'}
              {activeTab === 'agency-profiles' && 'View all agency-managed profiles (superadmin only)'}
              {activeTab === 'reports' && 'Handle user reports and issues'}
              {activeTab === 'verified-badge' && 'Set verified badge price, duration and enable/disable'}
            </p>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && <DashboardTab stats={stats} loading={statsLoading} />}
          {activeTab === 'users' && <UsersTab currentUser={user} />}
          {activeTab === 'plans' && <PlansTab />} {/* ✅ NEW */}
          {activeTab === 'agency-payments' && <AgencyPaymentsTab />}
          {activeTab === 'agency-profiles' && isSuperadmin && <AgencyProfilesTab />}
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'verified-badge' && <VerifiedBadgeTab />}
        </div>
      </main>
    </div>
  );
}