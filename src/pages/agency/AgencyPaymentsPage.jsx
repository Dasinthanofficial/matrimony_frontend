import React, { useEffect, useState } from 'react';
import { Icons } from '../../components/Icons';
import { marriageSuccessAPI } from '../../services/api';

export default function AgencyPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setLoading(true);
    try {
      const res = await marriageSuccessAPI.getAgencyPayments();
      setPayments(res?.data || res || []);
      setStats(res?.stats || {});
    } catch (err) {
      console.error(err);
      // show nothing fancy; use alert for now
      alert('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments & Earnings</h1>
        <p className="text-[var(--text-secondary)]">
          Track your marriage success payments and earnings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Icons.CreditCard size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-green-500">
                LKR {(stats?.totalEarnings || 0).toLocaleString()}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">Total Earnings</p>
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
                LKR {(stats?.pendingPayout || 0).toLocaleString()}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">Pending Payout</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Icons.Check size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats?.agencyPaid || 0}</p>
              <p className="text-xs text-[var(--text-secondary)]">Completed</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Icons.Activity size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats?.total || payments.length}</p>
              <p className="text-xs text-[var(--text-secondary)]">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Icons.Loader className="animate-spin" size={24} />
        </div>
      ) : payments.length === 0 ? (
        <div className="card p-8 text-center">
          <Icons.CreditCard size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Payments Yet</h3>
          <p className="text-[var(--text-secondary)]">
            Payments will appear here when users report successful marriages from your profiles.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--surface-glass)]">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">User</th>
                  <th className="text-left p-4 text-sm font-medium">Profile</th>
                  <th className="text-left p-4 text-sm font-medium">Total Fee</th>
                  <th className="text-left p-4 text-sm font-medium">Your Share</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-sm font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-t border-[var(--border-primary)]">
                    <td className="p-4">
                      <div className="font-medium">{p.userProfileId?.fullName || p.userId?.fullName || 'User'}</div>
                      <div className="text-xs text-[var(--text-muted)]">{p.userId?.email}</div>
                    </td>
                    <td className="p-4">
                      <div>{p.agencyProfileId?.fullName || 'Profile'}</div>
                      <div className="text-xs text-[var(--text-muted)]">{p.agencyProfileId?.profileId}</div>
                    </td>
                    <td className="p-4">{p.currency || 'LKR'} {p.successFee?.toLocaleString()}</td>
                    <td className="p-4 text-green-500">{p.currency || 'LKR'} {(p.agencyAmount || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {new Date(p.createdAt).toLocaleDateString()}
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
}