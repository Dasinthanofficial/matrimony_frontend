import React from 'react';
import { Icons } from './Icons';

export default function ProfileFormStep1({ data, onChange }) {
  const inputStyles = `
    w-full rounded-xl px-4 py-3.5 text-sm transition-all duration-300 outline-none
    bg-[var(--surface-glass)] border border-[var(--border-primary)]
    text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
    hover:border-[var(--border-secondary)] hover:bg-[var(--surface-glass-hover)]
    focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20
  `;

  const selectStyles = `${inputStyles} appearance-none cursor-pointer pr-10`;
  const labelStyles = "block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-muted)]";
  const requiredStar = <span className="text-red-500 ml-1">*</span>;
  
  const selectArrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center">
          <Icons.User size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Basic Information</h2>
          <p className="text-sm text-[var(--text-muted)]">Tell us about yourself</p>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label className={labelStyles}>
          Full Name {requiredStar}
        </label>
        <input
          type="text"
          value={data.fullName || ''}
          onChange={(e) => onChange('fullName', e.target.value)}
          placeholder="Enter your full name"
          className={inputStyles}
          required
        />
      </div>

      {/* Gender & DOB */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelStyles}>
            Gender {requiredStar}
          </label>
          <select
            value={data.gender || ''}
            onChange={(e) => onChange('gender', e.target.value)}
            className={selectStyles}
            style={{ backgroundImage: selectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className={labelStyles}>
            Date of Birth {requiredStar}
          </label>
          <input
            type="date"
            value={data.dateOfBirth || ''}
            onChange={(e) => onChange('dateOfBirth', e.target.value)}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            min={new Date(new Date().setFullYear(new Date().getFullYear() - 80)).toISOString().split('T')[0]}
            className={inputStyles}
            required
          />
          <p className="text-[10px] text-[var(--text-muted)] mt-1">You must be at least 18 years old</p>
        </div>
      </div>

      {/* Marital Status & Religion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelStyles}>
            Marital Status {requiredStar}
          </label>
          <select
            value={data.maritalStatus || ''}
            onChange={(e) => onChange('maritalStatus', e.target.value)}
            className={selectStyles}
            style={{ backgroundImage: selectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            required
          >
            <option value="">Select Marital Status</option>
            <option value="never_married">Never Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
            <option value="awaiting_divorce">Awaiting Divorce</option>
            <option value="annulled">Annulled</option>
          </select>
        </div>

        <div>
          <label className={labelStyles}>
            Religion {requiredStar}
          </label>
          <select
            value={data.religion || ''}
            onChange={(e) => onChange('religion', e.target.value)}
            className={selectStyles}
            style={{ backgroundImage: selectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            required
          >
            <option value="">Select Religion</option>
            <option value="Hindu">Hindu</option>
            <option value="Muslim">Muslim</option>
            <option value="Christian">Christian</option>
            <option value="Sikh">Sikh</option>
            <option value="Buddhist">Buddhist</option>
            <option value="Jain">Jain</option>
            <option value="Parsi">Parsi</option>
            <option value="Jewish">Jewish</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Mother Tongue & Caste */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelStyles}>Mother Tongue</label>
          <select
            value={data.motherTongue || ''}
            onChange={(e) => onChange('motherTongue', e.target.value)}
            className={selectStyles}
            style={{ backgroundImage: selectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
          >
            <option value="">Select Language (Optional)</option>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
            <option value="Tamil">Tamil</option>
            <option value="Telugu">Telugu</option>
            <option value="Kannada">Kannada</option>
            <option value="Malayalam">Malayalam</option>
            <option value="Bengali">Bengali</option>
            <option value="Marathi">Marathi</option>
            <option value="Gujarati">Gujarati</option>
            <option value="Punjabi">Punjabi</option>
            <option value="Urdu">Urdu</option>
            <option value="Odia">Odia</option>
            <option value="Assamese">Assamese</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className={labelStyles}>Caste</label>
          <input
            type="text"
            value={data.caste || ''}
            onChange={(e) => onChange('caste', e.target.value)}
            placeholder="Enter caste (optional)"
            className={inputStyles}
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className={labelStyles}>
          <Icons.FileText size={12} className="inline mr-1" />
          About Yourself
        </label>
        <textarea
          value={data.bio || ''}
          onChange={(e) => onChange('bio', e.target.value)}
          placeholder="Write a brief introduction about yourself... (optional)"
          rows={4}
          maxLength={1000}
          className={`${inputStyles} resize-none`}
        />
        <p className="text-[10px] text-[var(--text-muted)] mt-1 text-right">
          {(data.bio || '').length}/1000 characters
        </p>
      </div>

      {/* Required Fields Note */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <Icons.Info size={14} className="text-amber-500 flex-shrink-0" />
        <p className="text-xs text-amber-500/80">
          Fields marked with <span className="text-red-500">*</span> are required
        </p>
      </div>
    </div>
  );
}