// ===== FIXED FILE: ./src/components/ProfileCard.jsx =====
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from './Icons';

export default function ProfileCard({ profile, onInterest, onShortlist }) {
  const { user, hasPremiumAccess } = useAuth();
  const navigate = useNavigate();

  const isPremiumUser = hasPremiumAccess();

  const mainPhoto = profile.photos?.find((p) => p.isProfile)?.url || profile.photos?.[0]?.url;
  const initials = (profile.fullName || 'U').charAt(0).toUpperCase();

  const targetUserId = profile.userId?._id || profile.userId || profile.id;

  const profileUrl = `/profile/${profile.profileId || profile._id}`;

  const handleAction = (e, action) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    if (!targetUserId) return;
    action(targetUserId);
  };

  const handleNavigate = () => navigate(profileUrl);

  return (
    <div
      className="card-interactive overflow-hidden group"
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNavigate();
        }
      }}
    >
      <div className="relative aspect-[3/4]">
        {mainPhoto && !profile.photosLocked ? (
          <img
            src={mainPhoto}
            alt={`${profile.fullName || 'Profile'} photo`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--accent-500)]/20 to-[var(--accent-700)]/20 flex items-center justify-center">
            <span className="text-5xl sm:text-6xl font-bold text-[var(--text-muted)]">{initials}</span>
          </div>
        )}

        <div className="image-overlay" />

        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex justify-between items-start">
          {profile.isVerified && (
            <span className="badge-success">
              <Icons.Check size={12} />
              <span className="hidden sm:inline">Verified</span>
            </span>
          )}
          {isPremiumUser && profile.matchScore != null && (
            <span className="badge-accent">{Math.round(profile.matchScore)}%</span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5 truncate">
            {profile.fullName}
            {profile.age ? `, ${profile.age}` : ''}
          </h3>

          {/* ✅ Agency tag */}
          {profile.agencyNameTag && (
            <div className="mb-2">
              <span className="badge-accent text-[10px]">By {profile.agencyNameTag}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/80 mb-2 sm:mb-3">
            <Icons.MapPin size={14} />
            <span className="truncate">{profile.city || 'Location hidden'}</span>
          </div>

          {isPremiumUser ? (
            <p className="text-xs sm:text-sm text-[var(--accent-500)] font-medium mb-2 sm:mb-3 truncate">
              {profile.occupation || profile.education || 'Member'}
            </p>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-white/60 mb-2 sm:mb-3">
              <Icons.Lock size={12} />
              <span>Upgrade to see more</span>
            </div>
          )}

          <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 md:translate-y-2 md:group-hover:translate-y-0">
            <button
              onClick={(e) => handleAction(e, onShortlist)}
              className="flex-1 py-2.5 sm:py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/20 transition-colors active:scale-95"
              disabled={!targetUserId}
            >
              <Icons.Bookmark size={14} />
              Save
            </button>
            <button
              onClick={(e) => handleAction(e, onInterest)}
              className="flex-1 py-2.5 sm:py-2 rounded-lg bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:shadow-lg transition-all active:scale-95"
              disabled={!targetUserId}
            >
              <Icons.Heart size={14} />
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}