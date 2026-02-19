import React, { useEffect, useState, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Icons } from '../components/Icons';
import { notificationAPI, chatAPI } from '../services/api';
import { initializeSocket, socketEvents, disconnectSocket } from '../services/socket';

const formatBadge = (n) => (n > 99 ? '99+' : String(n));

export default function MainLayout() {
  const { user, token, logout, isAuthenticated, hasPremiumAccess } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isAgency = user?.role === 'agency';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  // For agency users show the agency dashboard and pages
  const navItems = isAgency
    ? [
        { path: '/agency', icon: Icons.Home, label: 'Agency' }, // agency dashboard
        { path: '/agency/profiles', icon: Icons.Users, label: 'Profiles' },
        { path: '/agency/payments', icon: Icons.CreditCard, label: 'Payments' },
        { path: '/chat', icon: Icons.MessageCircle, label: 'Messages' },
      ]
    : [
        { path: '/dashboard', icon: Icons.Home, label: 'Dashboard' },
        { path: '/search', icon: Icons.Search, label: 'Search' },
        { path: '/interests', icon: Icons.Heart, label: 'Interests' },
        { path: '/chat', icon: Icons.MessageCircle, label: 'Messages' },
        { path: '/shortlist', icon: Icons.Bookmark, label: 'Shortlist' },
      ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  const userInitial = (user?.fullName || user?.email || 'U').charAt(0).toUpperCase();
  const premium = hasPremiumAccess?.() === true;

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isAdmin && !location.pathname.startsWith('/admin')) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, location.pathname, navigate]);

  const refreshUnreadNotifications = useCallback(async () => {
    if (!isAuthenticated || isAdmin) return;
    try {
      const res = await notificationAPI.getUnreadCount();
      setUnreadNotifCount(res?.unreadCount || 0);
    } catch {
      // ignore
    }
  }, [isAuthenticated, isAdmin]);

  const refreshUnreadMessages = useCallback(async () => {
    if (!isAuthenticated || isAdmin) return;
    try {
      const res = await chatAPI.getUnreadCount();
      setUnreadMsgCount(res?.unreadCount || 0);
    } catch {
      // ignore
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    refreshUnreadNotifications();
    refreshUnreadMessages();
  }, [refreshUnreadNotifications, refreshUnreadMessages, location.pathname]);

  useEffect(() => {
    if (!isAuthenticated || !token || isAdmin) return;

    initializeSocket(token);

    const onMessageNotif = () => {
      setUnreadMsgCount((c) => c + 1);
      refreshUnreadMessages();
      refreshUnreadNotifications();
      window.dispatchEvent(new Event('chat:changed'));
    };

    const offMessageNotif = socketEvents.onMessageNotification?.(onMessageNotif) || (() => {});

    const t = setInterval(() => {
      refreshUnreadMessages();
      refreshUnreadNotifications();
    }, 30000);

    return () => {
      clearInterval(t);
      offMessageNotif();
      disconnectSocket();
    };
  }, [isAuthenticated, token, refreshUnreadMessages, refreshUnreadNotifications, isAdmin]);

  if (isAdmin && location.pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 bg-[var(--bg-secondary)]/80 backdrop-blur-xl border-b border-[var(--border-primary)]">
        <div className="h-full max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between">
          <Link to={isAgency ? '/agency' : '/dashboard'} className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center">
              <Icons.Heart size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold hidden sm:block">
              Matri<span className="text-[var(--accent-500)]">mony</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-primary)]">
            {navItems.map((item) => {
              const isMsgs = item.path === '/chat';
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] text-white shadow-lg'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass-hover)]'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                  {isMsgs && unreadMsgCount > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--accent-500)] text-white text-[10px] font-bold">
                      {formatBadge(unreadMsgCount)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-primary)] hover:bg-[var(--surface-glass-hover)] transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Icons.Sun size={16} className="text-amber-400" /> : <Icons.Moon size={16} />}
            </button>

            <Link
              to="/notifications"
              className="p-2 sm:p-2.5 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-primary)] hover:bg-[var(--surface-glass-hover)] transition-all relative"
              aria-label="Notifications"
            >
              <Icons.Bell size={16} />
              {unreadNotifCount > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--accent-500)] rounded-full" />
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--accent-500)] text-white text-[10px] font-bold flex items-center justify-center">
                    {formatBadge(unreadNotifCount)}
                  </span>
                </>
              )}
            </Link>

            {/* User Dropdown (Desktop) */}
            <div className="relative group hidden sm:block">
              <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--surface-glass)] transition-all">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                  {user?.photoUrl ? (
                    <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    userInitial
                  )}
                </div>
                <Icons.ChevronDown size={14} className="text-[var(--text-muted)] hidden sm:block" />
              </button>

              <div className="absolute right-0 top-full mt-2 w-56 p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-3 py-2 mb-2 border-b border-[var(--border-primary)]">
                  <p className="font-medium truncate">{user?.fullName || 'User'}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                  {isAgency && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-bold uppercase">
                      Agency
                    </span>
                  )}
                </div>

                {!isAgency && (
                  <Link
                    to="/profile/me"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--surface-glass)] transition-colors"
                  >
                    <Icons.User size={16} className="text-[var(--text-muted)]" />
                    <span className="text-sm">My Profile</span>
                  </Link>
                )}

                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--surface-glass)] transition-colors"
                >
                  <Icons.Settings size={16} className="text-[var(--text-muted)]" />
                  <span className="text-sm">Settings</span>
                </Link>

                {!premium && !isAgency && (
                  <Link
                    to="/pricing"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--surface-glass)] transition-colors"
                  >
                    <Icons.Crown size={16} className="text-amber-500" />
                    <span className="text-sm text-amber-500">Upgrade</span>
                  </Link>
                )}

                <div className="border-t border-[var(--border-primary)] mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                  >
                    <Icons.LogOut size={16} />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="md:hidden p-2 sm:p-2.5 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-primary)]"
              aria-label="Open menu"
            >
              <Icons.Menu size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 bg-[var(--bg-secondary)] border-l border-[var(--border-primary)] p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center">
                  <Icons.Heart size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold leading-tight">{user?.fullName || 'User'}</p>
                  <p className="text-xs text-[var(--text-muted)] leading-tight">
                    {isAgency ? 'Agency' : premium ? 'Premium' : 'Free'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-[var(--surface-glass)]"
                aria-label="Close menu"
              >
                <Icons.X size={18} />
              </button>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => {
                const isMsgs = item.path === '/chat';
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                      isActive(item.path)
                        ? 'border-[var(--accent-500)]/40 bg-[var(--accent-500)]/10'
                        : 'border-transparent hover:bg-[var(--surface-glass)]'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                    {isMsgs && unreadMsgCount > 0 && (
                      <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--accent-500)] text-white text-[10px] font-bold inline-flex items-center justify-center">
                        {formatBadge(unreadMsgCount)}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border-primary)] space-y-1">
              {!isAgency && (
                <Link
                  to="/profile/me"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--surface-glass)] transition-colors"
                >
                  <Icons.User size={18} />
                  <span className="text-sm font-medium">My Profile</span>
                </Link>
              )}
              <Link
                to="/settings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--surface-glass)] transition-colors"
              >
                <Icons.Settings size={18} />
                <span className="text-sm font-medium">Settings</span>
              </Link>
              <Link
                to="/notifications"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--surface-glass)] transition-colors"
              >
                <Icons.Bell size={18} />
                <span className="text-sm font-medium">Notifications</span>
                {unreadNotifCount > 0 && (
                  <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--accent-500)] text-white text-[10px] font-bold inline-flex items-center justify-center">
                    {formatBadge(unreadNotifCount)}
                  </span>
                )}
              </Link>
            </div>

            {!premium && !isAgency && (
              <Link to="/pricing" className="mt-4 btn-primary w-full justify-center">
                <Icons.Crown size={16} />
                <span>Upgrade</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="mt-3 btn-secondary w-full justify-center text-red-500 hover:bg-red-500/10"
            >
              <Icons.LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-14 sm:pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 md:pb-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-t border-[var(--border-primary)] md:hidden z-40 safe-area-bottom">
        <div className="flex items-center justify-around py-1.5 sm:py-2 px-1 sm:px-2">
          {navItems.map((item) => {
            const isMsgs = item.path === '/chat';
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all ${
                  isActive(item.path) ? 'text-[var(--accent-500)]' : 'text-[var(--text-muted)]'
                }`}
              >
                <div className="relative">
                  <item.icon size={20} />
                  {isMsgs && unreadMsgCount > 0 && (
                    <span className="absolute -top-2 -right-3 min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--accent-500)] text-white text-[9px] font-bold flex items-center justify-center">
                      {formatBadge(unreadMsgCount)}
                    </span>
                  )}
                </div>
                <span className="text-[9px] sm:text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}