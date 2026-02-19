import React, { useEffect, useState } from 'react';
import { agencyFeedbackAPI } from '../services/api';

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
        // not logged in -> ignore
      }
    } catch (e) {
      setErr(e?.message || 'Failed to load feedback');
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
          <h3 className="font-semibold">Agency Rating</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Avg: <span className="font-semibold">{summary.avg}</span> / 5 • {summary.count} review(s)
          </p>
        </div>
        <button className="btn-secondary" onClick={load} disabled={loading || saving}>
          Refresh
        </button>
      </div>

      {err && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {err}
        </div>
      )}

      {/* Submit / update */}
      <div className="border border-[var(--border-primary)] rounded-xl p-3 bg-[var(--surface-glass)]">
        <div className="text-sm font-medium mb-2">Leave your feedback</div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-[var(--text-secondary)]">Rating:</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`px-2 py-1 rounded-lg border ${
                myRating === n
                  ? 'border-[var(--accent-500)] text-[var(--accent-500)]'
                  : 'border-[var(--border-primary)] text-[var(--text-secondary)]'
              }`}
              onClick={() => setMyRating(n)}
              disabled={saving}
            >
              {n}
            </button>
          ))}
        </div>

        <textarea
          className="input w-full mt-3 min-h-[90px]"
          placeholder="Write a short comment (optional)"
          value={myComment}
          onChange={(e) => setMyComment(e.target.value)}
          disabled={saving}
        />

        <div className="mt-3 flex justify-end">
          <button className="btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Submit'}
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-sm text-[var(--text-secondary)]">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-[var(--text-secondary)]">No feedback yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <div key={f._id} className="border border-[var(--border-primary)] rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{f.userId?.fullName || 'User'}</div>
                <div className="text-sm font-semibold">{f.rating} / 5</div>
              </div>
              {f.comment ? (
                <div className="text-sm text-[var(--text-secondary)] mt-1 whitespace-pre-wrap">
                  {f.comment}
                </div>
              ) : (
                <div className="text-xs text-[var(--text-muted)] mt-1">No comment.</div>
              )}
              <div className="text-xs text-[var(--text-muted)] mt-2">
                {f.createdAt ? new Date(f.createdAt).toLocaleString() : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}