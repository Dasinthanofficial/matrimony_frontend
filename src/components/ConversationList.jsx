import React from 'react';
import { Icons } from './Icons';

const photoUrlFromProfile = (profile) =>
  profile?.photoUrl ||
  profile?.photos?.find?.((p) => p?.isProfile)?.url ||
  profile?.photos?.[0]?.url ||
  null;

const getUnreadForUser = (conv, userId) => {
  if (!conv) return 0;
  if (typeof conv.unreadForMe === 'number') return conv.unreadForMe;

  const uc = conv.unreadCount;
  if (typeof uc === 'number') return uc;
  if (!userId || !uc) return 0;

  if (typeof uc.get === 'function') return Number(uc.get(userId) || 0);
  if (typeof uc === 'object') return Number(uc[userId] || 0);

  return 0;
};

const timeLabel = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function ConversationList({
  conversations = [],
  selectedId,
  onSelect,
  loading,
  currentUserId,
}) {
  if (loading) {
    return <div className="p-4 text-sm text-[var(--text-muted)]">Loading conversations...</div>;
  }

  if (!conversations.length) {
    return (
      <div className="p-6 text-center">
        <div className="icon-box-sm mx-auto mb-3 opacity-40">
          <Icons.MessageCircle size={18} />
        </div>
        <p className="text-sm text-[var(--text-muted)]">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-2">
      {conversations.map((conv) => {
        const isSelected = conv?._id === selectedId;
        const other = conv?.otherUser || null;

        const otherName =
          other?.fullName ||
          other?.name ||
          other?.profileId ||
          other?.email ||
          'User';

        const otherPhoto = photoUrlFromProfile(other);

        const lastText = conv?.lastMessage?.content || conv?.lastMessage?.text || '';
        const lastTs = conv?.lastMessage?.timestamp || conv?.updatedAt || conv?.createdAt;

        const unread = getUnreadForUser(conv, currentUserId);

        return (
          <button
            key={conv._id}
            type="button"
            onClick={() => onSelect?.(conv)}
            className={`w-full text-left rounded-xl p-3 border transition-all ${
              isSelected
                ? 'border-[var(--accent-500)]/40 bg-[var(--accent-500)]/5'
                : 'border-[var(--border-primary)] hover:bg-[var(--surface-glass)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-primary)] overflow-hidden flex items-center justify-center">
                {otherPhoto ? (
                  <img src={otherPhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-[var(--text-muted)]">
                    {String(otherName).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold truncate">{otherName}</p>
                  <div className="flex items-center gap-2">
                    {lastTs && <span className="text-[10px] text-[var(--text-muted)]">{timeLabel(lastTs)}</span>}
                    {unread > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--accent-500)] text-white text-[10px] font-bold inline-flex items-center justify-center">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{lastText || 'Say hello 👋'}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}