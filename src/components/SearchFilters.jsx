import React, { useState } from 'react';
import { Icons } from './Icons';

export default function SearchFilters({ onFilter, loading }) {
  const [filters, setFilters] = useState({
    minAge: 20, maxAge: 40, gender: '',
    religion: '', education: '', country: '',
    citizenship: '', sriLankanAbroad: false,
  });

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
    onFilter(reset); // Apply the reset filters immediately
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
    <div className="card p-4 lg:p-5">
      <button
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center justify-between lg:pointer-events-none"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="icon-box-sm icon-box-accent">
            <Icons.Filter size={16} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Filters</h3>
            <p className="text-[10px] text-[var(--text-muted)] lg:hidden">
              {isExpanded ? 'Tap to collapse' : 'Tap to expand'}
            </p>
          </div>
        </div>
        <Icons.ChevronDown
          size={16}
          className={`lg:hidden text-[var(--text-muted)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Collapsible filter body */}
      <div className={`space-y-6 mt-6 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        
        {/* --- Age Range --- */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="label !mb-0">Age Range</label>
            <span className="text-sm font-semibold text-[var(--accent-500)]">
              {filters.minAge} – {filters.maxAge}
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                <span>Min age</span><span>{filters.minAge}</span>
              </div>
              <input
                type="range" min="18" max="70"
                value={filters.minAge}
                onChange={e => handleChange('minAge', +e.target.value)}
                className="w-full h-2 bg-[var(--surface-glass-active)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-500)]"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                <span>Max age</span><span>{filters.maxAge}</span>
              </div>
              <input
                type="range" min="18" max="70"
                value={filters.maxAge}
                onChange={e => handleChange('maxAge', +e.target.value)}
                className="w-full h-2 bg-[var(--surface-glass-active)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-500)]"
              />
            </div>
          </div>
        </div>

        {/* --- Looking For --- */}
        <div>
          <label className="label">Looking For</label>
          <div className="grid grid-cols-2 gap-2">
            {[ { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' } ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleChange('gender', filters.gender === value ? '' : value)}
                className={`py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  filters.gender === value
                    ? 'bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] text-white shadow-md'
                    : 'bg-[var(--surface-glass)] border border-[var(--border-primary)] hover:border-[var(--accent-500)]/30 text-[var(--text-secondary)]'
                }`}
              >
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
          <label className="label">Citizenship</label>
          <input
            className="input"
            value={filters.citizenship}
            onChange={e => handleChange('citizenship', e.target.value)}
            placeholder="e.g., Sri Lankan"
          />
        </div>

        {/* --- Sri Lankan Abroad Checkbox --- */}
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[var(--surface-glass)] transition-colors">
          <input
            type="checkbox"
            checked={!!filters.sriLankanAbroad}
            onChange={e => handleChange('sriLankanAbroad', e.target.checked)}
            className="w-4 h-4 rounded accent-[var(--accent-500)] bg-[var(--bg-tertiary)] border-[var(--border-primary)]"
          />
          <span className="text-sm text-[var(--text-secondary)]">Sri Lankan living abroad</span>
        </label>

        {/* --- Religion & Education --- */}
        <div>
          <label className="label">Religion</label>
          <select value={filters.religion} onChange={e => handleChange('religion', e.target.value)} className="select">
            <option value="">Any Religion</option>
            {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Education</label>
          <select value={filters.education} onChange={e => handleChange('education', e.target.value)} className="select">
            <option value="">Any Education</option>
            {EDUCATION_OPTIONS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>
        
        {/* --- Action Buttons --- */}
        <div className="space-y-3 pt-4 border-t border-[var(--border-primary)]">
          <button onClick={handleApply} disabled={loading} className="btn-primary w-full justify-center">
            {loading ? <span className="spinner-sm" /> : <Icons.Search size={16} />}
            <span>Apply Filters</span>
          </button>
          <button onClick={handleReset} disabled={loading} className="btn-secondary w-full justify-center">
            <Icons.RefreshCw size={16} />
            <span>Reset Filters</span>
          </button>
        </div>

      </div>
    </div>
  );
}