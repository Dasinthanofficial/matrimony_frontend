// src/pages/DashboardPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // ✅ IMPORT TRANSLATION HOOK
import { Icons } from '../components/Icons';
import api, { interestAPI } from '../services/api';
import Toast from '../components/Toast';

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
  const navigate = useNavigate();
  const { t } = useTranslation(); // ✅ INITIALIZE TRANSLATION FUNCTION
  const premium = hasPremiumAccess();

  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [sendingInterest, setSendingInterest] = useState(null);

  const [completionData, setCompletionData] = useState({
    percentage: 0,
    details: {}
  });

  const [stats, setStats] = useState({
    interestsReceived: 0, interestsSent: 0, pendingInterests: 0,
    matches: 0, conversations: 0, unreadMessages: 0,
    profileViews: 0, shortlistCount: 0,
  });

  const [recentActivity,    setRecentActivity]    = useState([]);
  const [suggestedProfiles, setSuggestedProfiles] = useState([]);

  // Toast State
  const [toastState, setToastState] = useState({ open: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToastState({ open: true, message, type });
  const closeToast = () => setToastState(prev => ({ ...prev, open: false }));

  // ✅ MOVED QUICK ACTIONS INSIDE COMPONENT TO ACCESS t()
  const quickActions = useMemo(() => [
    { name: t('nav.search'),      path: '/search',    icon: Icons.Search,        color: 'bg-blue-500/10 text-blue-500'  },
    { name: t('nav.matches'),     path: '/interests', icon: Icons.Heart,         color: 'bg-rose-500/10 text-rose-500'  },
    { name: t('matches.shortlist'),path: '/shortlist', icon: Icons.Bookmark,      color: 'bg-amber-500/10 text-amber-500'},
    { name: t('nav.messages'),    path: '/chat',      icon: Icons.MessageSquare, color: 'bg-green-500/10 text-green-500'},
  ], [t]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await refreshUser();
      
      // 1. Load Profile Completion
      try {
        const compRes = await api.profile.getCompletion();
        setCompletionData({ percentage: compRes.percentage || 0, details: compRes.details || {} });
        
        const myProfileRes = await api.profile.getMyProfile();
        if (myProfileRes.profile) {
          setStats(prev => ({ ...prev, profileViews: myProfileRes.profile.profileViews || 0 }));
        }
      } catch (e) { 
        if (e.response?.status !== 404) {
          console.warn("Completion load failed", e); 
        }
      }

      // 2. Load Suggested
      try {
        const suggRes = await api.search.getSuggested(4);
        setSuggestedProfiles(suggRes.profiles || []);
      } catch (e) { console.warn("Suggested load failed", e); }

      // 3. Load Stats (Parallel)
      const [receivedRes, sentRes, matchesRes, chatRes, unreadRes, shortlistRes] = await Promise.all([
        api.interest.getReceived({ page: 1, limit: 1 }).catch(()=>({})),
        api.interest.getSent({ page: 1, limit: 1 }).catch(()=>({})),
        api.interest.getAccepted({ page: 1, limit: 1 }).catch(()=>({})),
        api.chat.getConversations({ page: 1, limit: 1 }).catch(()=>({})),
        api.chat.getUnreadCount().catch(()=>({ unreadCount: 0 })),
        api.interest.getShortlist({ page: 1, limit: 1 }).catch(()=>({})),
      ]);

      setStats(prev => ({
        ...prev,
        interestsReceived: receivedRes.pagination?.total || 0,
        interestsSent: sentRes.pagination?.total || 0,
        matches: matchesRes.pagination?.total || 0,
        conversations: chatRes.conversations?.length || 0,
        unreadMessages: unreadRes.unreadCount || 0,
        shortlistCount: shortlistRes.pagination?.total || 0
      }));

      setRecentActivity([]); 

    } catch (err) {
      console.error('Dashboard load error:', err);
      if (err.response?.status !== 404) {
        setError(t('errors.unknown'));
        showToast(t('errors.unknown'), 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [refreshUser, t]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleConnect = async (e, profileId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profileId) return;
    setSendingInterest(profileId);
    try {
      await interestAPI.sendInterest(profileId, "Hi, I'd like to connect!");
      setSuggestedProfiles(prev => prev.filter(p => (p.userId !== profileId && p.id !== profileId)));
      showToast('Interest sent successfully!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "";
      if (msg.toLowerCase().includes('already')) {
        showToast('You have already sent an interest.', 'info');
      } else {
        showToast(t('errors.unknown'), 'error');
      }
    } finally {
      setSendingInterest(null);
    }
  };

  const handleShortlist = async (e, profileId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await interestAPI.addToShortlist(profileId);
      showToast('Profile added to your shortlist!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "";
      if (msg.toLowerCase().includes('already')) {
        showToast('This profile is already in your shortlist.', 'info');
      } else {
        console.error(err);
        showToast(t('errors.unknown'), 'error');
      }
    }
  };

  const completionPct = useMemo(() => {
    const pct = completionData.percentage || user?.completionPercentage || 0;
    return Math.min(100, Math.max(0, Math.round(pct)));
  }, [completionData, user]);

  const displayName  = useMemo(() => user?.fullName || user?.email?.split('@')[0] || 'User', [user]);
  const profileLink  = useMemo(() => (user?.profileId ? `/profile/${user.profileId}` : '/complete-profile'), [user]);

  // ✅ STATS TRANSLATIONS APPLIED HERE
  const statsCards = useMemo(() => [
    { label: t('nav.matches'), value: stats.interestsReceived, icon: Icons.Heart, color: 'bg-rose-500/10 text-rose-500', link: '/interests' },
    { label: t('matches.title'), value: stats.matches, icon: Icons.Users, color: 'bg-green-500/10 text-green-500', link: '/interests' },
    { label: t('nav.messages'), value: stats.conversations, icon: Icons.MessageSquare, color: 'bg-blue-500/10 text-blue-500', link: '/chat', badge: stats.unreadMessages },
    { label: t('common.view'), value: stats.profileViews, icon: Icons.Eye, color: 'bg-purple-500/10 text-purple-500', link: profileLink },
  ], [stats, profileLink, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <Icons.Loader className="animate-spin text-[var(--accent-500)]" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full pb-20 p-4 lg:p-6 max-w-[1600px] mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {/* ✅ Welcome Translated */}
            {t('auth.welcomeBack')}, <span className="text-gradient">{displayName}</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="badge-success flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {t('chat.online')}
            </span>
            {premium && (
              <span className="badge-warning flex items-center gap-1">
                <Icons.Crown size={12} /> {t('subscription.premiumPlan')}
              </span>
            )}
          </div>
        </div>
        <button onClick={loadDashboardData} className="btn-secondary self-start md:self-auto">
          <Icons.RefreshCw size={16} /> {t('common.retry').replace('Retry', 'Refresh')}
        </button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {statsCards.map((stat, i) => (
          <Link key={i} to={stat.link} className="card p-4 hover:border-[var(--accent-500)] transition-colors relative group">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              {stat.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {stat.badge}
                </span>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-[var(--bg-secondary)]" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="var(--accent-500)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${completionPct * 2.51} 251`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{completionPct}%</span>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              {/* ✅ Translation added here */}
              <h3 className="font-bold text-lg mb-2">{t('dashboard.profileStrength')}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                {completionPct < 50 ? t('dashboard.completeYourProfile') : "Your profile is looking great! Keep it updated."}
              </p>
              <Link to="/complete-profile" className="btn-secondary inline-flex">
                <Icons.Edit size={16} className="mr-2" /> {t('profile.editTitle')}
              </Link>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {quickActions.map(action => (
                <Link key={action.path} to={action.path} className="card p-4 flex flex-col items-center justify-center gap-3 hover:bg-[var(--surface-glass-active)] transition-colors text-center h-28">
                  <div className={`p-2.5 rounded-full ${action.color}`}>
                    <action.icon size={20} />
                  </div>
                  <span className="text-xs font-semibold">{action.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {suggestedProfiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                {/* ✅ Suggested profiles heading */}
                <h3 className="label mb-0">{t('dashboard.recentMatches')}</h3>
                <Link to="/search" className="text-xs font-bold text-[var(--accent-500)]">{t('common.view')} All</Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {suggestedProfiles.map(profile => {
                  const photoUrl = profile.photos?.find(p => p.isProfile)?.url || profile.photos?.[0]?.url;
                  const profileId = profile.userId || profile.id;

                  return (
                    <div key={profile._id || profileId} className="card p-0 overflow-hidden flex flex-col h-full group bg-[var(--surface-glass)] border border-[var(--border-subtle)]">
                      <Link to={`/profile/${profile.profileId || profile._id || profileId}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-900">
                        {photoUrl ? (
                          <img src={photoUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/20">
                            {(profile.fullName?.[0] || 'U')}
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-90" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h4 className="text-white font-bold text-sm truncate">
                            {profile.fullName}, {profile.age}
                          </h4>
                          <div className="flex items-center gap-1 text-white/70 text-xs mt-0.5 truncate">
                            <Icons.MapPin size={10} />
                            <span>{profile.city || profile.country || 'Unknown'}</span>
                          </div>
                          
                          {!premium && profile.occupation && (
                             <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-1.5">
                               <Icons.Lock size={8} />
                               <span>Upgrade to see info</span>
                             </div>
                          )}
                        </div>
                      </Link>

                      <div className="p-2 flex gap-2 bg-[var(--surface-glass)] border-t border-[var(--border-subtle)] mt-auto">
                        <button 
                          onClick={(e) => handleShortlist(e, profileId)}
                          className="flex-1 btn-secondary py-1.5 px-0 h-8 justify-center min-w-0"
                          title={t('matches.shortlist')}
                        >
                          <Icons.Bookmark size={14} />
                          <span className="hidden xl:inline ml-1 text-[10px] font-bold truncate">{t('common.save')}</span>
                        </button>
                        
                        <button 
                          onClick={(e) => handleConnect(e, profileId)}
                          disabled={sendingInterest === profileId}
                          className="flex-1 btn-primary py-1.5 px-0 h-8 justify-center min-w-0"
                          title={t('matches.request')}
                        >
                          {sendingInterest === profileId ? (
                            <Icons.Loader size={14} className="animate-spin" />
                          ) : (
                            <Icons.Heart size={14} />
                          )}
                          <span className="hidden xl:inline ml-1 text-[10px] font-bold truncate">Connect</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="card p-6 bg-gradient-to-br from-[var(--surface-glass)] to-[var(--surface-glass-active)]">
            <h3 className="font-bold mb-2">{t('dashboard.upgradeToPremium')}</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Get 3x more matches and view contact details.
            </p>
            <Link to="/pricing" className="btn-primary w-full justify-center">
              <Icons.Zap size={16} className="mr-2" />
              {t('subscription.upgrade')}
            </Link>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="label mb-0">Recent Visitors</h3>
              <Link to="/visitors" className="text-xs font-bold text-[var(--accent-500)]">{t('common.view')} All</Link>
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              See who viewed your profile recently.
            </div>
          </div>
        </div>
      </div>

      <Toast
        open={toastState.open}
        message={toastState.message}
        type={toastState.type}
        onClose={closeToast}
      />
    </div>
  );
}