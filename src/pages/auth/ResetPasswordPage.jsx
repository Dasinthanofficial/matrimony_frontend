import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Icons } from '../../components/Icons';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      navigate('/login', { state: { message: 'Password reset successful' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md card p-8">
      <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
      {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="New Password" required minLength={6} />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" placeholder="Confirm Password" required />
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? <Icons.Loader className="animate-spin mx-auto" size={20} /> : 'Reset Password'}
        </button>
      </form>
      <p className="text-center mt-6"><Link to="/login" className="text-[var(--accent-500)]">Back to Login</Link></p>
    </div>
  );
}