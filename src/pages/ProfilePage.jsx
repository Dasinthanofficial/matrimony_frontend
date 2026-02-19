import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileAPI, interestAPI } from '../services/api';

import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';
import PremiumLock from '../components/PremiumLock';

const formatMoney = (amount, currency) => {
  const num = Number(amount);
  const safe = Number.isFinite(num) ? num : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: String(currency || 'LKR').toUpperCase(),
      maximumFractionDigits: 0,
    }).format(safe);
  } catch {
    return `${String(currency || 'LKR').toUpperCase()} ${safe.toFixed(0)}`;
  }
};

export default function ProfilePage() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, hasPremiumAccess } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingInterest, setSendingInterest] = useState(false);
  

  const currentUserId = (currentUser?.id || currentUser?._id || '')?.toString();
  const currentUserProfileId = currentUser?.profileId;
  const isPremiumUser = hasPremiumAccess();

  useEffect(() => {
    const load = async () => {
      try {
        const isMe =
          !profileId ||
          profileId === 'me' ||
          profileId === currentUserId ||
          profileId === currentUserProfileId;

        const res = isMe
          ? await profileAPI.getMyProfile()
          : await profileAPI.getProfileById(profileId);

        setProfile(res.profile);
      } catch (err) {
        console.error(err);

        const isMe =
          !profileId ||
          profileId === 'me' ||
          profileId === currentUserId ||
          profileId === currentUserProfileId;

        if (isMe && err.message?.toLowerCase().includes('profile not found')) {
          navigate('/complete-profile', { replace: true });
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [profileId, currentUserId, currentUserProfileId, navigate]);

  const isOwnProfile = useMemo(() => {
  const profileUserId = (profile?.userId?._id || profile?.userId || '')?.toString();
  return !!profileUserId && !!currentUserId && profileUserId === currentUserId;
}, [profile, currentUserId]);

  const isLocked = profile?.profileLocked === true && !profile?.isAgencyManaged;
  const canViewPremiumInfo = isOwnProfile || isPremiumUser || profile?.isAgencyManaged;

  const targetUserId = profile?.userId?._id || profile?.userId || null;

  const handleSendInterest = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!profile || !targetUserId) {
      alert('Cannot send interest: invalid user');
      return;
    }
    setSendingInterest(true);
    try {
      await interestAPI.sendInterest(targetUserId, "Hi, I'd like to connect!");
      alert('Interest sent successfully!');
    } catch (err) {
      alert(err.message || 'Failed to send interest');
    } finally {
      setSendingInterest(false);
    }
  };

  const handleMessage = () => {
    if (!targetUserId) return;
    navigate(`/chat/with/${targetUserId}`);
  };

  const handleChatWithAgency = () => {
    if (!profile?.agencyId) return;
    navigate(`/chat/with/${profile.agencyId}`);
  };

  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-lg mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-6 sm:p-8 text-center max-w-md">
          <div className="icon-box-xl icon-box-error mx-auto mb-4">
            <Icons.AlertCircle size={28} />
          </div>
          <h2 className="heading-md mb-2">Profile Unavailable</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            This profile may have been removed or is no longer accessible.
          </p>
          <button onClick={() => navigate(-1)} className="btn-secondary">
            <Icons.ChevronLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen pb-24 md:pb-20">
        <div className="h-[28vh] sm:h-[35vh] lg:h-[50vh] relative">
          <div className="w-full h-full bg-gradient-to-br from-[var(--accent-500)]/30 to-[var(--accent-700)]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/50 to-transparent" />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-[4.5rem] sm:top-20 lg:top-24 left-3 sm:left-4 lg:left-8 btn-secondary py-2 px-3 sm:px-4"
          >
            <Icons.ChevronLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
        <div className="page-container -mt-16 sm:-mt-24 lg:-mt-32 relative z-10">
          <div className="card p-6 sm:p-8 lg:p-10 text-center">
            <div className="icon-box-xl icon-box-accent mx-auto mb-4">
              <Icons.Lock size={28} />
            </div>
            <h2 className="heading-md mb-2">Profile Locked</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              This profile is not visible based on the member's privacy settings.
            </p>
            <PremiumLock
              title="Unlock Profile"
              description="Upgrade to premium or connect to view this profile."
            />
          </div>
        </div>
      </div>
    );
  }

  const mainPhoto = profile.photos?.find((p) => p.isProfile)?.url || profile.photos?.[0]?.url;
  const userInitial = (profile.fullName || 'U').charAt(0).toUpperCase();
  const isAgency = profile.isAgencyManaged && profile.agencyId;
  const hasSuccessFee = isAgency && Number(profile.successFee || 0) > 0;

  const basicInfo = [
    { label: 'Age', value: profile.age ? `${profile.age} years` : 'Not specified', icon: Icons.Calendar },
    { label: 'Location', value: [profile.city, profile.country].filter(Boolean).join(', ') || 'Not specified', icon: Icons.MapPin },
    { label: 'Religion', value: profile.religion || 'Not specified', icon: Icons.Globe },
    { label: 'Status', value: profile.maritalStatus?.replace('_', ' ') || 'Not specified', icon: Icons.User },
  ];

  const premiumInfo = [
    { label: 'Education', value: profile.education || 'Not specified', icon: Icons.GraduationCap },
    { label: 'Occupation', value: profile.occupation || 'Not specified', icon: Icons.Briefcase },
    { label: 'Mother Tongue', value: profile.motherTongue || 'Not specified', icon: Icons.MessageSquare },
    { label: 'Diet', value: profile.diet || 'Not specified', icon: Icons.Heart },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-20">
      <div className="h-[28vh] sm:h-[35vh] lg:h-[50vh] relative">
        {mainPhoto && !profile.photosLocked ? (
          <img src={mainPhoto} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--accent-500)]/30 to-[var(--accent-700)]/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/50 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-[4.5rem] sm:top-20 lg:top-24 left-3 sm:left-4 lg:left-8 btn-secondary py-2 px-3 sm:px-4"
        >
          <Icons.ChevronLeft size={16} />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      <div className="page-container -mt-16 sm:-mt-24 lg:-mt-32 relative z-10">
        <div className="card p-4 sm:p-6 lg:p-10">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12">
            <div className="w-full sm:w-2/3 sm:mx-auto lg:w-1/3 lg:mx-0 -mt-12 sm:-mt-16 lg:-mt-24">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden border-4 border-[var(--bg-primary)] shadow-xl relative">
                {mainPhoto && !profile.photosLocked ? (
                  <img src={mainPhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center">
                    <span className="text-5xl sm:text-6xl font-bold text-white/30">{userInitial}</span>
                  </div>
                )}

                {profile.isVerified && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 badge-success">
                    <Icons.Check size={12} />
                    <span className="hidden sm:inline">Verified</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold break-words">
                      {profile.fullName}
                    </h1>
                    {isAgency && (
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 text-[10px] font-bold uppercase tracking-wider">
                        Agency Profile
                      </span>
                    )}
                  </div>
                  {canViewPremiumInfo && profile.occupation && (
                    <p className="text-base sm:text-lg text-[var(--accent-500)] font-medium truncate">
                      {profile.occupation}
                    </p>
                  )}
                </div>

                {/* Agency success fee banner */}
                {hasSuccessFee && !isOwnProfile && (
                  <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Icons.Shield size={16} className="text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-green-600">Free to View & Chat</p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        Success fee of{' '}
                        <span className="font-bold text-green-600">
                          {formatMoney(profile.successFee, profile.successFeeCurrency)}
                        </span>{' '}
                        applies only if marriage is successful
                      </p>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {!isOwnProfile && (
                    <button
                      onClick={handleSendInterest}
                      disabled={sendingInterest || !targetUserId}
                      className="btn-primary py-2.5 px-5 sm:py-3 sm:px-6 text-sm sm:text-base"
                    >
                      {sendingInterest ? <span className="spinner-sm" /> : <Icons.Heart size={18} />}
                      <span>Send Interest</span>
                    </button>
                  )}

                  {isOwnProfile && (
                    <button
                      onClick={() => navigate('/complete-profile')}
                      className="btn-secondary py-2.5 px-4 sm:py-3 sm:px-5"
                    >
                      <Icons.Edit size={16} />
                      <span>Edit Profile</span>
                    </button>
                  )}

                  {!isOwnProfile && (
                    <button
                      onClick={handleMessage}
                      disabled={!targetUserId}
                      className="btn-secondary py-2.5 px-4 sm:py-3 sm:px-5"
                    >
                      <Icons.MessageCircle size={16} />
                      <span className="hidden sm:inline">Message</span>
                    </button>
                  )}

                  {/* Chat with Agency button */}
                  {!isOwnProfile && isAgency && (
                    <button
                      onClick={handleChatWithAgency}
                      className="btn-secondary py-2.5 px-4 sm:py-3 sm:px-5"
                    >
                      <Icons.Building2 size={16} />
                      <span className="hidden sm:inline">Chat with Agency</span>
                    </button>
                  )}

                  
                </div>
              </div>

              {/* Basic info cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                {basicInfo.map((item, i) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={i} className="card p-3 sm:p-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                        <IconComponent size={12} className="text-[var(--accent-500)] flex-shrink-0" />
                        <p className="text-[9px] sm:text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider truncate">
                          {item.label}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm font-medium capitalize truncate">{item.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Detailed info */}
              <div className="relative mb-6 sm:mb-8">
                <h3 className="label mb-3 sm:mb-4">Detailed Information</h3>

                {canViewPremiumInfo ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {premiumInfo.map((item, i) => {
                      const IconComponent = item.icon;
                      return (
                        <div key={i} className="card p-3 sm:p-4">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                            <IconComponent size={12} className="text-[var(--accent-500)] flex-shrink-0" />
                            <p className="text-[9px] sm:text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider truncate">
                              {item.label}
                            </p>
                          </div>
                          <p className="text-xs sm:text-sm font-medium capitalize truncate">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="card p-4 sm:p-6 relative overflow-hidden">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 blur-sm opacity-50 select-none pointer-events-none">
                      {premiumInfo.map((_, i) => (
                        <div key={i} className="p-3 sm:p-4 rounded-xl bg-[var(--surface-glass)]">
                          <div className="h-3 w-12 sm:w-16 bg-[var(--border-secondary)] rounded mb-2" />
                          <div className="h-4 w-16 sm:w-24 bg-[var(--border-secondary)] rounded" />
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PremiumLock
                        title="View Full Profile"
                        description="Upgrade to premium to see education, occupation, and more."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="card p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="label mb-2 sm:mb-3">About</h3>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed break-words">
                  {profile.bio || 'No bio added yet.'}
                </p>
              </div>

              {/* Hobbies */}
              {profile.hobbies?.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="label mb-3">Hobbies & Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.hobbies.map((hobby, i) => (
                      <span key={i} className="pill text-xs">{hobby}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {profile.photos?.length > 1 && (
                <div>
                  <h3 className="label mb-3 sm:mb-4">Photos ({profile.photos.length})</h3>
                  {canViewPremiumInfo || !profile.photosLocked ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                      {profile.photos.map((photo, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                        >
                          <img src={photo.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card p-4 sm:p-6 relative overflow-hidden">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 blur-sm opacity-50 pointer-events-none">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="aspect-square rounded-xl bg-[var(--surface-glass)]" />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PremiumLock title="View All Photos" description="Upgrade to premium to see all photos." />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Partner prefs (own profile only) */}
              {isOwnProfile && profile.partnerPreferences && (
                <div className="mt-6 sm:mt-8">
                  <h3 className="label mb-3 sm:mb-4">Partner Preferences</h3>
                  <div className="card p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {profile.partnerPreferences.ageRange && (
                        <div className="flex items-center gap-2 text-sm">
                          <Icons.Calendar size={14} className="text-[var(--accent-500)] flex-shrink-0" />
                          <span className="text-[var(--text-muted)]">Age:</span>
                          <span className="font-medium">
                            {profile.partnerPreferences.ageRange.min} - {profile.partnerPreferences.ageRange.max} years
                          </span>
                        </div>
                      )}
                      {profile.partnerPreferences.religion?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Icons.Globe size={14} className="text-[var(--accent-500)] flex-shrink-0" />
                          <span className="text-[var(--text-muted)]">Religion:</span>
                          <span className="font-medium truncate">{profile.partnerPreferences.religion.join(', ')}</span>
                        </div>
                      )}
                      {profile.partnerPreferences.education?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Icons.GraduationCap size={14} className="text-[var(--accent-500)] flex-shrink-0" />
                          <span className="text-[var(--text-muted)]">Education:</span>
                          <span className="font-medium truncate">{profile.partnerPreferences.education.join(', ')}</span>
                        </div>
                      )}
                      {profile.partnerPreferences.city?.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Icons.MapPin size={14} className="text-[var(--accent-500)] flex-shrink-0" />
                          <span className="text-[var(--text-muted)]">Cities:</span>
                          <span className="font-medium truncate">{profile.partnerPreferences.city.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}