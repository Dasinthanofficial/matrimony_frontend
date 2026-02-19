import React from 'react';

const BODY_TYPES = ['slim', 'average', 'athletic', 'heavy', 'fit'];
const COMPLEXIONS = ['very_fair', 'fair', 'wheatish', 'dark', 'dusky'];
const DIETS = ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain', 'pescatarian'];
const YES_NO_OPTIONS = ['no', 'occasionally', 'yes', 'never'];

const HOBBIES_OPTIONS = [
  'Reading', 'Traveling', 'Music', 'Movies', 'Cooking', 'Sports',
  'Photography', 'Art', 'Dancing', 'Gaming', 'Yoga', 'Fitness',
  'Gardening', 'Writing', 'Volunteering',
];

export default function ProfileFormStep2({ data, onChange }) {
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Physical & Lifestyle</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Tell us about yourself and your lifestyle preferences
        </p>
      </div>

      {/* Height */}
      <div>
        <label className="block text-sm font-medium mb-3">Height</label>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs text-[var(--text-muted)] mb-1">Feet</label>
            <select
              value={data.height?.feet || 5}
              onChange={(e) => handleHeightChange('feet', e.target.value)}
              className="select w-full"
            >
              {[4, 5, 6, 7].map((ft) => (
                <option key={ft} value={ft}>{ft} ft</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs text-[var(--text-muted)] mb-1">Inches</label>
            <select
              value={data.height?.inches || 6}
              onChange={(e) => handleHeightChange('inches', e.target.value)}
              className="select w-full"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((inch) => (
                <option key={inch} value={inch}>{inch} in</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          ≈ {Math.round(((data.height?.feet || 5) * 12 + (data.height?.inches || 6)) * 2.54)} cm
        </p>
      </div>

      {/* Weight */}
      <div>
        <label className="block text-sm font-medium mb-2">Weight (kg)</label>
        <input
          type="number"
          value={data.weight || ''}
          onChange={(e) => onChange('weight', e.target.value)}
          placeholder="e.g., 65"
          className="input w-full"
          min="30"
          max="200"
        />
      </div>

      {/* Body Type */}
      <div>
        <label className="block text-sm font-medium mb-3">Body Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BODY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange('bodyType', type)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                data.bodyType === type
                  ? 'border-[var(--accent-500)] bg-[var(--accent-500)]/10 text-[var(--accent-500)]'
                  : 'border-[var(--border-primary)] hover:border-[var(--accent-500)]/50'
              }`}
            >
              {formatLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Complexion */}
      <div>
        <label className="block text-sm font-medium mb-3">Complexion</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COMPLEXIONS.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange('complexion', type)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                data.complexion === type
                  ? 'border-[var(--accent-500)] bg-[var(--accent-500)]/10 text-[var(--accent-500)]'
                  : 'border-[var(--border-primary)] hover:border-[var(--accent-500)]/50'
              }`}
            >
              {formatLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Diet */}
      <div>
        <label className="block text-sm font-medium mb-3">Diet</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DIETS.map((diet) => (
            <button
              key={diet}
              type="button"
              onClick={() => onChange('diet', diet)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                data.diet === diet
                  ? 'border-[var(--accent-500)] bg-[var(--accent-500)]/10 text-[var(--accent-500)]'
                  : 'border-[var(--border-primary)] hover:border-[var(--accent-500)]/50'
              }`}
            >
              {formatLabel(diet)}
            </button>
          ))}
        </div>
      </div>

      {/* Smoking */}
      <div>
        <label className="block text-sm font-medium mb-3">Smoking</label>
        <div className="grid grid-cols-3 gap-3">
          {YES_NO_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange('smoking', option)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                data.smoking === option
                  ? 'border-[var(--accent-500)] bg-[var(--accent-500)]/10 text-[var(--accent-500)]'
                  : 'border-[var(--border-primary)] hover:border-[var(--accent-500)]/50'
              }`}
            >
              {formatLabel(option)}
            </button>
          ))}
        </div>
      </div>

      {/* Drinking */}
      <div>
        <label className="block text-sm font-medium mb-3">Drinking</label>
        <div className="grid grid-cols-3 gap-3">
          {['no', 'occasionally', 'yes', 'never', 'social'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange('drinking', option)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                data.drinking === option
                  ? 'border-[var(--accent-500)] bg-[var(--accent-500)]/10 text-[var(--accent-500)]'
                  : 'border-[var(--border-primary)] hover:border-[var(--accent-500)]/50'
              }`}
            >
              {formatLabel(option)}
            </button>
          ))}
        </div>
      </div>

      {/* Hobbies */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Hobbies & Interests
          <span className="text-[var(--text-muted)] font-normal ml-2">
            ({(data.hobbies || []).length} selected)
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {HOBBIES_OPTIONS.map((hobby) => (
            <button
              key={hobby}
              type="button"
              onClick={() => handleHobbyToggle(hobby)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                (data.hobbies || []).includes(hobby)
                  ? 'bg-[var(--accent-500)] text-white'
                  : 'bg-[var(--surface-glass)] hover:bg-[var(--accent-500)]/20'
              }`}
            >
              {hobby}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}