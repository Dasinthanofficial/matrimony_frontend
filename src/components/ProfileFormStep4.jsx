// src/components/ProfileFormStep4.jsx
import React, { useMemo } from 'react';
import { Icons } from './Icons';
import { PHONE_COUNTRIES } from '../utils/phoneCountries';

export default function ProfileFormStep4({ data, onChange }) {
  const inputStyles = `
    w-full rounded-xl px-4 py-3.5 text-sm transition-all duration-200
    bg-[var(--surface-glass)] border border-[var(--border-primary)]
    text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
    hover:border-[var(--border-secondary)] hover:bg-[var(--surface-glass-hover)]
    focus:outline-none focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20
  `;

  const labelStyles = 'block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-muted)]';

  const ageRangePresets = [
    { min: 18, max: 25, label: '18-25' },
    { min: 25, max: 30, label: '25-30' },
    { min: 30, max: 35, label: '30-35' },
    { min: 35, max: 40, label: '35-40' },
    { min: 40, max: 50, label: '40-50' },
    { min: 50, max: 60, label: '50-60' },
  ];

  const religionOptions = [
    { value: 'Hindu', label: 'Hindu' },
    { value: 'Muslim', label: 'Muslim' },
    { value: 'Christian', label: 'Christian' },
    { value: 'Sikh', label: 'Sikh' },
    { value: 'Jain', label: 'Jain' },
    { value: 'Buddhist', label: 'Buddhist' },
    { value: 'Parsi', label: 'Parsi' },
    { value: 'Jewish', label: 'Jewish' },
    { value: 'Other', label: 'Other' },
  ];

  const educationOptions = [
    { value: 'high_school', label: 'High School' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'bachelors', label: "Bachelor's Degree" },
    { value: 'masters', label: "Master's Degree" },
    { value: 'phd', label: 'PhD / Doctorate' },
    { value: 'professional', label: 'Professional Degree' },
    { value: 'other', label: 'Other' },
  ];

  const maritalStatusOptions = [
    { value: 'never_married', label: 'Never Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'awaiting_divorce', label: 'Awaiting Divorce' },
    { value: 'annulled', label: 'Annulled' },
  ];

  const toggleArrayValue = (field, value) => {
    const current = data.partnerPreferences?.[field] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    onChange('partnerPreferences', {
      ...data.partnerPreferences,
      [field]: updated,
    });
  };

  const isSelected = (field, value) => {
    return data.partnerPreferences?.[field]?.includes(value) || false;
  };

  const countrySuggestions = useMemo(() => {
    const set = new Set();
    for (const c of PHONE_COUNTRIES) set.add(c.name);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center">
          <Icons.Heart size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Partner Preferences</h2>
          <p className="text-sm text-[var(--text-muted)]">What you're looking for in a partner</p>
        </div>
      </div>

      {/* Age Range Section */}
      <div className="p-5 rounded-2xl bg-[var(--surface-glass)] border border-[var(--border-primary)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icons.Calendar size={16} className="text-[var(--accent-500)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Preferred Age Range</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[var(--accent-500)]/10 text-[var(--accent-500)] text-sm font-semibold">
            {data.partnerPreferences?.ageRange?.min || 18} - {data.partnerPreferences?.ageRange?.max || 35} years
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {ageRangePresets.map((preset) => {
            const isActive =
              data.partnerPreferences?.ageRange?.min === preset.min &&
              data.partnerPreferences?.ageRange?.max === preset.max;

            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  onChange('partnerPreferences', {
                    ...data.partnerPreferences,
                    ageRange: { min: preset.min, max: preset.max },
                  })
                }
                className={`
                  px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] text-white shadow-lg'
                      : 'bg-[var(--surface-glass)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--accent-500)]/50 hover:text-[var(--text-primary)]'
                  }
                `}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--border-primary)]">
          <p className="text-xs text-[var(--text-muted)] mb-3">Or set custom range:</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="18"
              max="70"
              value={data.partnerPreferences?.ageRange?.min || 18}
              onChange={(e) =>
                onChange('partnerPreferences', {
                  ...data.partnerPreferences,
                  ageRange: {
                    ...data.partnerPreferences?.ageRange,
                    min: parseInt(e.target.value, 10) || 18,
                  },
                })
              }
              className={`${inputStyles} w-24 text-center`}
            />
            <span className="text-[var(--text-muted)]">to</span>
            <input
              type="number"
              min="18"
              max="70"
              value={data.partnerPreferences?.ageRange?.max || 35}
              onChange={(e) =>
                onChange('partnerPreferences', {
                  ...data.partnerPreferences,
                  ageRange: {
                    ...data.partnerPreferences?.ageRange,
                    max: parseInt(e.target.value, 10) || 35,
                  },
                })
              }
              className={`${inputStyles} w-24 text-center`}
            />
            <span className="text-[var(--text-muted)] text-sm">years</span>
          </div>
        </div>
      </div>

      {/* Preferred Countries (NEW) */}
      <div>
        <label className={labelStyles}>
          <Icons.Globe size={12} className="inline mr-1" />
          Preferred Countries
          <span className="ml-2 text-[10px] normal-case font-normal">(comma separated)</span>
        </label>

        <div className="relative">
          <Icons.Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            list="pref-countries-list"
            placeholder="e.g., Sri Lanka, Canada, Australia"
            value={data.partnerPreferences?.country?.join(', ') || ''}
            onChange={(e) =>
              onChange('partnerPreferences', {
                ...data.partnerPreferences,
                country: e.target.value
                  .split(',')
                  .map((c) => c.trim())
                  .filter(Boolean),
              })
            }
            className={`${inputStyles} pl-11`}
          />
          <datalist id="pref-countries-list">
            {countrySuggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>

        <p className="text-[10px] text-[var(--text-muted)] mt-2">
          Leave empty to show matches from all countries.
        </p>
      </div>

      {/* Religion Preferences */}
      <div>
        <label className={labelStyles}>
          <Icons.Globe size={12} className="inline mr-1" />
          Preferred Religion(s)
          <span className="ml-2 text-[10px] normal-case font-normal">(Select multiple)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {religionOptions.map((option) => {
            const selected = isSelected('religion', option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleArrayValue('religion', option.value)}
                className={`
                  p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left
                  flex items-center justify-between
                  ${
                    selected
                      ? 'bg-[var(--accent-500)]/10 border border-[var(--accent-500)]/30 text-[var(--accent-500)]'
                      : 'bg-[var(--surface-glass)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--border-secondary)]'
                  }
                `}
              >
                <span>{option.label}</span>
                {selected && <Icons.Check size={14} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Education Preferences */}
      <div>
        <label className={labelStyles}>
          <Icons.GraduationCap size={12} className="inline mr-1" />
          Preferred Education
          <span className="ml-2 text-[10px] normal-case font-normal">(Select multiple)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {educationOptions.map((option) => {
            const selected = isSelected('education', option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleArrayValue('education', option.value)}
                className={`
                  p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left
                  flex items-center justify-between
                  ${
                    selected
                      ? 'bg-[var(--accent-500)]/10 border border-[var(--accent-500)]/30 text-[var(--accent-500)]'
                      : 'bg-[var(--surface-glass)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--border-secondary)]'
                  }
                `}
              >
                <span>{option.label}</span>
                {selected && <Icons.Check size={14} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Marital Status Preferences */}
      <div>
        <label className={labelStyles}>
          <Icons.Heart size={12} className="inline mr-1" />
          Preferred Marital Status
          <span className="ml-2 text-[10px] normal-case font-normal">(Select multiple)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {maritalStatusOptions.map((option) => {
            const selected = isSelected('maritalStatus', option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleArrayValue('maritalStatus', option.value)}
                className={`
                  p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left
                  flex items-center justify-between
                  ${
                    selected
                      ? 'bg-[var(--accent-500)]/10 border border-[var(--accent-500)]/30 text-[var(--accent-500)]'
                      : 'bg-[var(--surface-glass)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--border-secondary)]'
                  }
                `}
              >
                <span>{option.label}</span>
                {selected && <Icons.Check size={14} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred Cities */}
      <div>
        <label className={labelStyles}>
          <Icons.MapPin size={12} className="inline mr-1" />
          Preferred Cities / Locations
          <span className="ml-2 text-[10px] normal-case font-normal">(comma separated)</span>
        </label>
        <div className="relative">
          <Icons.Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="e.g., Colombo, Toronto, Melbourne"
            value={data.partnerPreferences?.city?.join(', ') || ''}
            onChange={(e) =>
              onChange('partnerPreferences', {
                ...data.partnerPreferences,
                city: e.target.value.split(',').map((c) => c.trim()).filter(Boolean),
              })
            }
            className={`${inputStyles} pl-11`}
          />
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-2">
          <Icons.Info size={12} className="inline mr-1" />
          Leave empty to show matches from all locations
        </p>
      </div>

      {/* Summary Card */}
      <div className="p-4 rounded-xl bg-[var(--accent-500)]/5 border border-[var(--accent-500)]/20">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-500)]/10 flex items-center justify-center">
              <Icons.Sparkles size={16} className="text-[var(--accent-500)]" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--accent-500)] mb-1">Preferences Summary</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Age: {data.partnerPreferences?.ageRange?.min || 18}-{data.partnerPreferences?.ageRange?.max || 35} •
              Religion: {data.partnerPreferences?.religion?.length || 0} selected •
              Education: {data.partnerPreferences?.education?.length || 0} selected •
              Countries: {data.partnerPreferences?.country?.length || 0} selected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}