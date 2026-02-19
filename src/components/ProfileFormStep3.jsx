// src/components/ProfileFormStep3.jsx
import React, { useMemo } from 'react';
import { Icons } from './Icons';
import { PHONE_COUNTRIES } from '../utils/phoneCountries';

const EDUCATION_OPTIONS = [
  { value: 'high_school', label: 'High School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'phd', label: 'PhD / Doctorate' },
  { value: 'professional', label: 'Professional Degree' },
  { value: 'other', label: 'Other' },
];

const EMPLOYMENT_TYPES = [
  { value: 'employed', label: 'Employed (Private)' },
  { value: 'government', label: 'Government Job' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'business', label: 'Business Owner' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'student', label: 'Student' },
  { value: 'not_working', label: 'Not Working' },
];

// ✅ Monthly income options (Sri Lanka-friendly ranges)
// Values are identifiers; backend stores as string range.
const MONTHLY_INCOME_OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'below_50k', label: 'Below Rs 50,000' },
  { value: '50k_100k', label: 'Rs 50,000 – 100,000' },
  { value: '100k_200k', label: 'Rs 100,000 – 200,000' },
  { value: '200k_300k', label: 'Rs 200,000 – 300,000' },
  { value: '300k_500k', label: 'Rs 300,000 – 500,000' },
  { value: 'above_500k', label: 'Above Rs 500,000' },
  { value: 'not_disclosed', label: 'Not disclosed' },
];

const RESIDENCY_OPTIONS = [
  { value: '', label: 'Select (optional)' },
  { value: 'citizen', label: 'Citizen' },
  { value: 'permanent_resident', label: 'Permanent Resident' },
  { value: 'work_permit', label: 'Work Permit' },
  { value: 'student_visa', label: 'Student Visa' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'other', label: 'Other' },
];

export default function ProfileFormStep3({ data, onChange }) {
  const inputStyles = `
    w-full rounded-xl px-4 py-3.5 text-sm transition-all duration-200
    bg-[var(--surface-glass)] border border-[var(--border-primary)]
    text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
    hover:border-[var(--border-secondary)] hover:bg-[var(--surface-glass-hover)]
    focus:outline-none focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/20
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const selectStyles = `
    ${inputStyles}
    appearance-none cursor-pointer
    bg-[length:16px_16px] bg-no-repeat bg-[right_12px_center]
  `;

  const labelStyles =
    'block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--text-muted)]';

  const selectArrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

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
          <Icons.MapPin size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Location & Career</h2>
          <p className="text-sm text-[var(--text-muted)]">Where you live and what you do</p>
        </div>
      </div>

      {/* Location Section */}
      <div className="p-5 rounded-2xl bg-[var(--surface-glass)] border border-[var(--border-primary)]">
        <div className="flex items-center gap-2 mb-4">
          <Icons.Globe size={16} className="text-[var(--accent-500)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Current Location</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Country */}
          <div>
            <label className={labelStyles}>
              Country <span className="text-[var(--accent-500)]">*</span>
            </label>
            <div className="relative">
              <Icons.Flag
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                list="countries-list"
                value={data.country || ''}
                onChange={(e) => onChange('country', e.target.value)}
                placeholder="e.g., Sri Lanka, Canada, Australia"
                className={`${inputStyles} pl-11`}
              />
              <datalist id="countries-list">
                {countrySuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Tip: Sri Lankan living abroad → set <b>Citizenship = Sri Lanka</b> and Country = your
              current country.
            </p>
          </div>

          {/* State / Province */}
          <div>
            <label className={labelStyles}>State / Province</label>
            <div className="relative">
              <Icons.Map
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                value={data.state || ''}
                onChange={(e) => onChange('state', e.target.value)}
                placeholder="e.g., Western Province / Ontario"
                className={`${inputStyles} pl-11`}
              />
            </div>
          </div>

          {/* City */}
          <div className="md:col-span-2">
            <label className={labelStyles}>
              City <span className="text-[var(--accent-500)]">*</span>
            </label>
            <div className="relative">
              <Icons.Building
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                value={data.city || ''}
                onChange={(e) => onChange('city', e.target.value)}
                placeholder="e.g., Colombo / Toronto"
                className={`${inputStyles} pl-11`}
              />
            </div>
          </div>

          {/* Citizenship */}
          <div>
            <label className={labelStyles}>Citizenship / Nationality</label>
            <div className="relative">
              <Icons.UserCheck
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                value={data.citizenship || ''}
                onChange={(e) => onChange('citizenship', e.target.value)}
                placeholder="e.g., Sri Lanka"
                className={`${inputStyles} pl-11`}
              />
            </div>
          </div>

          {/* Residency Status */}
          <div>
            <label className={labelStyles}>Residency Status</label>
            <div className="relative">
              <Icons.BadgeCheck
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10"
              />
              <select
                value={data.residencyStatus || ''}
                onChange={(e) => onChange('residencyStatus', e.target.value)}
                className={`${selectStyles} pl-11`}
                style={{ backgroundImage: selectArrow }}
              >
                {RESIDENCY_OPTIONS.map((o) => (
                  <option key={o.value || '__empty'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Education & Career Section */}
      <div className="p-5 rounded-2xl bg-[var(--surface-glass)] border border-[var(--border-primary)]">
        <div className="flex items-center gap-2 mb-4">
          <Icons.GraduationCap size={16} className="text-[var(--accent-500)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            Education & Career
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Education */}
          <div>
            <label className={labelStyles}>
              Highest Education <span className="text-[var(--accent-500)]">*</span>
            </label>
            <div className="relative">
              <Icons.Award
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10"
              />
              <select
                value={data.education || ''}
                onChange={(e) => onChange('education', e.target.value)}
                className={`${selectStyles} pl-11`}
                style={{ backgroundImage: selectArrow }}
              >
                <option value="">Select education</option>
                {EDUCATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Education Field */}
          <div>
            <label className={labelStyles}>Field of Study</label>
            <div className="relative">
              <Icons.BookOpen
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                value={data.educationField || ''}
                onChange={(e) => onChange('educationField', e.target.value)}
                placeholder="e.g., IT / Business / Engineering"
                className={`${inputStyles} pl-11`}
              />
            </div>
          </div>

          {/* Occupation */}
          <div>
            <label className={labelStyles}>
              Occupation <span className="text-[var(--accent-500)]">*</span>
            </label>
            <div className="relative">
              <Icons.Briefcase
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                value={data.occupation || ''}
                onChange={(e) => onChange('occupation', e.target.value)}
                placeholder="e.g., Software Engineer"
                className={`${inputStyles} pl-11`}
              />
            </div>
          </div>

          {/* Employment Type */}
          <div>
            <label className={labelStyles}>Employment Type</label>
            <div className="relative">
              <Icons.Building2
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10"
              />
              <select
                value={data.employmentType || ''}
                onChange={(e) => onChange('employmentType', e.target.value)}
                className={`${selectStyles} pl-11`}
                style={{ backgroundImage: selectArrow }}
              >
                <option value="">Select type</option>
                {EMPLOYMENT_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Company */}
          <div>
            <label className={labelStyles}>Company / Organization</label>
            <div className="relative">
              <Icons.Landmark
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                value={data.company || ''}
                onChange={(e) => onChange('company', e.target.value)}
                placeholder="e.g., Company name"
                className={`${inputStyles} pl-11`}
              />
            </div>
          </div>

          {/* ✅ Monthly Income */}
          <div>
            <label className={labelStyles}>Monthly Income</label>
            <div className="relative">
              <Icons.Wallet
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10"
              />
              <select
                value={data.monthlyIncome || ''}
                onChange={(e) => onChange('monthlyIncome', e.target.value)}
                className={`${selectStyles} pl-11`}
                style={{ backgroundImage: selectArrow }}
              >
                {MONTHLY_INCOME_OPTIONS.map((o) => (
                  <option key={o.value || '__empty'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* optional: keep legacy annualIncome hidden but preserved if already set */}
            {/* <input type="hidden" value={data.annualIncome || ''} readOnly /> */}
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Icons.Info size={16} className="text-blue-500" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-500 mb-1">Privacy Note</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Your exact income is never shown. Only the range is displayed (and only if you enable
              income visibility in your privacy settings).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}