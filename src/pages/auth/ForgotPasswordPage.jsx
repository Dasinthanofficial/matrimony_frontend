import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Icons } from '../../components/Icons';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md card p-8 text-center">
        <Icons.Mail className="mx-auto mb-4 text-[var(--accent-500)]" size={48} />
        <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
        <p className="text-[var(--text-secondary)] mb-6">
          We've sent password reset instructions to {email}
        </p>
        <Link to="/login" className="btn-primary">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md card p-8">
      <h1 className="text-2xl font-bold text-center mb-2">Forgot Password?</h1>
      <p className="text-[var(--text-secondary)] text-center mb-6">
        Enter your email and we'll send you reset instructions
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="you@example.com"
          required
        />
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? <Icons.Loader className="animate-spin mx-auto" size={20} /> : 'Send Reset Link'}
        </button>
      </form>

      <p className="text-center mt-6">
        <Link to="/login" className="text-[var(--accent-500)]">Back to Login</Link>
      </p>
    </div>
  );
}