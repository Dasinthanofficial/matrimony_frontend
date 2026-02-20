// src/pages/InterestsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InterestCard from '../components/InterestCard';
import { interestAPI } from '../services/api';
import { Icons } from '../components/Icons';

export default function InterestsPage() {
  const [activeTab, setActiveTab] = useState('received');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getUserId } = useAuth();

  const currentUserId = getUserId();

  const tabs = [
    { id: 'received', label: 'Received', icon: Icons.Inbox, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500' },
    { id: 'sent',     label: 'Sent',     icon: Icons.Send,  color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500' },
    { id: 'accepted', label: 'Connected',icon: Icons.HeartHandshake, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500' },
  ];

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
          title: 'No Requests Yet',
          description: 'When someone sends you an interest request, it will appear here. Complete your profile to get more attention!',
          action: { label: 'Find Matches', path: '/search', icon: Icons.Search }
        };
      case 'sent':
        return {
          icon: Icons.Send,
          title: 'No Sent Requests',
          description: 'Start connecting with people by browsing profiles and sending interest requests.',
          action: { label: 'Browse Profiles', path: '/search', icon: Icons.Search }
        };
      case 'accepted':
        return {
          icon: Icons.HeartHandshake,
          title: 'No Connections',
          description: "When you and someone else both accept each other's interest, you'll be connected.",
          action: { label: 'Start Matching', path: '/search', icon: Icons.Search }
        };
      default:
        return { icon: Icons.Heart, title: 'No Results', description: 'Nothing to show here.', action: null };
    }
  };

  const emptyState = getEmptyStateContent();
  const EmptyIcon = emptyState.icon;

  return (
    <div className="w-full min-h-screen pb-20 px-4 md:px-6 max-w-7xl mx-auto space-y-8">
      
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Interests</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your connections and requests</p>
        </div>
        <Link to="/dashboard" className="btn-secondary self-start md:self-auto text-sm">
          <Icons.ChevronLeft size={16} />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* ===== TABS ===== */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-[var(--surface-glass)] rounded-xl border border-[var(--border-primary)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-[var(--bg-primary)] shadow-sm text-[var(--text-primary)] font-semibold' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-glass-hover)] hover:text-[var(--text-secondary)]'}
              `}
            >
              <TabIcon size={18} className={isActive ? tab.color : ''} />
              <span className="text-xs sm:text-sm">{tab.label}</span>
              {isActive && interests.length > 0 && !loading && (
                <span className={`hidden sm:inline-flex ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${tab.bg} ${tab.color}`}>
                  {interests.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ===== ERROR BANNER ===== */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 animate-fade-in">
          <Icons.AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ===== CONTENT AREA ===== */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Icons.Loader className="animate-spin text-[var(--accent-500)] mb-4" size={32} />
          <p className="text-[var(--text-muted)] text-sm animate-pulse">Loading interests...</p>
        </div>
      ) : interests.length === 0 ? (
        
        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-[var(--border-secondary)] rounded-2xl bg-[var(--surface-glass)]/30">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${activeTab === 'received' ? 'bg-rose-500/10 text-rose-500' : activeTab === 'sent' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            <EmptyIcon size={32} />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{emptyState.title}</h3>
          <p className="text-[var(--text-secondary)] max-w-md mb-8 leading-relaxed">
            {emptyState.description}
          </p>
          {emptyState.action && (
            <Link to={emptyState.action.path} className="btn-primary">
              <emptyState.action.icon size={18} />
              <span>{emptyState.action.label}</span>
            </Link>
          )}
        </div>

      ) : (
        
        /* LIST GRID */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-[var(--text-muted)]">
              Showing <span className="font-bold text-[var(--text-primary)]">{interests.length}</span> {activeTab === 'accepted' ? 'connections' : 'requests'}
            </p>
            <button 
              onClick={loadInterests} 
              className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-500)] transition-colors rounded-lg hover:bg-[var(--surface-glass-hover)]"
              title="Refresh List"
            >
              <Icons.RefreshCw size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {interests.map((interest) => (
              <InterestCard
                key={interest._id}
                interest={interest}
                onAction={handleAction}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}