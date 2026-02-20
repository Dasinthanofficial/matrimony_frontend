// src/pages/ShortlistPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { interestAPI } from '../services/api';
import { Icons } from '../components/Icons';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

export default function ShortlistPage() {
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal & Toast State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ open: true, message, type });
  const closeToast = () => setToast(prev => ({ ...prev, open: false }));

  useEffect(() => {
    loadShortlist();
  }, []);

  const loadShortlist = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await interestAPI.getShortlist({ page: 1, limit: 50 });
      setShortlist(response.shortlist || []);
    } catch (err) {
      setError('Failed to load shortlist');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Modal
  const initiateRemove = (userId) => {
    if (!userId) return;
    setSelectedId(userId);
    setModalOpen(true);
  };

  // Actual Delete Logic
  const handleConfirmRemove = async () => {
    try {
      await interestAPI.removeFromShortlist(selectedId);
      
      setShortlist((prev) =>
        prev.filter((item) => {
          const id = item.shortlistedUserId?._id || item.shortlistedUserId;
          return id?.toString() !== selectedId?.toString();
        })
      );
      
      showToast('Profile removed from shortlist', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to remove profile', 'error');
    } finally {
      setModalOpen(false);
      setSelectedId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Icons.Loader className="animate-spin text-[var(--accent-500)]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Shortlist</h1>
          <p className="text-[var(--text-secondary)]">
            {shortlist.length} profile{shortlist.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <Link to="/search" className="btn-primary w-fit">
          <Icons.Search size={16} />
          <span>Find More</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}

      {/* Shortlist Grid */}
      {shortlist.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent-500)]/10 flex items-center justify-center">
            <Icons.Bookmark size={32} className="text-[var(--accent-500)]" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Saved Profiles</h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Save profiles you're interested in to view them here
          </p>
          <Link to="/search" className="btn-primary inline-flex">
            Browse Profiles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shortlist.map((item) => {
            const profile = item.shortlistedProfileId || item.shortlistedUserId || {};
            const profileId = profile.profileId || profile._id;
            const userId = item.shortlistedUserId?._id || item.shortlistedUserId; // ID to delete

            return (
              <div key={item._id} className="card overflow-hidden group relative">
                {/* Photo */}
                <div className="aspect-[4/3] bg-[var(--bg-tertiary)] relative">
                  {profile.photos?.[0]?.url ? (
                    <img
                      src={profile.photos[0].url}
                      alt={profile.fullName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icons.User size={48} className="text-[var(--text-muted)]" />
                    </div>
                  )}

                  {/* Floating Remove Button (visible on hover) */}
                  <button
                    onClick={() => initiateRemove(userId)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 backdrop-blur-sm"
                    title="Remove from shortlist"
                  >
                    <Icons.X size={16} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold truncate mb-1">
                    {profile.fullName || 'Unknown'}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mb-3">
                    {profile.age ? `${profile.age} yrs` : ''}
                    {profile.age && profile.city ? ' • ' : ''}
                    {profile.city || ''}
                  </p>

                  {item.note && (
                    <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2 italic">
                      "{item.note}"
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Link
                      to={`/profile/${profileId}`}
                      className="flex-1 btn-secondary text-xs sm:text-sm h-9 justify-center"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => initiateRemove(userId)}
                      className="px-3 h-9 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center"
                      title="Remove"
                    >
                      <Icons.Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Components */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmRemove}
        title="Remove from Shortlist?"
        message="Are you sure you want to remove this profile? You can always find them again in search."
        isDeleting={true}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
    </div>
  );
}