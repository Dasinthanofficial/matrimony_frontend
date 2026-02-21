// src/components/RegisterForm.jsx
import React, { useMemo, useState } from 'react';
import { Icons } from './Icons';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';

const isoToFlagEmoji = (iso2) => {
  if (!iso2 || iso2.length !== 2) return '';
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const displayNames =
  typeof Intl !== 'undefined' && Intl.DisplayNames ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;

const ALL_COUNTRY_OPTIONS = getCountries()
  .map((iso2) => ({
    iso2,
    callingCode: `+${getCountryCallingCode(iso2)}`,
    name: displayNames?.of(iso2) || iso2,
    flag: isoToFlagEmoji(iso2),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function RegisterForm({ onSubmit }) {
  const [role, setRole] = useState('user'); // user | agency
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryIso2, setCountryIso2] = useState('LK');

  // agency KYC
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [nicFront, setNicFront] = useState(null);
  const [nicBack, setNicBack] = useState(null);
  const [businessReg, setBusinessReg] = useState(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  const countryCode = useMemo(() => {
    try {
      return `+${getCountryCallingCode(countryIso2)}`;
    } catch {
      return '+94';
    }
  }, [countryIso2]);

  const selectedCountry = useMemo(
    () => ALL_COUNTRY_OPTIONS.find((c) => c.iso2 === countryIso2) || ALL_COUNTRY_OPTIONS[0],
    [countryIso2]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const hasEmail = !!email.trim();
    const hasPhone = !!phone.trim();

    if (!fullName.trim()) return setError(role === 'agency' ? 'Agency name is required' : 'Full name is required');

    if (!hasEmail) return setError('Email is required');
    if (!email.includes('@')) return setError('Please enter a valid email');

    if (role === 'agency') {
      if (!hasPhone) return setError('Agency mobile number is required');
      if (phone.replace(/\D/g, '').length < 6) return setError('Please enter a valid phone number');
    } else if (hasPhone && phone.replace(/\D/g, '').length < 6) {
      return setError('Please enter a valid phone number');
    }

    if (!password || password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');

    if (role === 'agency') {
      if (!dob) return setError('Date of birth is required');
      if (!gender) return setError('Gender is required');
      if (!currentAddress.trim()) return setError('Current address is required');
      if (!nicFront || !nicBack) return setError('NIC front and back images are required');
      if (!businessReg) return setError('Business registration certificate is required');
    }

    const fd = new FormData();
    fd.append('role', role);
    fd.append('fullName', fullName.trim());
    fd.append('password', password);
    fd.append('email', email.trim());

    if (hasPhone) {
      fd.append('phone', phone.replace(/\D/g, ''));
      fd.append('countryCode', countryCode);
    }

    if (role === 'agency') {
      fd.append('dateOfBirth', dob);
      fd.append('gender', gender);
      fd.append('currentAddress', currentAddress.trim());
      fd.append('nicFront', nicFront);
      fd.append('nicBack', nicBack);
      fd.append('businessReg', businessReg);
    }

    setLoading(true);
    try {
      await onSubmit?.(fd);
    } catch (err) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <Icons.AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Role */}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={role === 'user' ? 'btn-primary' : 'btn-secondary'} onClick={() => setRole('user')} disabled={loading}>
          User
        </button>
        <button type="button" className={role === 'agency' ? 'btn-primary' : 'btn-secondary'} onClick={() => setRole('agency')} disabled={loading}>
          Agency
        </button>
      </div>

      {/* Name */}
      <div>
        <label className="label">{role === 'agency' ? 'Agency Name' : 'Full Name'} *</label>
        <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} />
      </div>

      {/* Email */}
      <div>
        <label className="label">Email *</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
      </div>

      {/* Phone */}
      <div>
        <label className="label">Phone {role === 'agency' ? '*' : '(optional)'}</label>
        <div className="flex items-stretch rounded-2xl border border-[var(--border-primary)] bg-[var(--surface-glass)] overflow-hidden">
          <label className="relative flex items-center gap-2 px-3 border-r border-[var(--border-primary)]">
            <span className="text-sm leading-none pointer-events-none">{selectedCountry.flag}</span>
            <span className="text-sm font-medium pointer-events-none">{selectedCountry.callingCode}</span>
            <Icons.ChevronDown size={12} className="text-[var(--text-muted)] pointer-events-none" />
            <select
              value={countryIso2}
              onChange={(e) => setCountryIso2(e.target.value)}
              disabled={loading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Country code"
            >
              {ALL_COUNTRY_OPTIONS.map((c) => (
                <option key={c.iso2} value={c.iso2}>
                  {c.flag} {c.callingCode} — {c.name}
                </option>
              ))}
            </select>
          </label>

          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            className="flex-1 min-w-0 px-3.5 py-3.5 bg-transparent outline-none"
            placeholder="Enter phone number"
            disabled={loading}
          />
        </div>
      </div>

      {/* Agency KYC */}
      {role === 'agency' && (
        <div className="card p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Date of Birth *</label>
              <input className="input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} disabled={loading} />
            </div>
            <div>
              <label className="label">Gender *</label>
              <select className="select" value={gender} onChange={(e) => setGender(e.target.value)} disabled={loading}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Current Address *</label>
            <textarea className="textarea" rows={3} value={currentAddress} onChange={(e) => setCurrentAddress(e.target.value)} disabled={loading} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">NIC Front *</label>
              <input className="input" type="file" accept="image/*" onChange={(e) => setNicFront(e.target.files?.[0] || null)} disabled={loading} />
            </div>
            <div>
              <label className="label">NIC Back *</label>
              <input className="input" type="file" accept="image/*" onChange={(e) => setNicBack(e.target.files?.[0] || null)} disabled={loading} />
            </div>
          </div>

          <div>
            <label className="label">Business Registration Certificate *</label>
            <input className="input" type="file" onChange={(e) => setBusinessReg(e.target.files?.[0] || null)} disabled={loading} />
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            Agency accounts require admin approval before you can add multiple profiles.
          </p>
        </div>
      )}

      {/* Password */}
      <div>
        <label className="label">Password *</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
      </div>

      <div>
        <label className="label">Confirm Password *</label>
        <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
        {passwordsMismatch && <p className="text-xs text-red-400 mt-1">Passwords do not match</p>}
      </div>

      <button type="submit" className="btn-primary w-full" disabled={loading || passwordsMismatch}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}