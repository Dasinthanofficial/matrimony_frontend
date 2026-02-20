// ===== FILE: ./src/components/AgencyFeedbackSection.jsx =====
import React, { useEffect, useState } from 'react';
import { agencyFeedbackAPI } from '../services/api';
import { Icons } from './Icons';

export default function AgencyFeedbackSection({ agencyId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const [summary, setSummary] = useState({ avg: 0, count: 0 });
  const [items, setItems] = useState([]);

  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');

  const load = async () => {
    setErr('');
    setLoading(true);
    try {
      const res = await agencyFeedbackAPI.list(agencyId, { page: 1, limit: 10 });
      setItems(res?.feedback || []);
      setSummary(res?.ratingSummary || { avg: 0, count: 0 });

      // try load my existing review (if logged in)
      try {
        const mine = await agencyFeedbackAPI.getMine(agencyId);
        if (mine?.feedback) {
          setMyRating(mine.feedback.rating);
          setMyComment(mine.feedback.comment || '');
        }
      } catch {
        // not logged in or no review -> ignore
      }
    } catch (e) {
      console.warn("Feedback load error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agencyId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyId]);

  const submit = async () => {
    setErr('');
    setSaving(true);
    try {
      const res = await agencyFeedbackAPI.upsert(agencyId, { rating: myRating, comment: myComment });
      if (res?.ratingSummary) setSummary(res.ratingSummary);
      await load();
    } catch (e) {
      setErr(e?.message || 'Failed to submit feedback');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-lg">Agency Ratings</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center text-amber-400">
              <span className="font-bold text-xl mr-1">{summary.avg}</span>
              <Icons.Star size={16} fill="currentColor" />
            </div>
            <span className="text-sm text-[var(--text-muted)]">({summary.count} reviews)</span>
          </div>
        </div>
        <button className="btn-secondary text-xs px-3" onClick={load} disabled={loading || saving}>
          <Icons.RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {err && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {err}
        </div>
      )}

      {/* Write Review */}
      <div className="p-4 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-primary)]">
        <label className="block text-sm font-medium mb-2">Write a Review</label>
        
        <div className="flex gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setMyRating(n)}
              className={`p-2 rounded-lg transition-all ${
                myRating >= n ? 'text-amber-400' : 'text-[var(--text-muted)]'
              }`}
            >
              <Icons.Star size={20} fill={myRating >= n ? "currentColor" : "none"} />
            </button>
          ))}
        </div>

        <textarea
          className="input w-full min-h-[80px] text-sm"
          placeholder="Share your experience with this agency..."
          value={myComment}
          onChange={(e) => setMyComment(e.target.value)}
          disabled={saving}
        />

        <div className="mt-3 flex justify-end">
          <button className="btn-primary py-2 px-4 text-sm" onClick={submit} disabled={saving}>
            {saving ? 'Posting...' : 'Post Review'}
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3 pt-2">
        {items.length === 0 && !loading && (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">No reviews yet. Be the first!</p>
        )}
        
        {items.map((f) => (
          <div key={f._id} className="border-b border-[var(--border-primary)] last:border-0 pb-3 last:pb-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">{f.userId?.fullName || 'User'}</span>
              <div className="flex items-center text-amber-400">
                <span className="text-xs font-bold mr-1">{f.rating}</span>
                <Icons.Star size={10} fill="currentColor" />
              </div>
            </div>
            {f.comment && <p className="text-sm text-[var(--text-secondary)]">{f.comment}</p>}
            <p className="text-[10px] text-[var(--text-muted)] mt-1">{new Date(f.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}