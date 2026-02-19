import React, { useState } from 'react';
import { Icons } from './Icons';

export default function SearchFilters({ onFilter, loading }) {
  const [filters, setFilters] = useState({
    minAge: 20,
    maxAge: 40,
    gender: '',
    religion: '',
    education: '',
    country: '',
    citizenship: '',
    sriLankanAbroad: false,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (field, value) => {
    setFilters((f) => {
      if (field === 'minAge') {
        const minAge = value;
        const maxAge = Math.max(value, f.maxAge);
        return { ...f, minAge, maxAge };
      }
      if (field === 'maxAge') {
        const maxAge = value;
        const minAge = Math.min(value, f.minAge);
        return { ...f, minAge, maxAge };
      }
      return { ...f, [field]: value };
    });
  };

  const handleApply = () => onFilter(filters);
  const handleReset = () => {
    const reset = {
      minAge: 20,
      maxAge: 40,
      gender: '',
      religion: '',
      education: '',
      country: '',
      citizenship: '',
      sriLankanAbroad: false,
    };
    setFilters(reset);
    onFilter(reset);
  };

  const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];

  const EDUCATION_OPTIONS = [
    { value: 'high_school', label: 'High School' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'bachelors', label: 'Bachelors' },
    { value: 'masters', label: 'Masters' },
    { value: 'phd', label: 'PhD' },
    { value: 'professional', label: 'Professional' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="card p-4 lg:p-5 lg:sticky lg:top-24">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="icon-box-sm icon-box-accent">
            <Icons.Filter size={16} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold">Filters</h3>
            <p className="text-[10px] text-[var(--text-muted)]">Refine your search</p>
          </div>
        </div>
        <Icons.ChevronDown 
          size={16} 
          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </button>

      <div className={`space-y-5 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Age Range */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="label mb-0">Age Range</label>
            <span className="text-xs font-medium text-[var(--accent-500)]">
              {filters.minAge} - {filters.maxAge}
            </span>
          </div>
          <div className="space-y-3">
            <input 
              type="range" 
              min="18" max="60" 
              value={filters.minAge} 
              onChange={e => handleChange('minAge', +e.target.value)} 
              className="w-full accent-[var(--accent-500)]" 
            />
            <input 
              type="range" 
              min="18" max="60" 
              value={filters.maxAge} 
              onChange={e => handleChange('maxAge', +e.target.value)} 
              className="w-full accent-[var(--accent-500)]" 
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="label">Looking For</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'male', label: 'Male', icon: Icons.User },
              { value: 'female', label: 'Female', icon: Icons.User }
            ].map(({ value, label, icon: IconComponent }) => (
              <button
                key={value}
                onClick={() => handleChange('gender', filters.gender === value ? '' : value)}
                className={`py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                  filters.gender === value 
                    ? 'bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] text-white' 
                    : 'card hover:border-[var(--border-accent)]'
                }`}
              >
                <IconComponent size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="label">Country (Residence)</label>
          <input
            className="input"
            value={filters.country}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder="e.g., Sri Lanka / Canada"
          />
        </div>

        {/* Citizenship */}
        <div>
          <label className="label">Citizenship (Native)</label>
          <input
            className="input"
            value={filters.citizenship}
            onChange={(e) => handleChange('citizenship', e.target.value)}
            placeholder="e.g., Sri Lanka"
          />
        </div>

        {/* Sri Lankan Abroad */}
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={!!filters.sriLankanAbroad}
            onChange={(e) => handleChange('sriLankanAbroad', e.target.checked)}
          />
          Sri Lankan native living abroad
        </label>

        {/* Religion */}
        <div>
          <label className="label">Religion</label>
          <select 
            value={filters.religion} 
            onChange={e => handleChange('religion', e.target.value)} 
            className="select"
          >
            <option value="">Any Religion</option>
            {RELIGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Education */}
        <div>
          <label className="label">Education</label>
          <select 
            value={filters.education} 
            onChange={e => handleChange('education', e.target.value)} 
            className="select"
          >
            <option value="">Any Education</option>
            {EDUCATION_OPTIONS.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>

        <div className="divider" />

        {/* Actions */}
        <div className="space-y-2">
          <button 
            onClick={handleApply} 
            disabled={loading} 
            className="btn-primary w-full"
          >
            {loading ? <span className="spinner-sm" /> : <Icons.Search size={16} />}
            <span>Apply Filters</span>
          </button>
          <button 
            onClick={handleReset} 
            disabled={loading} 
            className="btn-ghost w-full"
          >
            <Icons.RefreshCw size={16} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}