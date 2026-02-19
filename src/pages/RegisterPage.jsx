import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    const result = await register(formData);

    const role = result?.user?.role || result?.role;
    const agencyStatus = result?.user?.agencyVerification?.status;

    if (role === 'agency') {
  if (agencyStatus === 'pending' || result?.requiresAdminApproval) {
    navigate('/agency/pending', { replace: true });
  } else {
    navigate('/agency', { replace: true }); // ✅
  }
  return;
}
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="w-full max-w-md animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] mb-4 sm:mb-6 shadow-lg shadow-[var(--accent-500)]/20">
          <Icons.UserPlus size={28} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          Join thousands finding their perfect match
        </p>
      </div>

      {/* Card */}
      <div className="card p-5 sm:p-8 space-y-5">
        {/* Language selection lives ONLY inside RegisterForm now */}
        <RegisterForm onSubmit={handleRegister} />

        {/* Divider */}
        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-primary)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-[var(--surface-glass)] text-[var(--text-muted)] rounded-full">
              Already a member?
            </span>
          </div>
        </div>

        {/* Login link */}
        <Link to="/login" className="btn-secondary w-full justify-center">
          <Icons.LogOut size={16} className="rotate-180" />
          <span>Sign In Instead</span>
        </Link>
      </div>

      {/* Terms */}
      <p className="text-center text-[10px] sm:text-xs text-[var(--text-muted)] mt-4 sm:mt-6 px-4">
        By creating an account, you agree to our{' '}
        <Link to="/terms" className="text-[var(--accent-500)] hover:underline">
          Terms of Service
        </Link>{' '}
        &amp;{' '}
        <Link to="/privacy" className="text-[var(--accent-500)] hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}