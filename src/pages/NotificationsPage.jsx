// src/pages/NotificationsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { notificationAPI } from '../services/api';

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(null); // global unread from server
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const unreadCountLocal = useMemo(() => items.filter((n) => !n.read).length, [items]);
  const unreadToShow = Number.isFinite(unreadCount) ? unreadCount : unreadCountLocal;

  const getIcon = (type) => {
    switch (type) {
      case 'interest_received':
      case 'interest_accepted':
      case 'interest_declined':
        return Icons.Heart;
      case 'new_message':
        return Icons.MessageCircle;
      case 'match':
        return Icons.Users;
      case 'subscription':
        return Icons.Crown;
      case 'system':
      default:
        return Icons.Bell;
    }
  };

  const notifyChanged = () => {
    window.dispatchEvent(new Event('notifications:changed'));
  };

  const load = async (pageOverride = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationAPI.getNotifications({ page: pageOverride, limit: 20 });

      const list = res.notifications || [];
      setItems(list);
      setPages(res.pagination?.pages || 1);

      // ✅ uses new backend response field (global unread count)
      if (typeof res.unreadCount === 'number') setUnreadCount(res.unreadCount);
      else setUnreadCount(list.filter((n) => !n.read).length);

      // keep header badges in sync
      notifyChanged();
    } catch (e) {
      setError(e?.message || 'Failed to load notifications');
      setItems([]);
      setPages(1);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const markRead = async (id) => {
    if (!id) return;
    setBusyId(id);
    try {
      // ✅ supports both old + new api.js (we added both)
      const res = (await notificationAPI.markAsRead?.(id)) || (await notificationAPI.markRead(id));

      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );

      if (res && typeof res.unreadCount === 'number') setUnreadCount(res.unreadCount);
      else setUnreadCount((c) => (Number.isFinite(c) ? Math.max(0, c - 1) : c));

      notifyChanged();
    } catch (e) {
      alert(e?.message || 'Failed to mark as read');
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    setBusyId('all');
    try {
      const res = (await notificationAPI.markAllAsRead?.()) || (await notificationAPI.markAllRead());

      setItems((prev) => prev.map((n) => ({ ...n, read: true, readAt: n.readAt || new Date().toISOString() })));
      setUnreadCount(0);

      if (res && typeof res.unreadCount === 'number') setUnreadCount(res.unreadCount);

      notifyChanged();
    } catch (e) {
      alert(e?.message || 'Failed to mark all as read');
    } finally {
      setBusyId(null);
    }
  };

  const removeOne = async (id) => {
    if (!id) return;
    setBusyId(id);
    try {
      const wasUnread = items.find((n) => n._id === id)?.read === false;
      const res = await notificationAPI.deleteNotification(id);

      setItems((prev) => prev.filter((n) => n._id !== id));

      if (res && typeof res.unreadCount === 'number') setUnreadCount(res.unreadCount);
      else if (wasUnread) setUnreadCount((c) => (Number.isFinite(c) ? Math.max(0, c - 1) : c));

      notifyChanged();
    } catch (e) {
      alert(e?.message || 'Failed to delete notification');
    } finally {
      setBusyId(null);
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Delete all notifications?')) return;
    setBusyId('clear');
    try {
      const res = await notificationAPI.deleteAll();
      setItems([]);
      setPages(1);
      setUnreadCount(res && typeof res.unreadCount === 'number' ? res.unreadCount : 0);
      notifyChanged();
    } catch (e) {
      alert(e?.message || 'Failed to clear notifications');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="icon-box-md icon-box-accent">
              <Icons.Bell size={20} />
            </div>
            <div>
              <h1 className="heading-md">Notifications</h1>
              <p className="text-sm text-[var(--text-muted)]">
                {unreadToShow > 0 ? `${unreadToShow} unread` : 'All caught up'}
              </p>
            </div>
          </div>

          <Link to="/dashboard" className="btn-secondary">
            <Icons.ChevronLeft size={16} />
            <span>Back</span>
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => load(page)} disabled={loading} className="btn-secondary">
            <Icons.RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={markAllRead}
            disabled={loading || items.length === 0 || unreadToShow === 0 || busyId === 'all'}
            className="btn-secondary"
          >
            {busyId === 'all' ? <span className="spinner-sm" /> : <Icons.Check size={16} />}
            Mark all read
          </button>

          <button
            onClick={clearAll}
            disabled={loading || items.length === 0 || busyId === 'clear'}
            className="btn-ghost text-red-500 hover:bg-red-500/10"
          >
            {busyId === 'clear' ? <span className="spinner-sm" /> : <Icons.Trash2 size={16} />}
            Clear all
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">{error}</div>
      )}

      {loading ? (
        <div className="card p-12 text-center">
          <div className="spinner-lg mx-auto mb-3" />
          <p className="text-sm text-[var(--text-muted)]">Loading notifications...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="icon-box-xl mx-auto mb-4 opacity-50">
            <Icons.Bell size={32} />
          </div>
          <h3 className="heading-sm mb-2">No Notifications</h3>
          <p className="text-[var(--text-secondary)]">You're all caught up!</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((n) => {
              const IconComponent = getIcon(n.type);
              const isBusy = busyId === n._id;

              return (
                <div
                  key={n._id}
                  className={`card p-4 flex items-start gap-4 ${!n.read ? 'border-[var(--accent-500)]/30' : ''}`}
                >
                  <div className={`icon-box-sm ${!n.read ? 'icon-box-accent' : ''}`}>
                    <IconComponent size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-medium' : 'text-[var(--text-secondary)]'}`}>
                      {n.title ? <span className="font-semibold">{n.title}: </span> : null}
                      {n.message || 'Notification'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{formatTimeAgo(n.createdAt)}</p>

                    {n.metadata && Object.keys(n.metadata).length > 0 && (
                      <p className="text-[10px] text-[var(--text-muted)] mt-2 truncate">
                        Ref: {JSON.stringify(n.metadata)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    {!n.read && (
                      <button
                        onClick={() => markRead(n._id)}
                        disabled={isBusy}
                        className="btn-secondary py-2 px-3 text-xs"
                      >
                        {isBusy ? <span className="spinner-sm" /> : <Icons.Check size={14} />}
                        Read
                      </button>
                    )}

                    <button
                      onClick={() => removeOne(n._id)}
                      disabled={isBusy}
                      className="btn-ghost text-red-500 hover:bg-red-500/10 py-2 px-3 text-xs"
                      title="Delete"
                    >
                      {isBusy ? <span className="spinner-sm" /> : <Icons.Trash2 size={14} />}
                      Delete
                    </button>

                    {!n.read && <div className="w-2 h-2 rounded-full bg-[var(--accent-500)]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button className="btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <Icons.ChevronLeft size={16} />
                Prev
              </button>

              <span className="text-sm text-[var(--text-muted)] px-2">
                Page {page} / {pages}
              </span>

              <button
                className="btn-secondary"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
              >
                Next
                <Icons.ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}