import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InterestCard from '../components/InterestCard';
import { interestAPI } from '../services/api';
import { Icons } from '../components/Icons';

const tabs = [
  { id: 'received', label: 'Received', icon: Icons.Inbox, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500' },
  { id: 'sent',     label: 'Sent',     icon: Icons.Send,  color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500' },
  { id: 'accepted', label: 'Connected',icon: Icons.HeartHandshake, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500' },
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
        response = await interestAPI.getReceived({ page: 1, limit: 100 });
      } else if (activeTab === 'sent') {
        response = await interestAPI.getSent({ page: 1, limit: 100 });
      } else {
        response = await interestAPI.getAccepted({ page: 1, limit: 100 });
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
          action: { label: 'Find Matches', path: '/search', icon: Icons.Search }
        };
      case 'sent':
        return {
          icon: Icons.Send,
          title: 'No Interests Sent',
          description: 'Start connecting with people by browsing profiles and sending interest requests.',
          action: { label: 'Browse Profiles', path: '/search', icon: Icons.Search }
        };
      case 'accepted':
        return {
          icon: Icons.HeartHandshake,
          title: 'No Connections Yet',
          description: "When you and someone else both accept each other's interest, you'll be connected.",
          action: { label: 'Find Matches', path: '/search', icon: Icons.Search }
        };
      default:
        return { icon: Icons.Heart, title: 'No Results', description: 'Nothing to show here.', action: null };
    }
  };

  const emptyState = getEmptyStateContent();
  const EmptyIcon = emptyState.icon;

  return (
    <div className="w-full min-h-screen pb-10">
      
      {/* ===== HEADER & TABS CONTAINER ===== */}
      <div className="w-full mb-6 md:mb-8">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center shadow-lg shadow-[var(--accent-500)]/20 flex-shrink-0">
              <Icons.Heart className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Interests</h1>
              <p className="text-xs md:text-sm text-[var(--text-secondary)]">Manage your connections</p>
            </div>
          </div>
          
          <Link to="/dashboard" className="btn-secondary py-2 px-4 text-xs md:text-sm md:self-center self-start">
            <Icons.ChevronLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Full Width Tabs */}
        <div className="grid grid-cols-3 gap-2 md:gap-6">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const count = activeTab === tab.id ? interests.length : 0;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4
                  p-2 md:p-5 rounded-xl md:rounded-2xl transition-all duration-300 border text-center md:text-left
                  group overflow-hidden
                  ${isActive 
                    ? `bg-[var(--surface-glass-active)] border-[var(--accent-500)]/40 shadow-lg shadow-[var(--accent-500)]/5` 
                    : 'bg-[var(--surface-glass)] border-[var(--border-primary)] hover:border-[var(--border-secondary)] hover:bg-[var(--surface-glass-hover)]'
                  }
                `}
              >
                {/* Active Indicator (Bottom on mobile, Left on desktop) */}
                {isActive && (
                   <div className="absolute bottom-0 left-0 right-0 h-0.5 md:h-full md:w-1 md:right-auto md:top-0 bg-[var(--accent-500)]" />
                )}

                {/* Icon Box */}
                <div className={`
                  p-2 md:p-3 rounded-lg md:rounded-xl flex-shrink-0 transition-colors
                  ${isActive ? tab.bg + ' ' + tab.color : 'bg-[var(--surface-glass-active)] text-[var(--text-muted)]'}
                `}>
                  <TabIcon className="w-5 h-5 md:w-6 md:h-6" />
                </div>

                {/* Text Content */}
                <div className="flex flex-col items-center md:items-start min-w-0">
                  <span className="text-lg md:text-3xl font-bold text-[var(--text-primary)] leading-none md:mb-1">
                     {loading && isActive ? '-' : isActive ? count : '•'}
                  </span>
                  <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider truncate max-w-full ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== ERROR BANNER ===== */}
      {error && (
        <div className="w-full mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <Icons.AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-400 flex-1">{error}</p>
          <button onClick={loadInterests} className="btn-ghost text-red-500 text-xs hover:bg-red-500/10 px-3 py-1.5 rounded-lg">
            Retry
          </button>
        </div>
      )}

      {/* ===== CONTENT AREA (Full Width) ===== */}
      {loading ? (
        <div className="w-full h-[50vh] rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-glass)] flex flex-col items-center justify-center">
          <div className="spinner-lg mb-4 text-[var(--accent-500)]" />
          <p className="text-sm font-medium text-[var(--text-muted)] animate-pulse">Syncing interests...</p>
        </div>
      ) : interests.length === 0 ? (
        
        /* ===== EMPTY STATE (Wide) ===== */
        <div className="w-full h-[60vh] rounded-2xl border border-dashed border-[var(--border-secondary)] bg-[var(--surface-glass)]/30 flex flex-col items-center justify-center text-center p-6 md:p-12 relative overflow-hidden group">
          {/* Decorative background Icon */}
          <EmptyIcon className="absolute opacity-[0.03] w-96 h-96 -bottom-20 -right-20 text-[var(--text-primary)] pointer-events-none transform -rotate-12 transition-transform duration-1000 group-hover:rotate-0" />
          
          <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center mb-6 relative z-10 shadow-xl ${emptyState.action ? 'bg-[var(--surface-glass-active)]' : 'bg-transparent'}`}>
            <EmptyIcon className="text-[var(--text-muted)] opacity-60 w-10 h-10 md:w-12 md:h-12" />
          </div>
          
          <h3 className="text-xl md:text-3xl font-bold text-[var(--text-primary)] mb-3 relative z-10">{emptyState.title}</h3>
          <p className="text-sm md:text-lg text-[var(--text-secondary)] mb-8 max-w-lg mx-auto leading-relaxed relative z-10">
            {emptyState.description}
          </p>
          
          {emptyState.action && (
            <Link 
              to={emptyState.action.path} 
              className="relative z-10 btn-primary inline-flex items-center gap-2 px-8 py-3 text-sm md:text-base shadow-lg shadow-[var(--accent-500)]/20 hover:scale-105 transition-transform"
            >
              <emptyState.action.icon size={18} />
              <span>{emptyState.action.label}</span>
            </Link>
          )}
        </div>

      ) : (
        
        /* ===== GRID LIST (Wide) ===== */
        <>
          <div className="flex items-center justify-between mb-4 md:mb-6 px-1">
            <p className="text-xs md:text-sm text-[var(--text-muted)]">
              Showing <span className="font-bold text-[var(--text-primary)]">{interests.length}</span> {activeTab === 'received' ? 'requests' : activeTab === 'sent' ? 'requests' : 'connections'}
            </p>
            <button 
              onClick={loadInterests} 
              className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-[var(--accent-500)] hover:text-[var(--accent-600)] transition-colors"
            >
              <Icons.RefreshCw size={14} />
              <span>Refresh List</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 w-full">
            {interests.map((interest) => (
              <div key={interest._id} className="h-full">
                <InterestCard
                  interest={interest}
                  onAction={handleAction}
                  loading={loading}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}