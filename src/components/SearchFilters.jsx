// ===== FILE: ./src/components/SearchFilters.jsx =====
import React, { useState } from 'react';
import { Icons } from './Icons';

export default function SearchFilters({ onFilter, loading }) {
  const [filters, setFilters] = useState({
    minAge: 20, maxAge: 40, gender: '',
    religion: '', education: '', country: '',
    citizenship: '', sriLankanAbroad: false,
  });

  // FIX: Default collapsed on mobile so it doesn't block search results
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (field, value) => {
    setFilters(f => {
      if (field === 'minAge') return { ...f, minAge: value, maxAge: Math.max(value, f.maxAge) };
      if (field === 'maxAge') return { ...f, maxAge: value, minAge: Math.min(value, f.minAge) };
      return { ...f, [field]: value };
    });
  };

  const handleApply = () => onFilter(filters);

  const handleReset = () => {
    const reset = {
      minAge: 20, maxAge: 40, gender: '',
      religion: '', education: '', country: '',
      citizenship: '', sriLankanAbroad: false,
    };
    setFilters(reset);
    onFilter(reset);
  };

  const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];

  const EDUCATION_OPTIONS = [
    { value: 'high_school',  label: 'High School'  },
    { value: 'diploma',      label: 'Diploma'      },
    { value: 'bachelors',    label: 'Bachelors'    },
    { value: 'masters',      label: 'Masters'      },
    { value: 'phd',          label: 'PhD'          },
    { value: 'professional', label: 'Professional' },
    { value: 'other',        label: 'Other'        },
  ];

  return (
    <div className="card p-4 lg:p-5 lg:sticky lg:top-24 h-fit">

      {/* ===== HEADER / MOBILE TOGGLE ===== */}
      <button
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center justify-between"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="icon-box-sm icon-box-accent">
            <Icons.Filter size={16} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Filters</h3>
            {/* FIX: Help text only shows on mobile */}
            <p className="text-[10px] text-[var(--text-muted)] lg:hidden">
              {isExpanded ? 'Tap to collapse' : 'Tap to expand'}
            </p>
          </div>
        </div>
        {/* FIX: Chevron only shows on mobile — avoids confusing toggle on desktop */}
        <Icons.ChevronDown
          size={16}
          className={`lg:hidden text-[var(--text-muted)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ===== FILTER BODY =====
          Mobile: hidden unless expanded.
          Desktop (lg+): always visible via `lg:block`.
      ===== */}
      <div className={`space-y-5 mt-5 ${isExpanded ? 'block' : 'hidden lg:block'}`}>

        {/* --- Age Range --- */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="label mb-0">Age Range</label>
            <span className="text-xs font-semibold text-[var(--accent-500)]">
              {filters.minAge} – {filters.maxAge}
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1">
                <span>Min age</span><span>{filters.minAge}</span>
              </div>
              <input
                type="range" min="18" max="60"
                value={filters.minAge}
                onChange={e => handleChange('minAge', +e.target.value)}
                className="w-full accent-[var(--accent-500)]"
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1">
                <span>Max age</span><span>{filters.maxAge}</span>
              </div>
              <input
                type="range" min="18" max="60"
                value={filters.maxAge}
                onChange={e => handleChange('maxAge', +e.target.value)}
                className="w-full accent-[var(--accent-500)]"
              />
            </div>
          </div>
        </div>

        {/* --- Looking For --- */}
        <div>
          <label className="label">Looking For</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'male',   label: 'Male'   },
              { value: 'female', label: 'Female' },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleChange('gender', filters.gender === value ? '' : value)}
                className={`py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                  filters.gender === value
                    ? 'bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] text-white shadow-md'
                    : 'card hover:border-[var(--border-accent)] text-[var(--text-secondary)]'
                }`}
              >
                <Icons.User size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* --- Country --- */}
        <div>
          <label className="label">Country (Residence)</label>
          <input
            className="input"
            value={filters.country}
            onChange={e => handleChange('country', e.target.value)}
            placeholder="e.g., Sri Lanka / Canada"
          />
        </div>

        {/* --- Citizenship --- */}
        <div>
          <label className="label">Citizenship (Native)</label>
          <input
            className="input"
            value={filters.citizenship}
            onChange={e => handleChange('citizenship', e.target.value)}
            placeholder="e.g., Sri Lanka"
          />
        </div>

        {/* --- Sri Lankan Abroad Checkbox --- */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.sriLankanAbroad}
            onChange={e => handleChange('sriLankanAbroad', e.target.checked)}
            className="w-4 h-4 rounded accent-[var(--accent-500)]"
          />
          <span className="text-xs text-[var(--text-secondary)]">Sri Lankan native living abroad</span>
        </label>

        {/* --- Religion --- */}
        <div>
          <label className="label">Religion</label>
          <select
            value={filters.religion}
            onChange={e => handleChange('religion', e.target.value)}
            className="select"
          >
            <option value="">Any Religion</option>
            {RELIGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* --- Education --- */}
        <div>
          <label className="label">Education</label>
          <select
            value={filters.education}
            onChange={e => handleChange('education', e.target.value)}
            className="select"
          >
            <option value="">Any Education</option>
            {EDUCATION_OPTIONS.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>

        {/* --- Divider --- */}
        <div className="divider !my-0" />

        {/* --- Action Buttons --- */}
        <div className="space-y-2">
          <button
            onClick={handleApply}
            disabled={loading}
            className="btn-primary w-full justify-center"
          >
            {loading
              ? <span className="spinner-sm" />
              : <Icons.Search size={16} />
            }
            <span>Apply Filters</span>
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            className="btn-secondary w-full justify-center"
          >
            <Icons.RefreshCw size={16} />
            <span>Reset Filters</span>
          </button>
        </div>

      </div>
    </div>
  );
}