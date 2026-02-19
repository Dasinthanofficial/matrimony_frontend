import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { interestAPI } from '../services/api';
import { Icons } from '../components/Icons';

export default function ShortlistPage() {
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleRemove = async (userId) => {
    if (!userId) return alert('Invalid user');
    if (!window.confirm('Remove from shortlist?')) return;

    try {
      await interestAPI.removeFromShortlist(userId);
      setShortlist((prev) =>
        prev.filter((item) => {
          const id = item.shortlistedUserId?._id || item.shortlistedUserId;
          return id?.toString() !== userId?.toString();
        })
      );
    } catch (err) {
      alert(err.message || 'Failed to remove');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Icons.Loader className="animate-spin" size={32} />
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
          <Link to="/search" className="btn-primary">
            Browse Profiles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shortlist.map((item) => {
            const profile = item.shortlistedProfileId || item.shortlistedUserId || {};
            const profileId = profile.profileId || profile._id;
            const userId = item.shortlistedUserId?._id || item.shortlistedUserId;

            return (
              <div key={item._id} className="card overflow-hidden group">
                {/* Photo */}
                <div className="aspect-[4/3] bg-[var(--bg-tertiary)] relative">
                  {profile.photos?.[0]?.url ? (
                    <img
                      src={profile.photos[0].url}
                      alt={profile.fullName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icons.User size={48} className="text-[var(--text-muted)]" />
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(userId)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
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
                    {profile.age && `${profile.age} yrs`}
                    {profile.city && ` • ${profile.city}`}
                  </p>

                  {item.note && (
                    <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
                      "{item.note}"
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Link
                      to={`/profile/${profileId}`}
                      className="flex-1 btn-secondary text-sm justify-center"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => handleRemove(userId)}
                      className="px-3 py-2 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Icons.Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}