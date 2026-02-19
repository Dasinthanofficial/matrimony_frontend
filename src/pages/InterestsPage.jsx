// ===== FILE: ./src/pages/InterestsPage.jsx =====
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InterestCard from '../components/InterestCard';
import { interestAPI } from '../services/api';
import { Icons } from '../components/Icons';

const tabs = [
  { id: 'received', label: 'Received', icon: Icons.Inbox, color: 'icon-box-accent' },
  { id: 'sent', label: 'Sent', icon: Icons.Send, color: 'icon-box-info' },
  { id: 'accepted', label: 'Connected', icon: Icons.HeartHandshake, color: 'icon-box-success' },
];

const normalizeInterest = (interest, currentUserId) => ({
  ...interest,
  currentUserId,
  senderProfile: interest.senderProfile || interest.senderProfileId || null,
  receiverProfile: interest.receiverProfile || interest.receiverProfileId || null,
});

export default function InterestsPage() {
  const [activeTab, setActiveTab] = useState('received');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getUserId } = useAuth();

  const currentUserId = getUserId();

  useEffect(() => {
    loadInterests();
  }, [activeTab]);

  const loadInterests = async () => {
    setLoading(true);
    setError('');

    try {
      let response;
      if (activeTab === 'received') {
        response = await interestAPI.getReceived({ page: 1, limit: 50 });
      } else if (activeTab === 'sent') {
        response = await interestAPI.getSent({ page: 1, limit: 50 });
      } else {
        response = await interestAPI.getAccepted({ page: 1, limit: 50 });
      }

      const list = response?.interests || [];
      setInterests(list.map((i) => normalizeInterest(i, currentUserId)));
    } catch (err) {
      setError('Failed to load interests. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, interestId) => {
    try {
      if (action === 'accept') {
        await interestAPI.accept(interestId);
      } else if (action === 'decline') {
        await interestAPI.decline(interestId, 'Not interested');
      } else if (action === 'withdraw') {
        await interestAPI.withdraw(interestId);
      }
      loadInterests();
    } catch (err) {
      alert(err.message || 'Action failed. Please try again.');
    }
  };

  const getEmptyStateContent = () => {
    switch (activeTab) {
      case 'received':
        return { icon: Icons.Inbox, title: 'No Interests Received', description: 'When someone sends you an interest request, it will appear here.', action: { label: 'Find Matches', path: '/search' } };
      case 'sent':
        return { icon: Icons.Send, title: 'No Interests Sent', description: 'Start connecting with people by sending interest requests.', action: { label: 'Browse Profiles', path: '/search' } };
      case 'accepted':
        return { icon: Icons.HeartHandshake, title: 'No Connections Yet', description: "When you and someone else both accept each other's interest, you'll be connected.", action: { label: 'Find Matches', path: '/search' } };
      default:
        return { icon: Icons.Heart, title: 'No Results', description: 'Nothing to show here.', action: null };
    }
  };

  const emptyState = getEmptyStateContent();
  const EmptyIcon = emptyState.icon;

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="icon-box-md icon-box-accent hidden sm:flex">
              <Icons.Heart size={20} />
            </div>
            <div>
              <h1 className="heading-md">Interests</h1>
              <p className="text-sm text-[var(--text-muted)]">Manage your connections</p>
            </div>
          </div>
          <Link to="/dashboard" className="btn-secondary py-2 px-3 text-xs">
            <Icons.ChevronLeft size={16} />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* ✅ FIX: Stats grid — stacks on small screens */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const count = activeTab === tab.id ? interests.length : '—';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`card p-3 sm:p-4 text-left transition-all ${
                  activeTab === tab.id ? 'border-[var(--accent-500)]/50 shadow-lg' : 'hover:border-[var(--border-secondary)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`icon-box-sm ${activeTab === tab.id ? tab.color : ''}`}>
                    <TabIcon size={16} />
                  </div>
                  {activeTab === tab.id && <span className="badge-accent text-[10px]">Active</span>}
                </div>
                <p className="text-xl sm:text-2xl font-bold">{count}</p>
                <p className="text-xs text-[var(--text-muted)]">{tab.label}</p>
              </button>
            );
          })}
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-6">
        {/* ✅ FIX: horizontal scroll on very small screens */}
        <div className="flex gap-2 p-1.5 rounded-xl card w-fit max-w-full overflow-x-auto">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] text-white shadow-lg'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)]'
                }`}
              >
                <TabIcon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <div className="icon-box-sm icon-box-error flex-shrink-0">
            <Icons.AlertCircle size={16} />
          </div>
          <p className="text-sm text-red-500 flex-1">{error}</p>
          <button onClick={loadInterests} className="btn-ghost text-red-500 text-sm flex-shrink-0">
            <Icons.RefreshCw size={14} />
            <span className="hidden sm:inline">Retry</span>
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="card p-12 sm:p-16">
          <div className="flex flex-col items-center justify-center">
            <div className="spinner-lg mb-4" />
            <p className="text-sm text-[var(--text-muted)]">Loading interests...</p>
          </div>
        </div>
      ) : interests.length === 0 ? (
        <div className="card p-8 sm:p-12 lg:p-16 text-center">
          <div className="icon-box-xl mx-auto mb-6 opacity-50">
            <EmptyIcon size={32} />
          </div>
          <h3 className="heading-sm mb-2">{emptyState.title}</h3>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-6">{emptyState.description}</p>
          {emptyState.action && (
            <Link to={emptyState.action.path} className="btn-primary">
              <Icons.Search size={16} />
              <span>{emptyState.action.label}</span>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[var(--text-muted)]">
              Showing <span className="font-medium text-[var(--text-primary)]">{interests.length}</span> {activeTab}
            </p>
            <button onClick={loadInterests} disabled={loading} className="btn-ghost text-sm">
              <Icons.RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {interests.map((interest) => (
              <InterestCard
                key={interest._id}
                interest={interest}
                onAction={handleAction}
                loading={loading}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}