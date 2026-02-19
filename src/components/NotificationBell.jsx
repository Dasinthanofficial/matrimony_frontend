import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { Icons } from './Icons';

function timeAgo(dateString) {
  const d = new Date(dateString);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ FIX: Track server-provided global unread count
  const [serverUnread, setServerUnread] = useState(null);

  const rootRef = useRef(null);

  // ✅ FIX: Prefer server unread count, fallback to local calculation
  const unreadCount = useMemo(() => {
    if (typeof serverUnread === 'number') return serverUnread;
    return (items || []).reduce((acc, n) => acc + (n?.read ? 0 : 1), 0);
  }, [items, serverUnread]);

  const loadLatest = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getNotifications({ limit: 10 });
      setItems(res?.notifications || []);

      // ✅ FIX: Store server-provided unread count (global, not just from 10 items)
      if (typeof res?.unreadCount === 'number') {
        setServerUnread(res.unreadCount);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await notificationAPI.markAllAsRead();
      setItems((prev) => (prev || []).map((n) => ({ ...n, read: true })));

      // ✅ FIX: Update server unread count
      if (res && typeof res.unreadCount === 'number') {
        setServerUnread(res.unreadCount);
      } else {
        setServerUnread(0);
      }
    } catch {
      /* ignore */
    }
  };

  const markOneRead = async (id) => {
    try {
      const res = await notificationAPI.markAsRead(id);
      setItems((prev) => (prev || []).map((n) => (n._id === id ? { ...n, read: true } : n)));

      // ✅ FIX: Update server unread count
      if (res && typeof res.unreadCount === 'number') {
        setServerUnread(res.unreadCount);
      } else if (typeof serverUnread === 'number') {
        setServerUnread((c) => Math.max(0, c - 1));
      }
    } catch {
      /* ignore */
    }
  };

  // ✅ Load on mount + poll every 30s
  useEffect(() => {
    loadLatest();
    const t = setInterval(loadLatest, 30000);
    return () => clearInterval(t);
  }, []);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // ✅ FIX: Only reload when opening (don't auto-mark-all-read on open)
  useEffect(() => {
    if (open) {
      loadLatest();
    }
  }, [open]);

  const onClickNotification = async (n) => {
    if (n?._id && !n?.read) await markOneRead(n._id);
    const link = n?.actionUrl || null;

    setOpen(false);
    if (link) navigate(link);
    else navigate('/notifications');
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="relative btn-icon"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <Icons.Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] max-w-[90vw] rounded-2xl border border-white/10 bg-[var(--bg-secondary)] shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="font-semibold">Notifications</div>
            <Link
              to="/notifications"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>

          <div className="max-h-[420px] overflow-auto">
            {loading && items.length === 0 && (
              <div className="p-4 text-sm text-[var(--text-muted)] flex items-center gap-2">
                <Icons.Loader className="animate-spin" size={16} />
                Loading…
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="p-4 text-sm text-[var(--text-muted)]">No notifications yet.</div>
            )}

            {items.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => onClickNotification(n)}
                className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-2 w-2 h-2 rounded-full ${n?.read ? 'bg-transparent' : 'bg-blue-500'}`}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {n?.title || n?.type || 'Notification'}
                    </div>
                    {n?.message && (
                      <div className="text-sm text-[var(--text-muted)] mt-0.5 line-clamp-2">
                        {n.message}
                      </div>
                    )}
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      {n?.createdAt ? timeAgo(n.createdAt) : ''}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="px-4 py-3">
            <button className="btn-secondary w-full" onClick={markAllRead}>
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}