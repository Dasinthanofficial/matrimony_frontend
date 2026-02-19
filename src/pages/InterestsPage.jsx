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

export default function InterestsPage() {
  const [activeTab, setActiveTab] = useState('received');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getUserId } = useAuth();

  const currentUserId = getUserId();

  useEffect(() => {
    loadInterests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setInterests(list.map((i) => ({
        ...i,
        currentUserId,
        senderProfile: i.senderProfile || i.senderProfileId || null,
        receiverProfile: i.receiverProfile || i.receiverProfileId || null,
      })));
    } catch (err) {
      setError('Failed to load interests. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, interestId) => {
    try {
      if (action === 'accept') await interestAPI.accept(interestId);
      else if (action === 'decline') await interestAPI.decline(interestId, 'Not interested');
      else if (action === 'withdraw') await interestAPI.withdraw(interestId);
      loadInterests();
    } catch (err) {
      alert(err.message || 'Action failed. Please try again.');
    }
  };

  const getEmptyStateContent = () => {
    switch (activeTab) {
      case 'received':
        return {
          icon: Icons.Inbox,
          title: 'No Interests Received',
          description: 'When someone sends you an interest request, it will appear here. Complete your profile to get more attention!',
          action: { label: 'Find Matches', path: '/search' }
        };
      case 'sent':
        return {
          icon: Icons.Send,
          title: 'No Interests Sent',
          description: 'Start connecting with people by browsing profiles and sending interest requests.',
          action: { label: 'Browse Profiles', path: '/search' }
        };
      case 'accepted':
        return {
          icon: Icons.HeartHandshake,
          title: 'No Connections Yet',
          description: "When you and someone else both accept each other's interest, you'll be connected.",
          action: { label: 'Find Matches', path: '/search' }
        };
      default:
        return { icon: Icons.Heart, title: 'No Results', description: 'Nothing to show here.', action: null };
    }
  };

  const emptyState = getEmptyStateContent();
  const EmptyIcon = emptyState.icon;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center shadow-lg shadow-[var(--accent-500)]/20 hidden sm:flex">
              <Icons.Heart size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Interests</h1>
              <p className="text-sm text-[var(--text-secondary)]">Manage your connections</p>
            </div>
          </div>
          <Link to="/dashboard" className="btn-secondary py-2 px-4 text-sm">
            <Icons.ChevronLeft size={16} />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Stats Grid - 3 cols on all screens, responsive padding/text */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const count = activeTab === tab.id ? interests.length : '—';
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-5 text-left transition-all duration-300 border
                  ${isActive 
                    ? 'border-[var(--accent-500)]/30 bg-[var(--accent-500)]/5 shadow-lg shadow-[var(--accent-500)]/5' 
                    : 'border-[var(--border-primary)] bg-[var(--surface-glass)] hover:border-[var(--border-secondary)] hover:bg-[var(--surface-glass-hover)]'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent-500)]" />
                )}
                
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className={`
                    p-1.5 sm:p-2 rounded-lg sm:rounded-xl 
                    ${isActive ? 'bg-[var(--accent-500)]/10 text-[var(--accent-500)]' : 'bg-[var(--surface-glass-active)] text-[var(--text-muted)]'}
                  `}>
                    <TabIcon size={18} className="sm:w-6 sm:h-6" />
                  </div>
                  {isActive && (
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[var(--accent-500)]/10 text-[var(--accent-500)] text-[10px] font-bold uppercase tracking-wider">
                      Active
                    </span>
                  )}
                </div>
                
                <p className="text-xl sm:text-3xl font-bold text-[var(--text-primary)] mb-0.5">{count}</p>
                <p className="text-[10px] sm:text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  {tab.label}
                </p>
              </button>
            );
          })}
        </div>
      </header>

      {/* Error State */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <div className="icon-box-sm bg-red-500/10 text-red-500 flex-shrink-0">
            <Icons.AlertCircle size={18} />
          </div>
          <p className="text-sm text-red-400 flex-1">{error}</p>
          <button onClick={loadInterests} className="btn-ghost text-red-500 text-sm hover:bg-red-500/10 px-3 py-1.5 rounded-lg">
            <Icons.RefreshCw size={14} />
            <span className="hidden sm:inline ml-2">Retry</span>
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="card p-16 sm:p-24 flex flex-col items-center justify-center">
          <div className="spinner-lg mb-4 text-[var(--accent-500)]" />
          <p className="text-sm font-medium text-[var(--text-muted)] animate-pulse">Loading interests...</p>
        </div>
      ) : interests.length === 0 ? (
        <div className="card p-8 sm:p-16 lg:p-24 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 rounded-full bg-[var(--surface-glass)] flex items-center justify-center border border-[var(--border-primary)] shadow-xl">
              <EmptyIcon size={32} className="sm:w-12 sm:h-12 text-[var(--text-muted)] opacity-40" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-3">{emptyState.title}</h3>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-8 leading-relaxed">
              {emptyState.description}
            </p>
            {emptyState.action && (
              <Link 
                to={emptyState.action.path} 
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm sm:text-base"
              >
                <Icons.Search size={18} />
                <span>{emptyState.action.label}</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-[var(--text-muted)]">
              Showing <span className="font-bold text-[var(--text-primary)]">{interests.length}</span> {activeTab} interest{interests.length !== 1 ? 's' : ''}
            </p>
            <button 
              onClick={loadInterests} 
              disabled={loading} 
              className="btn-ghost text-xs sm:text-sm hover:bg-[var(--surface-glass-hover)] px-3 py-1.5 rounded-lg"
            >
              <Icons.RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
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