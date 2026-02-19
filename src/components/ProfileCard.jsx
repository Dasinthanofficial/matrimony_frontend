import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from './Icons';

export default function ProfileCard({ profile, onInterest, onShortlist }) {
  const { user, hasPremiumAccess } = useAuth();
  const navigate = useNavigate();

  const isPremiumUser = hasPremiumAccess();
  
  // Find the main photo, or the first photo, or null if none
  const mainPhoto = profile.photos?.find((p) => p.isProfile)?.url || profile.photos?.[0]?.url;
  const initials = (profile.fullName || 'U').charAt(0).toUpperCase();

  const targetUserId = profile.userId?._id || profile.userId || profile.id;
  const profileUrl = `/profile/${profile.profileId || profile._id}`;

  const handleAction = (e, action) => {
    e.stopPropagation(); // Prevent card click when clicking a button
    if (!user) return navigate('/login', { state: { from: { pathname: profileUrl } } });
    if (!targetUserId) return;
    action(targetUserId);
  };

  const handleNavigate = () => navigate(profileUrl);

  return (
    <div
      className="card group overflow-hidden cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNavigate(); }}
    >
      <div className="relative aspect-[3/4]">
        {mainPhoto && !profile.photosLocked ? (
          <img
            src={mainPhoto}
            alt={`${profile.fullName || 'Profile'} photo`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--surface-glass)] to-transparent flex items-center justify-center">
            <span className="text-6xl font-bold text-[var(--text-muted)] opacity-50">{initials}</span>
          </div>
        )}

        <div className="image-overlay" />

        <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2">
          {profile.isVerified && (
            <span className="badge-success shadow-md">
              <Icons.Check size={12} />
              <span className="hidden sm:inline">Verified</span>
            </span>
          )}
          {isPremiumUser && profile.matchScore != null && (
            <span className="badge-accent shadow-md ml-auto">{Math.round(profile.matchScore)}% Match</span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <div>
            <h3 className="text-xl font-bold text-white truncate">
              {profile.fullName || 'User'}, {profile.age || 'N/A'}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-white/80">
              <Icons.MapPin size={14} />
              <span className="truncate">{profile.city || profile.country || 'Location hidden'}</span>
            </div>
          </div>

          {profile.agencyNameTag && (
            <div>
              <span className="badge-accent text-[10px]">By {profile.agencyNameTag}</span>
            </div>
          )}
          
          {!isPremiumUser && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300/80">
              <Icons.Lock size={12} />
              <span>Upgrade to see occupation</span>
            </div>
          )}
          
          <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={(e) => handleAction(e, onShortlist)}
              className="flex-1 btn-secondary bg-white/10 text-white backdrop-blur-sm border-white/20 hover:bg-white/20"
              disabled={!targetUserId}
            >
              <Icons.Bookmark size={16} />
              <span>Save</span>
            </button>
            <button
              onClick={(e) => handleAction(e, onInterest)}
              className="flex-1 btn-primary"
              disabled={!targetUserId}
            >
              <Icons.Heart size={16} />
              <span>Connect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}