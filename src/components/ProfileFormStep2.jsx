// src/components/ProfileFormStep2.jsx
import React from 'react';
import { Icons } from './Icons';

const BODY_TYPES = ['slim', 'average', 'athletic', 'heavy', 'fit'];
const COMPLEXIONS = ['very_fair', 'fair', 'wheatish', 'dark', 'dusky'];
const DIETS = ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain'];
const YES_NO_OPTIONS = ['no', 'occasionally', 'yes', 'never'];

const HOBBIES_OPTIONS = [
  'Reading', 'Traveling', 'Music', 'Movies', 'Cooking', 'Sports',
  'Photography', 'Art', 'Dancing', 'Gaming', 'Yoga', 'Fitness',
  'Gardening', 'Writing', 'Volunteering',
];

export default function ProfileFormStep2({ data, onChange }) {
  const inputStyles = `
    w-full rounded-xl px-4 py-3.5 text-sm transition-all duration-300 outline-none
    bg-[var(--surface-glass)] border border-[var(--border-primary)]
    text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
    hover:border-[var(--border-secondary)] hover:bg-[var(--surface-glass-hover)]
    focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20
  `;

  const selectStyles = `
    ${inputStyles}
    appearance-none cursor-pointer pr-10
    bg-[length:16px_16px] bg-no-repeat bg-[right_1rem_center]
    [&>option]:bg-[var(--bg-secondary)] [&>option]:text-[var(--text-primary)]
  `;

  const labelStyles = "block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-muted)]";
  
  const selectArrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

  const handleHeightChange = (field, value) => {
    const currentHeight = data.height || { feet: 5, inches: 6 };
    onChange('height', {
      ...currentHeight,
      [field]: parseInt(value, 10) || 0,
    });
  };

  const handleHobbyToggle = (hobby) => {
    const currentHobbies = data.hobbies || [];
    onChange(
      'hobbies',
      currentHobbies.includes(hobby)
        ? currentHobbies.filter((h) => h !== hobby)
        : [...currentHobbies, hobby]
    );
  };

  const formatLabel = (value) =>
    value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  // Reusable Option Grid Component
  const OptionGrid = ({ options, value, onChange }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`
            px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-200 capitalize
            ${value === option
              ? 'border-[var(--accent-500)] bg-[var(--accent-500)]/10 text-[var(--accent-500)] shadow-sm'
              : 'border-[var(--border-primary)] bg-[var(--surface-glass)] text-[var(--text-secondary)] hover:border-[var(--border-secondary)] hover:bg-[var(--surface-glass-hover)]'}
          `}
        >
          {formatLabel(option)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[var(--accent-500)]/20">
          <Icons.Activity size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Physical & Lifestyle</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Tell us about yourself and your preferences
          </p>
        </div>
      </div>

      {/* Height & Weight Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Height */}
        <div>
          <label className={labelStyles}>Height</label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <select
                value={data.height?.feet || 5}
                onChange={(e) => handleHeightChange('feet', e.target.value)}
                className={selectStyles}
                style={{ backgroundImage: selectArrow }}
              >
                {[4, 5, 6, 7].map((ft) => (
                  <option key={ft} value={ft}>{ft} ft</option>
                ))}
              </select>
            </div>

            <div className="flex-1 relative">
              <select
                value={data.height?.inches || 0}
                onChange={(e) => handleHeightChange('inches', e.target.value)}
                className={selectStyles}
                style={{ backgroundImage: selectArrow }}
              >
                {[...Array(12).keys()].map((inch) => (
                  <option key={inch} value={inch}>{inch} in</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1.5 ml-1">
            ≈ {Math.round(((data.height?.feet || 5) * 12 + (data.height?.inches || 0)) * 2.54)} cm
          </p>
        </div>

        {/* Weight */}
        <div>
          <label className={labelStyles}>Weight (kg)</label>
          <div className="relative">
            <input
              type="number"
              value={data.weight || ''}
              onChange={(e) => onChange('weight', e.target.value)}
              placeholder="e.g., 65"
              className={inputStyles}
              min="30"
              max="200"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs font-medium pointer-events-none">
              kg
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border-primary)] my-6" />

      {/* Body Type */}
      <div>
        <label className={labelStyles}>Body Type</label>
        <OptionGrid options={BODY_TYPES} value={data.bodyType} onChange={(val) => onChange('bodyType', val)} />
      </div>

      {/* Complexion */}
      <div>
        <label className={labelStyles}>Complexion</label>
        <OptionGrid options={COMPLEXIONS} value={data.complexion} onChange={(val) => onChange('complexion', val)} />
      </div>

      {/* Diet */}
      <div>
        <label className={labelStyles}>Diet</label>
        <OptionGrid options={DIETS} value={data.diet} onChange={(val) => onChange('diet', val)} />
      </div>

      <div className="border-t border-[var(--border-primary)] my-6" />

      {/* Habits Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className={labelStyles}>Smoking Habit</label>
          <div className="grid grid-cols-2 gap-3">
            {YES_NO_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onChange('smoking', option)}
                className={`
                  px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all capitalize
                  ${data.smoking === option
                    ? 'border-[var(--accent-500)] bg-[var(--accent-500)]/10 text-[var(--accent-500)]'
                    : 'border-[var(--border-primary)] bg-[var(--surface-glass)] text-[var(--text-secondary)] hover:border-[var(--border-secondary)]'}
                `}
              >
                {formatLabel(option)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelStyles}>Drinking Habit</label>
          <div className="grid grid-cols-2 gap-3">
            {['no', 'occasionally', 'yes', 'social'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onChange('drinking', option)}
                className={`
                  px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all capitalize
                  ${data.drinking === option
                    ? 'border-[var(--accent-500)] bg-[var(--accent-500)]/10 text-[var(--accent-500)]'
                    : 'border-[var(--border-primary)] bg-[var(--surface-glass)] text-[var(--text-secondary)] hover:border-[var(--border-secondary)]'}
                `}
              >
                {formatLabel(option)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border-primary)] my-6" />

      {/* Hobbies */}
      <div>
        <label className={labelStyles}>
          Hobbies & Interests
          <span className="text-[var(--text-muted)] font-normal ml-2 text-[10px] normal-case">
            ({(data.hobbies || []).length} selected)
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {HOBBIES_OPTIONS.map((hobby) => {
            const isSelected = (data.hobbies || []).includes(hobby);
            return (
              <button
                key={hobby}
                type="button"
                onClick={() => handleHobbyToggle(hobby)}
                className={`
                  px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border
                  ${isSelected
                    ? 'bg-[var(--accent-500)] border-[var(--accent-500)] text-white shadow-md'
                    : 'bg-[var(--surface-glass)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--accent-500)]/50 hover:text-[var(--text-primary)]'}
                `}
              >
                {hobby}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}