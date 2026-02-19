// ===== FILE: ./src/components/InterestCard.jsx =====
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from './Icons';

const cx = (...parts) => parts.filter(Boolean).join(' ');

export default function InterestCard({ interest, onAction, loading }) {
  const navigate = useNavigate();

  const currentUserId = interest.currentUserId;

  const senderUserId = interest.senderId?._id || interest.senderId;
  const receiverUserId = interest.receiverId?._id || interest.receiverId;

  const isOutgoing = senderUserId?.toString() === currentUserId?.toString();

  const otherProfile = isOutgoing ? interest.receiverProfile : interest.senderProfile;
  const otherUserId = isOutgoing ? receiverUserId : senderUserId;

  const userName = otherProfile?.fullName || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  const photoUrl =
    otherProfile?.photos?.find((p) => p.isProfile)?.url ||
    otherProfile?.photos?.[0]?.url ||
    null;

  const profileRouteId = otherProfile?.profileId || otherProfile?._id;

  const statusStyles = {
    pending:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    accepted:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    declined:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    blocked:
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    withdrawn:
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={userName}
                className="w-14 h-14 rounded-xl object-cover border border-[var(--border-subtle)] shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[var(--surface-glass)] flex items-center justify-center text-[var(--text-primary)] text-xl font-bold border border-[var(--border-subtle)]">
                {userInitial}
              </div>
            )}

            {interest.status === 'accepted' && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[var(--bg-primary)] flex items-center justify-center text-white shadow-sm">
                <Icons.Check size={10} strokeWidth={3} />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {isOutgoing ? 'Sent To' : 'Received From'}
              </span>
              <span className="text-[var(--text-muted)]">•</span>
              <span className="text-[10px] font-medium text-[var(--text-muted)]">
                {formatDate(interest.createdAt)}
              </span>
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{userName}</h3>

            {otherProfile?.occupation && (
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{otherProfile.occupation}</p>
            )}
          </div>
        </div>

        <span
          className={cx(
            'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border',
            statusStyles[interest.status] || statusStyles.pending
          )}
        >
          {interest.status}
        </span>
      </div>

      {interest.message && (
        <div className="bg-[var(--surface-glass)] p-4 rounded-xl mb-6 relative">
          <Icons.MessageSquare size={14} className="absolute top-4 left-4 text-[var(--text-muted)] opacity-50" />
          <p className="text-sm text-[var(--text-secondary)] italic pl-6 leading-relaxed">
            "{interest.message}"
          </p>
        </div>
      )}

      <div className="pt-4 border-t border-[var(--border-subtle)] flex gap-3">
        {interest.status === 'pending' && !isOutgoing && (
          <>
            <button
              onClick={() => onAction('accept', interest._id)}
              disabled={loading}
              className="btn-primary flex-1 py-2 text-xs"
            >
              <Icons.Check size={16} /> Accept
            </button>
            <button
              onClick={() => onAction('decline', interest._id)}
              disabled={loading}
              className="btn-secondary flex-1 py-2 text-xs hover:text-red-500"
            >
              <Icons.X size={16} /> Decline
            </button>
          </>
        )}

        {interest.status === 'pending' && isOutgoing && (
          <button
            onClick={() => onAction('withdraw', interest._id)}
            disabled={loading}
            className="btn-secondary w-full py-2 text-xs text-red-500 hover:bg-red-500/10"
          >
            <Icons.Trash size={14} /> Withdraw Request
          </button>
        )}

        {interest.status === 'accepted' && (
          <>
            <button
              onClick={() => profileRouteId && navigate(`/profile/${profileRouteId}`)}
              className="btn-secondary flex-1 py-2 text-xs"
              disabled={!profileRouteId}
            >
              <Icons.User size={16} /> View Profile
            </button>
            <button
              onClick={() => otherUserId && navigate(`/chat/with/${otherUserId}`)}
              className="btn-primary flex-1 py-2 text-xs"
              disabled={!otherUserId}
            >
              <Icons.MessageCircle size={16} /> Message
            </button>
          </>
        )}

        {['declined', 'blocked', 'withdrawn'].includes(interest.status) && (
          <div className="w-full text-center py-2 text-xs font-medium text-[var(--text-muted)]">
            This request is closed.
          </div>
        )}
      </div>
    </div>
  );
}