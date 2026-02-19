import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../services/api';
import { Icons } from './Icons';

const toMajor = (minor) => {
  const n = Number(minor || 0);
  return Number.isFinite(n) ? (n / 100).toFixed(2) : '0.00';
};

export default function AdminVerifiedBadgeConfigPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const [cfg, setCfg] = useState({
    isEnabled: false,
    currency: 'LKR',
    priceMinor: 0,
    durationDays: 365,
  });

  const priceMajor = useMemo(() => toMajor(cfg.priceMinor), [cfg.priceMinor]);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await adminAPI.getVerifiedBadgeConfig();
      const c = res?.config || res;
      setCfg({
        isEnabled: !!c.isEnabled,
        currency: String(c.currency || 'LKR').toUpperCase(),
        priceMinor: Number(c.priceMinor || 0),
        durationDays: Number(c.durationDays ?? 365),
      });
    } catch (e) {
      setErr(e?.message || 'Failed to load config');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    setErr('');
    try {
      await adminAPI.updateVerifiedBadgeConfig({
        isEnabled: cfg.isEnabled,
        currency: cfg.currency,
        priceMinor: Number(cfg.priceMinor || 0),
        durationDays: Number(cfg.durationDays ?? 365),
      });
      await load();
      alert('Saved');
    } catch (e) {
      setErr(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-6 flex items-center gap-2">
        <Icons.Loader size={16} className="animate-spin" />
        <span className="text-sm text-[var(--text-muted)]">Loading config…</span>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Icons.BadgeCheck size={16} /> Verified Badge Pricing
        </h3>
        <button className="btn-secondary" onClick={load}>
          <Icons.RefreshCw size={16} /> Refresh
        </button>
      </div>

      {err && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">{err}</div>}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={cfg.isEnabled}
          onChange={(e) => setCfg((p) => ({ ...p, isEnabled: e.target.checked }))}
        />
        Enabled
      </label>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <div className="label">Currency</div>
          <select
            className="select w-full"
            value={cfg.currency}
            onChange={(e) => setCfg((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
          >
            <option value="LKR">LKR</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div>
          <div className="label">Duration Days (0 = lifetime)</div>
          <input
            className="input w-full"
            type="number"
            min="0"
            value={cfg.durationDays}
            onChange={(e) => setCfg((p) => ({ ...p, durationDays: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div>
        <div className="label">Price (major)</div>
        <div className="flex gap-2">
          <input
            className="input w-full"
            type="number"
            min="0"
            step="0.01"
            value={priceMajor}
            onChange={(e) => {
              const major = Number(e.target.value || 0);
              const minor = Math.round(major * 100);
              setCfg((p) => ({ ...p, priceMinor: minor }));
            }}
          />
          <div className="pill whitespace-nowrap">
            Minor: {Number(cfg.priceMinor || 0).toLocaleString()}
          </div>
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary w-full justify-center">
        {saving ? <Icons.Loader size={16} className="animate-spin" /> : <Icons.Check size={16} />}
        <span>{saving ? 'Saving…' : 'Save Config'}</span>
      </button>
    </div>
  );
}