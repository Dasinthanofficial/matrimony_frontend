// ===== FILE: ./src/pages/ProfilePage.jsx =====
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileAPI, interestAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';
import PremiumLock from '../components/PremiumLock';
import AgencyFeedbackSection from '../components/AgencyFeedbackSection';

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
    if (!currentUser) return navigate('/login');
    if (!profile || !targetUserId) return alert('Cannot send interest: invalid user');
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
    if (targetUserId) navigate(`/chat/with/${targetUserId}`);
  };

  const handleChatWithAgency = () => {
    if (profile?.agencyId) navigate(`/chat/with/${profile.agencyId}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner-lg mx-auto mb-4" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 text-center">
        <Icons.AlertCircle size={28} className="mx-auto mb-4" />
        <h2>Profile Unavailable</h2>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-4">Go Back</button>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <div className="min-h-screen pb-24 md:pb-20">
        <div className="h-[28vh] sm:h-[35vh] lg:h-[50vh] relative">
          <div className="w-full h-full bg-gradient-to-br from-[var(--accent-500)]/30 to-[var(--accent-700)]/30" />
          <button onClick={() => navigate(-1)} className="absolute top-24 left-4 btn-secondary">Back</button>
        </div>
        <div className="page-container -mt-16 relative z-10">
          <div className="card p-8 text-center">
            <PremiumLock title="Unlock Profile" description="Upgrade or connect to view." />
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
        <button onClick={() => navigate(-1)} className="absolute top-[4.5rem] left-4 btn-secondary">Back</button>
      </div>

      <div className="page-container -mt-16 sm:-mt-24 lg:-mt-32 relative z-10">
        <div className="card p-4 sm:p-6 lg:p-10">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12">
            
            {/* Photo Column */}
            <div className="w-full sm:w-2/3 sm:mx-auto lg:w-1/3 lg:mx-0 -mt-12 sm:-mt-16 lg:-mt-24">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden border-4 border-[var(--bg-primary)] shadow-xl relative bg-[var(--surface-glass)]">
                {mainPhoto && !profile.photosLocked ? (
                  <img src={mainPhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-white/30">
                    {userInitial}
                  </div>
                )}
                {profile.isVerified && (
                  <div className="absolute top-3 right-3 badge-success">Verified</div>
                )}
              </div>
            </div>

            {/* Info Column */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-bold break-words">{profile.fullName}</h1>
                  {isAgency && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-xs font-bold uppercase">
                      Agency Profile
                    </span>
                  )}
                  {canViewPremiumInfo && profile.occupation && (
                    <p className="text-lg text-[var(--accent-500)] font-medium mt-1">{profile.occupation}</p>
                  )}
                </div>

                {hasSuccessFee && !isOwnProfile && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                    Success fee: <span className="font-bold">{formatMoney(profile.successFee, profile.successFeeCurrency)}</span> (paid upon marriage)
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {!isOwnProfile && (
                    <button onClick={handleSendInterest} disabled={sendingInterest || !targetUserId} className="btn-primary flex-1">
                      {sendingInterest ? <span className="spinner-sm" /> : <Icons.Heart size={18} />}
                      <span>Send Interest</span>
                    </button>
                  )}
                  {!isOwnProfile && (
                    <button onClick={handleMessage} disabled={!targetUserId} className="btn-secondary flex-1">
                      <Icons.MessageCircle size={18} />
                      <span>Message</span>
                    </button>
                  )}
                  {isOwnProfile && (
                    <button onClick={() => navigate('/complete-profile')} className="btn-secondary flex-1">
                      <Icons.Edit size={18} /> Edit Profile
                    </button>
                  )}
                  {!isOwnProfile && isAgency && (
                    <button onClick={handleChatWithAgency} className="btn-secondary flex-1">
                      <Icons.Building2 size={18} /> Chat Agency
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {basicInfo.map((item, i) => (
                  <div key={i} className="card p-3 flex items-center gap-3">
                    <item.icon size={20} className="text-[var(--accent-500)]" />
                    <div>
                      <p className="text-xs text-[var(--text-muted)] uppercase">{item.label}</p>
                      <p className="font-medium capitalize truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card p-6 mb-8">
                <h3 className="font-bold mb-2">About</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {profile.bio || 'No bio provided.'}
                </p>
              </div>

              {/* Agency Feedback Section */}
              {isAgency && profile.agencyId && (
                <div className="mb-8">
                  <AgencyFeedbackSection agencyId={profile.agencyId} />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}