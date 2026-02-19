// ===== FIXED FILE: ./src/pages/SearchPage.jsx =====
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import SearchFilters from '../components/SearchFilters';
import { searchAPI, interestAPI } from '../services/api';
import { Icons } from '../components/Icons';

const getPageWindow = (current, total, windowSize = 5) => {
  if (total <= windowSize) {
    return { pages: Array.from({ length: total }, (_, i) => i + 1), start: 1, end: total };
  }
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, current - half);
  let end = start + windowSize - 1;
  if (end > total) {
    end = total;
    start = Math.max(1, end - windowSize + 1);
  }
  return { pages: Array.from({ length: end - start + 1 }, (_, i) => start + i), start, end };
};

export default function SearchPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // ✅ FIX: runSearch takes explicit params — no dependency on reactive state
  const runSearch = useCallback(async (filters, pageNum) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 12, ...filters };

      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] === null || params[k] === undefined) {
          delete params[k];
        }
      });

      const res = await searchAPI.search(params);
      setProfiles(res.profiles || []);
      setTotalPages(res.pagination?.pages || 1);
      setTotalResults(res.pagination?.total || res.profiles?.length || 0);
    } catch (err) {
      console.error('Search error:', err);
      setProfiles([]);
      setTotalPages(1);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ FIX: No reactive deps — all values passed as args

  // ✅ FIX: Single source of truth — useEffect is the only thing that calls runSearch
  useEffect(() => {
    runSearch(activeFilters, page);
  }, [page, activeFilters, runSearch]);

  const handleInterest = async (targetUserId) => {
    if (!targetUserId) return alert('Cannot send interest: Invalid user');
    try {
      await interestAPI.sendInterest(targetUserId, 'Hi! I would like to connect with you.');
      alert('Interest sent successfully!');
    } catch (e) {
      alert(e.message || 'Failed to send interest');
    }
  };

  const handleShortlist = async (targetUserId) => {
    if (!targetUserId) return alert('Cannot shortlist: Invalid user');
    try {
      await interestAPI.addToShortlist(targetUserId);
      alert('Added to shortlist!');
    } catch (e) {
      alert(e.message || 'Failed to add to shortlist');
    }
  };

  // ✅ FIX: Only set state — useEffect handles the search
  const resetFilters = () => {
    setActiveFilters({});
    setPage(1);
  };

  const pagination = useMemo(() => getPageWindow(page, totalPages, 5), [page, totalPages]);

  return (
    <div className="p-4 lg:p-6">
      <header className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="icon-box-sm icon-box-accent">
              <Icons.Search size={16} />
            </div>
            <span className="text-[10px] font-semibold text-[var(--accent-500)] uppercase tracking-wider">
              Discovery
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-1">
            Find Your <span className="text-gradient">Match</span>
          </h1>
          <p className="text-[var(--text-secondary)]">Explore profiles based on your preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="btn-secondary py-2 px-4 text-xs">
            <Icons.Home size={14} />
            <span>Dashboard</span>
          </Link>
          <div className="pill">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>{totalResults} Results</span>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
        <aside className="lg:col-span-1">
          <SearchFilters
            onFilter={(f) => {
              // ✅ FIX: Only set state — don't call runSearch directly
              setActiveFilters(f || {});
              setPage(1);
            }}
            loading={loading}
          />
        </aside>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="card p-16">
              <div className="flex flex-col items-center justify-center">
                <div className="spinner-lg mb-4" />
                <p className="text-[var(--text-muted)] text-sm">Searching profiles...</p>
              </div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="card p-12 lg:p-16 text-center">
              <div className="icon-box-xl mx-auto mb-4 opacity-50">
                <Icons.Search size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
              <p className="text-[var(--text-muted)] mb-6">Try adjusting your filters to see more profiles</p>
              <button onClick={resetFilters} className="btn-secondary">
                <Icons.RefreshCw size={16} />
                <span>Reset Filters</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[var(--text-muted)]">
                  Showing <span className="font-medium text-[var(--text-primary)]">{profiles.length}</span> of{' '}
                  {totalResults} profiles
                </p>
                <button
                  onClick={() => runSearch(activeFilters, page)}
                  disabled={loading}
                  className="btn-ghost text-sm"
                >
                  <Icons.RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile._id}
                    profile={profile}
                    onInterest={handleInterest}
                    onShortlist={handleShortlist}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="btn-secondary py-2 px-4 text-sm disabled:opacity-30"
                  >
                    <Icons.ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1 px-4">
                    {pagination.start > 1 && (
                      <>
                        <button
                          onClick={() => setPage(1)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            page === 1 ? 'bg-[var(--accent-500)] text-white' : 'hover:bg-[var(--surface-glass)]'
                          }`}
                        >
                          1
                        </button>
                        {pagination.start > 2 && <span className="px-2 text-[var(--text-muted)]">...</span>}
                      </>
                    )}
                    {pagination.pages.map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          page === pageNum ? 'bg-[var(--accent-500)] text-white' : 'hover:bg-[var(--surface-glass)]'
                        }`}
                        aria-current={page === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    ))}
                    {pagination.end < totalPages && (
                      <>
                        {pagination.end < totalPages - 1 && <span className="px-2 text-[var(--text-muted)]">...</span>}
                        <button
                          onClick={() => setPage(totalPages)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            page === totalPages ? 'bg-[var(--accent-500)] text-white' : 'hover:bg-[var(--surface-glass)]'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                    className="btn-secondary py-2 px-4 text-sm disabled:opacity-30"
                  >
                    <span>Next</span>
                    <Icons.ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}