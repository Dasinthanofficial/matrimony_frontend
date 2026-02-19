import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { interestAPI, chatAPI, profileAPI, searchAPI } from '../services/api';

const quickActions = [
  { name: 'Find Matches', path: '/search',    icon: Icons.Search,       color: 'bg-blue-500/10 text-blue-500'  },
  { name: 'Interests',    path: '/interests', icon: Icons.Heart,        color: 'bg-rose-500/10 text-rose-500'  },
  { name: 'Shortlist',    path: '/shortlist', icon: Icons.Bookmark,     color: 'bg-amber-500/10 text-amber-500'},
  { name: 'Messages',     path: '/chat',      icon: Icons.MessageSquare,color: 'bg-green-500/10 text-green-500'},
];

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now  = new Date();
  const diffMs   = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours= Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins  < 1)  return 'Just now';
  if (diffMins  < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays  < 7)  return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function DashboardPage() {
  const { user, refreshUser, hasPremiumAccess } = useAuth();
  const premium = hasPremiumAccess();

  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const [completionData, setCompletionData] = useState({
    percentage: 0,
    details: {
      basicInfo: 0, physicalAttributes: 0, lifestyle: 0,
      location: 0, education: 0, photos: 0, partnerPreferences: 0,
    },
  });

  const [stats, setStats] = useState({
    interestsReceived: 0, interestsSent: 0, pendingInterests: 0,
    matches: 0, conversations: 0, unreadMessages: 0,
    profileViews: 0, shortlistCount: 0,
  });

  const [recentActivity,    setRecentActivity]    = useState([]);
  const [suggestedProfiles, setSuggestedProfiles] = useState([]);

  /* ---- loaders ---- */
  const loadProfileCompletion = useCallback(async () => {
    try {
      const response = await profileAPI.getCompletion();
      setCompletionData({ percentage: response.percentage || 0, details: response.details || {} });
      const profileResponse = await profileAPI.getMyProfile();
      if (profileResponse.profile) {
        setStats(prev => ({ ...prev, profileViews: profileResponse.profile.profileViews || 0 }));
      }
    } catch (err) {
      console.warn('Profile completion not available:', err?.message);
    }
  }, []);

  const loadInterestStats = useCallback(async () => {
    try {
      const [receivedRes, sentRes, matchesRes] = await Promise.all([
        interestAPI.getReceived({ page: 1, limit: 100 }),
        interestAPI.getSent({ page: 1, limit: 1 }),
        interestAPI.getAccepted({ page: 1, limit: 1 }),
      ]);
      const receivedInterests = receivedRes.interests || [];
      setStats(prev => ({
        ...prev,
        interestsReceived: receivedRes.pagination?.total || receivedInterests.length,
        interestsSent:     sentRes.pagination?.total || 0,
        pendingInterests:  receivedInterests.filter(i => i.status === 'pending').length,
        matches:           matchesRes.pagination?.total || matchesRes.interests?.length || 0,
      }));
    } catch (err) {
      console.warn('Interest stats not available:', err?.message);
    }
  }, []);

  const loadChatStats = useCallback(async () => {
    try {
      const convRes = await chatAPI.getConversations({ page: 1, limit: 100 });
      const conversations = convRes.conversations?.length || 0;
      try {
        const unreadRes = await chatAPI.getUnreadCount();
        setStats(prev => ({ ...prev, conversations, unreadMessages: unreadRes.unreadCount || 0 }));
      } catch {
        setStats(prev => ({ ...prev, conversations }));
      }
    } catch (err) {
      console.warn('Chat stats not available:', err?.message);
    }
  }, []);

  const loadShortlistCount = useCallback(async () => {
    try {
      const shortlistRes = await interestAPI.getShortlist({ page: 1, limit: 1 });
      setStats(prev => ({
        ...prev,
        shortlistCount: shortlistRes.pagination?.total || shortlistRes.shortlist?.length || 0,
      }));
    } catch (err) {
      console.warn('Shortlist not available:', err?.message);
    }
  }, []);

  const loadRecentActivity = useCallback(async () => {
    try {
      const activities = [];

      const receivedRes = await interestAPI.getReceived({ page: 1, limit: 3 });
      if (receivedRes.interests?.length) {
        receivedRes.interests.forEach(interest => {
          const senderName = interest.senderProfile?.fullName || interest.senderProfileId?.fullName || 'Someone';
          const ts = new Date(interest.respondedAt || interest.createdAt || Date.now()).getTime();
          if (interest.status === 'pending') {
            activities.push({ type: 'interest_received', text: `${senderName} sent you an interest`, time: formatTimeAgo(interest.createdAt), ts, icon: Icons.Heart, color: 'text-rose-500', link: '/interests' });
          } else if (interest.status === 'accepted') {
            activities.push({ type: 'interest_accepted', text: `You connected with ${senderName}`, time: formatTimeAgo(interest.respondedAt || interest.createdAt), ts, icon: Icons.UserCheck, color: 'text-green-500', link: '/interests' });
          }
        });
      }

      const sentRes = await interestAPI.getSent({ page: 1, limit: 3, status: 'accepted' });
      if (sentRes.interests?.length) {
        sentRes.interests.forEach(interest => {
          const receiverName = interest.receiverProfile?.fullName || interest.receiverProfileId?.fullName || 'Someone';
          const ts = new Date(interest.respondedAt || interest.createdAt || Date.now()).getTime();
          activities.push({ type: 'interest_accepted_by', text: `${receiverName} accepted your interest`, time: formatTimeAgo(interest.respondedAt || interest.createdAt), ts, icon: Icons.HeartHandshake, color: 'text-emerald-500', link: '/interests' });
        });
      }

      activities.sort((a, b) => (b.ts || 0) - (a.ts || 0));
      if (activities.length > 0) {
        setRecentActivity(activities.slice(0, 5));
      } else {
        setRecentActivity([{ type: 'info', text: 'No recent activity yet', time: '', ts: 0, icon: Icons.Info, color: 'text-[var(--text-muted)]', link: '/search' }]);
      }
    } catch (err) {
      console.warn('Recent activity not available:', err?.message);
      setRecentActivity([{ type: 'info', text: 'Start exploring to see activity', time: '', ts: 0, icon: Icons.Search, color: 'text-[var(--text-muted)]', link: '/search' }]);
    }
  }, []);

  const loadSuggestedProfiles = useCallback(async () => {
    try {
      const response = await searchAPI.getSuggested(4);
      setSuggestedProfiles(response.profiles || []);
    } catch (err) {
      console.warn('Suggested profiles not available:', err?.message);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await refreshUser();
      const results = await Promise.allSettled([
        loadProfileCompletion(), loadInterestStats(), loadChatStats(),
        loadRecentActivity(), loadSuggestedProfiles(), loadShortlistCount(),
      ]);
      const errors = results.filter(r => r.status === 'rejected');
      if (errors.length > 0) console.warn('Some dashboard data failed:', errors);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load some dashboard data');
    } finally {
      setLoading(false);
    }
  }, [refreshUser, loadProfileCompletion, loadInterestStats, loadChatStats, loadRecentActivity, loadSuggestedProfiles, loadShortlistCount]);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  /* ---- derived values ---- */
  const completionPct = useMemo(() => {
    const pct = completionData.percentage || user?.completionPercentage || 0;
    return Math.min(100, Math.max(0, Math.round(pct)));
  }, [completionData, user]);

  const displayName  = useMemo(() => user?.fullName || user?.email?.split('@')[0] || 'User', [user]);
  const profileLink  = useMemo(() => (user?.profileId ? `/profile/${user.profileId}` : '/complete-profile'), [user]);
  const hasProfile   = useMemo(() => !!user?.profileId || completionPct > 0, [user, completionPct]);

  const statsCards = useMemo(() => [
    { label: 'Interests Received', value: stats.interestsReceived, icon: Icons.Heart,         color: 'bg-rose-500/10 text-rose-500',   link: '/interests', badge: stats.pendingInterests > 0 ? stats.pendingInterests : null },
    { label: 'Matches',            value: stats.matches,           icon: Icons.Users,         color: 'bg-green-500/10 text-green-500', link: '/interests' },
    { label: 'Messages',           value: stats.conversations,     icon: Icons.MessageSquare, color: 'bg-blue-500/10 text-blue-500',   link: '/chat',      badge: stats.unreadMessages > 0 ? stats.unreadMessages : null },
    { label: 'Profile Views',      value: stats.profileViews,      icon: Icons.Eye,           color: 'bg-purple-500/10 text-purple-500',link: profileLink },
  ], [stats, profileLink]);

  /* ---- loading state ---- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner-lg mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* ===== HEADER ===== */}
      <header>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome, <span className="text-gradient">{displayName}</span>
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </span>
              {premium && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                  <Icons.Crown size={12} />
                  Premium
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={loadDashboardData} disabled={loading} className="btn-secondary text-sm">
              <Icons.RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== ERROR BANNER ===== */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <Icons.AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={loadDashboardData} className="ml-auto btn-ghost text-red-400">Retry</button>
        </div>
      )}

      {/* ===== COMPLETE PROFILE PROMPT ===== */}
      {!hasProfile && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="p-3 bg-amber-500/20 rounded-xl text-amber-500">
            <Icons.UserCheck size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-500 text-lg">Complete Your Profile</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Add your basic details and photos to start appearing in search results and receiving matches.</p>
          </div>
          <Link to="/complete-profile" className="btn-primary sm:ml-auto whitespace-nowrap bg-amber-500 hover:bg-amber-600 border-none text-white shadow-lg shadow-amber-500/20">
            <Icons.Edit size={16} />
            <span>Complete Now</span>
          </Link>
        </div>
      )}

      {/* ===== STATS GRID ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => {
          const IconComponent = stat.icon;
          return (
            <Link key={i} to={stat.link} className="card p-4 hover:scale-[1.02] transition-all hover:shadow-lg border border-[var(--border-primary)] hover:border-[var(--border-secondary)]">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <IconComponent size={20} />
                </div>
                {stat.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-md shadow-red-500/20">
                    {stat.badge}
                  </span>
                )}
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold mb-1 text-[var(--text-primary)]">{stat.value}</p>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ===== PROFILE STRENGTH + MEMBERSHIP ===== */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Profile Strength */}
        <div className="lg:col-span-2 card p-6 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Icons.Activity size={18} className="text-[var(--accent-500)]" />
              Profile Strength
            </h3>
            {hasProfile && (
              <Link to={profileLink} className="text-xs font-medium text-[var(--accent-500)] hover:underline flex items-center gap-1">
                View Profile <Icons.ChevronRight size={12} />
              </Link>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Circular Progress */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Track background */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-[var(--surface-glass-active)]" />
                {/* Progress */}
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={completionPct < 50 ? '#ef4444' : completionPct < 80 ? '#f59e0b' : '#10b981'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${completionPct * 2.51} 251`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[var(--text-primary)]">{completionPct}%</span>
              </div>
            </div>

            <div className="flex-1 w-full">
              <p className="text-sm text-[var(--text-secondary)] mb-4 font-medium">
                {completionPct < 30 ? 'Your profile is incomplete. Add more details to get noticed.'
                  : completionPct < 80 ? 'Good start! Fill in the missing details to improve your matches.'
                  : 'Great job! Your profile is looking strong.'}
              </p>

              {completionData.details && Object.keys(completionData.details).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(completionData.details).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--surface-glass)] border border-[var(--border-subtle)]">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${value >= 100 ? 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : value > 0 ? 'bg-amber-500' : 'bg-gray-600'}`} />
                      <span className="text-xs text-[var(--text-secondary)] font-medium capitalize truncate flex-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`text-xs font-bold ${value >= 100 ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>{Math.round(value)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-[var(--border-primary)] flex justify-end">
             <Link to="/complete-profile" className="btn-secondary text-sm">
                <Icons.Edit size={14} />
                <span>Update Details</span>
             </Link>
          </div>
        </div>

        {/* Membership */}
        <div className="card p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-[var(--surface-glass-active)]">
               <Icons.Crown size={18} className="text-[var(--accent-500)]" />
            </div>
            <h4 className="font-bold text-lg">Membership</h4>
          </div>

          <div className={`p-4 rounded-xl mb-6 border ${premium ? 'bg-amber-500/10 border-amber-500/20' : 'bg-[var(--surface-glass)] border-[var(--border-primary)]'}`}>
            <div className="flex justify-between items-start">
               <div>
                  <p className={`font-bold text-lg ${premium ? 'text-amber-500' : 'text-[var(--text-primary)]'}`}>
                     {premium ? 'Premium Plan' : 'Free Plan'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                     {premium ? 'Unlimited access & visibility' : 'Upgrade to unlock all features'}
                  </p>
               </div>
               {premium ? <Icons.CheckCircle size={20} className="text-amber-500" /> : <Icons.Lock size={20} className="text-[var(--text-muted)]" />}
            </div>
          </div>

          <div className="space-y-4 mb-6 flex-1">
            {[
              { label: 'Interests Sent', value: stats.interestsSent, icon: Icons.Send },
              { label: 'Shortlisted',    value: stats.shortlistCount, icon: Icons.Bookmark },
              { label: 'Active Chats',   value: stats.conversations, icon: Icons.MessageCircle },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-[var(--surface-glass)] transition-colors">
                <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                   <item.icon size={14} />
                   <span>{item.label}</span>
                </div>
                <span className="font-bold text-[var(--text-primary)]">{item.value}</span>
              </div>
            ))}
          </div>

          {!premium && user?.role !== 'agency' && (
            <Link
              to="/pricing"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all"
            >
              <Icons.Zap size={16} className="fill-white" />
              <span>Upgrade Now</span>
            </Link>
          )}
        </div>
      </div>

      {/* ===== QUICK ACTIONS + RECENT ACTIVITY ===== */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Icons.Zap size={18} className="text-[var(--accent-500)]" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map(action => {
              const IconComponent = action.icon;
              return (
                <Link key={action.path} to={action.path} className="card p-4 flex flex-col items-center text-center gap-3 hover:border-[var(--accent-500)] hover:shadow-md transition-all group">
                  <div className={`p-3 rounded-full ${action.color} group-hover:scale-110 transition-transform`}>
                    <IconComponent size={20} />
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">{action.name}</h4>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Icons.Clock size={18} className="text-[var(--accent-500)]" />
            Recent Activity
          </h3>
          <div className="card p-2">
            <div className="space-y-1">
              {recentActivity.map((activity, i) => {
                const IconComponent = activity.icon || Icons.Bell;
                return (
                  <Link
                    key={i}
                    to={activity.link || '#'}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-glass)] transition-colors"
                  >
                    <div className={`p-2 rounded-full bg-[var(--surface-glass-active)] flex-shrink-0 ${activity.color || ''}`}>
                      <IconComponent size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate text-[var(--text-primary)] font-medium">{activity.text}</p>
                      {activity.time && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{activity.time}</p>}
                    </div>
                    <Icons.ChevronRight size={14} className="text-[var(--text-muted)]" />
                  </Link>
                );
              })}
            </div>
            {recentActivity.length > 0 && (
                <Link
                to="/notifications"
                className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--accent-500)] font-medium py-3 border-t border-[var(--border-primary)] mt-1"
                >
                <span>View All History</span>
                </Link>
            )}
          </div>
        </div>
      </div>

      {/* ===== SUGGESTED PROFILES ===== */}
      {suggestedProfiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Icons.Sparkles size={18} className="text-[var(--accent-500)]" />
              Suggested for You
            </h3>
            <Link to="/search" className="btn-secondary text-xs py-1.5 px-3">
              <span>View All</span>
              <Icons.ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestedProfiles.map(profile => {
              const photoUrl = profile.photos?.find(p => p.isProfile)?.url || profile.photos?.[0]?.url;
              const initial  = (profile.fullName || 'U').charAt(0).toUpperCase();
              return (
                <Link key={profile._id} to={`/profile/${profile.profileId || profile._id}`} className="card overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <div className="aspect-[3/4] relative">
                    {photoUrl ? (
                      <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--accent-500)]/20 to-[var(--accent-700)]/20 flex items-center justify-center">
                        <span className="text-4xl font-bold text-[var(--text-muted)]">{initial}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h4 className="text-white font-bold text-sm truncate">
                        {profile.fullName}{profile.age ? `, ${profile.age}` : ''}
                      </h4>
                      <p className="text-white/70 text-xs truncate mt-0.5 flex items-center gap-1">
                        <Icons.MapPin size={10} />
                        {profile.city || profile.country || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}