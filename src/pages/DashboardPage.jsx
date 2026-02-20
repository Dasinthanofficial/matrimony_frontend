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
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="text-center">
          <div className="spinner-lg mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-8">
      {/* ===== HEADER ===== */}
      <header className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              Welcome, <span className="text-gradient">{displayName}</span>
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
                Online
              </span>
              {premium && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                  <Icons.Crown size={12} />
                  Premium
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button 
              onClick={loadDashboardData} 
              disabled={loading} 
              className="btn-secondary text-sm h-10 px-4"
            >
              <Icons.RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== ERROR BANNER ===== */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <Icons.AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={loadDashboardData} className="ml-auto btn-ghost text-red-400 hover:bg-red-500/20">Retry</button>
        </div>
      )}

      {/* ===== COMPLETE PROFILE PROMPT (Full Width) ===== */}
      {!hasProfile && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 flex flex-col md:flex-row items-center gap-6 shadow-lg shadow-amber-500/5">
          <div className="p-4 bg-amber-500/20 rounded-full text-amber-500 flex-shrink-0">
            <Icons.UserCheck size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-amber-500 text-xl">Complete Your Profile</h3>
            <p className="text-sm md:text-base text-[var(--text-secondary)] mt-2 max-w-2xl">
              Add your basic details and photos to start appearing in search results and receiving matches. 
              Profiles with photos get 10x more attention.
            </p>
          </div>
          <Link 
            to="/complete-profile" 
            className="btn-primary whitespace-nowrap bg-amber-500 hover:bg-amber-600 border-none text-white shadow-lg shadow-amber-500/20 px-8 py-3"
          >
            <Icons.Edit size={18} />
            <span>Complete Now</span>
          </Link>
        </div>
      )}

      {/* ===== STATS GRID (Full Width) ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statsCards.map((stat, i) => {
          const IconComponent = stat.icon;
          return (
            <Link key={i} to={stat.link} className="card p-5 hover:scale-[1.02] transition-all hover:shadow-xl hover:shadow-[var(--accent-500)]/5 border border-[var(--border-primary)] hover:border-[var(--accent-500)]/30 group relative overflow-hidden">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.color} group-hover:scale-110 transition-transform`}>
                    <IconComponent size={24} />
                  </div>
                  {stat.badge && (
                    <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-md shadow-red-500/20 animate-pulse">
                      {stat.badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-3xl font-bold mb-1 text-[var(--text-primary)] group-hover:text-[var(--accent-500)] transition-colors">
                    {stat.value}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">{stat.label}</p>
                </div>
              </div>
              {/* Background Decoration */}
              <div className="absolute -right-4 -bottom-4 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none">
                <IconComponent size={100} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ===== MAIN DASHBOARD LAYOUT (Left Content + Right Sidebar) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        
        {/* === LEFT COLUMN (Main Content) === */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6 md:space-y-8">
          
          {/* 1. Profile Strength */}
          <div className="card p-6 md:p-8 border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h3 className="font-bold text-lg md:text-xl flex items-center gap-2">
                <Icons.Activity size={20} className="text-[var(--accent-500)]" />
                Profile Strength
              </h3>
              {hasProfile && (
                <Link to={profileLink} className="btn-ghost text-xs md:text-sm font-medium text-[var(--accent-500)] gap-1 px-3">
                  View Profile <Icons.ChevronRight size={14} />
                </Link>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
              {/* Circular Progress */}
              <div className="relative w-36 h-36 md:w-44 md:h-44 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="6" className="text-[var(--surface-glass-active)]" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={completionPct < 50 ? '#ef4444' : completionPct < 80 ? '#f59e0b' : '#10b981'}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${completionPct * 2.51} 251`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">{completionPct}%</span>
                  <span className="text-[10px] md:text-xs text-[var(--text-muted)] uppercase tracking-wide mt-1">Complete</span>
                </div>
              </div>

              {/* Strength Details */}
              <div className="flex-1 w-full">
                <p className="text-sm md:text-base text-[var(--text-secondary)] mb-6 font-medium text-center md:text-left">
                  {completionPct < 30 ? 'Your profile is just starting. Complete basic details to get noticed.'
                    : completionPct < 80 ? 'Good progress! Add more specific details to find better matches.'
                    : 'Excellent! Your profile is highly visible and attractive to matches.'}
                </p>

                {completionData.details && Object.keys(completionData.details).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {Object.entries(completionData.details).slice(0, 6).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-subtle)] hover:bg-[var(--surface-glass-active)] transition-colors">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors duration-500 ${value >= 100 ? 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : value > 0 ? 'bg-amber-500' : 'bg-gray-600'}`} />
                        <span className="text-xs md:text-sm text-[var(--text-primary)] font-medium capitalize truncate flex-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className={`text-xs font-bold ${value >= 100 ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>{Math.round(value)}%</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 flex justify-center md:justify-start">
                  <Link to="/complete-profile" className="btn-secondary text-sm">
                    <Icons.Edit size={14} />
                    <span>Update Details</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Quick Actions */}
          <div>
            <h3 className="font-bold text-lg md:text-xl mb-4 flex items-center gap-2">
              <Icons.Zap size={20} className="text-[var(--accent-500)]" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map(action => {
                const IconComponent = action.icon;
                return (
                  <Link key={action.path} to={action.path} className="card p-5 flex flex-col items-center justify-center text-center gap-4 hover:border-[var(--accent-500)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group h-32 md:h-36">
                    <div className={`p-3.5 rounded-full ${action.color} group-hover:scale-110 transition-transform`}>
                      <IconComponent size={24} />
                    </div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">{action.name}</h4>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 3. Suggested Profiles */}
          {suggestedProfiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg md:text-xl flex items-center gap-2">
                  <Icons.Sparkles size={20} className="text-[var(--accent-500)]" />
                  Suggested for You
                </h3>
                <Link to="/search" className="btn-ghost text-xs md:text-sm text-[var(--accent-500)] gap-1 px-3">
                  View All <Icons.ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {suggestedProfiles.map(profile => {
                  const photoUrl = profile.photos?.find(p => p.isProfile)?.url || profile.photos?.[0]?.url;
                  const initial  = (profile.fullName || 'U').charAt(0).toUpperCase();
                  return (
                    <Link key={profile._id} to={`/profile/${profile.profileId || profile._id}`} className="card overflow-hidden group hover:-translate-y-1 transition-transform duration-300 shadow-md hover:shadow-xl">
                      <div className="aspect-[3/4] relative">
                        {photoUrl ? (
                          <img src={photoUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[var(--surface-glass)] to-[var(--surface-glass-active)] flex items-center justify-center">
                            <span className="text-4xl font-bold text-[var(--text-muted)]">{initial}</span>
                          </div>
                        )}
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                          <h4 className="text-white font-bold text-sm md:text-base truncate">
                            {profile.fullName}{profile.age ? `, ${profile.age}` : ''}
                          </h4>
                          <p className="text-white/80 text-xs truncate mt-1 flex items-center gap-1.5">
                            <Icons.MapPin size={12} />
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

        {/* === RIGHT COLUMN (Sidebar) === */}
        <div className="flex flex-col gap-6 md:gap-8 h-full">
          
          {/* 1. Membership Card */}
          <div className="card p-6 flex flex-col h-auto min-h-[300px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-500">
                 <Icons.Crown size={22} />
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

            <div className="space-y-3 mb-6 flex-1">
              {[
                { label: 'Interests Sent', value: stats.interestsSent, icon: Icons.Send },
                { label: 'Shortlisted',    value: stats.shortlistCount, icon: Icons.Bookmark },
                { label: 'Active Chats',   value: stats.conversations, icon: Icons.MessageCircle },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center text-sm p-2.5 rounded-lg hover:bg-[var(--surface-glass)] transition-colors">
                  <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                     <item.icon size={16} />
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

          {/* 2. Recent Activity - Fills remaining height on Desktop */}
          <div className="card p-6 flex flex-col flex-1">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Icons.Clock size={20} className="text-[var(--accent-500)]" />
              Recent Activity
            </h3>
            
            <div className="flex-1 space-y-4">
              {recentActivity.map((activity, i) => {
                const IconComponent = activity.icon || Icons.Bell;
                return (
                  <Link
                    key={i}
                    to={activity.link || '#'}
                    className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-[var(--surface-glass)] transition-all group"
                  >
                    <div className={`mt-0.5 p-2 rounded-full bg-[var(--surface-glass-active)] flex-shrink-0 ${activity.color || ''}`}>
                      <IconComponent size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-primary)] font-medium leading-tight group-hover:text-[var(--accent-500)] transition-colors line-clamp-2">
                        {activity.text}
                      </p>
                      {activity.time && <p className="text-[11px] text-[var(--text-muted)] mt-1.5 flex items-center gap-1">
                        <Icons.Clock size={10} /> {activity.time}
                      </p>}
                    </div>
                  </Link>
                );
              })}
            </div>

            {recentActivity.length > 0 && (
              <Link
                to="/notifications"
                className="mt-4 pt-4 border-t border-[var(--border-primary)] flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--accent-500)] font-medium transition-colors"
              >
                <span>View Full History</span>
                <Icons.ArrowRight size={12} />
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}