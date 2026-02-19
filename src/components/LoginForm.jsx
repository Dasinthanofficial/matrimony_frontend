import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from './Icons';

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);

  const fromPath = location.state?.from?.pathname || '';
  const fromSearch = location.state?.from?.search || '';
  const from = fromPath ? `${fromPath}${fromSearch}` : '';

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim()) return setFormError('Please enter your email');
    if (!password) return setFormError('Please enter your password');

    try {
      const res = await login(email, password);

      const role = res?.user?.role;
      const isAdmin = role === 'admin' || role === 'superadmin';
      const isAgency = role === 'agency';

      // ✅ FIX: Agencies should NOT go to /dashboard
      if (isAgency) {
        const agencyStatus = res?.user?.agencyVerification?.status || 'none';
        if (agencyStatus !== 'approved') {
          navigate('/agency/pending', { replace: true });
        } else {
          navigate('/agency', { replace: true });
        }
        return;
      }

      if (isAdmin) {
        navigate('/admin', { replace: true });
        return;
      }

      if (from && from !== '/login' && from !== '/register') {
        navigate(from, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setFormError(err?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-shake">
          <Icons.AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{formError}</p>
        </div>
      )}

      {location.state?.message && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3">
          <Icons.Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-400">{location.state.message}</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Email Address
        </label>
        <div className="relative">
          <Icons.Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input pl-11"
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Password
          </label>
          <Link to="/forgot-password" className="text-xs text-[var(--accent-500)] hover:underline font-medium">
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <Icons.Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input pl-11 pr-11"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            tabIndex={-1}
            disabled={loading}
          >
            {showPassword ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
          </button>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <Icons.Loader className="animate-spin" size={18} />
            Signing in...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Icons.LogOut size={18} className="rotate-180" />
            Sign In
          </span>
        )}
      </button>
    </form>
  );
}