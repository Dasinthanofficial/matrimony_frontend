// ===== FILE: ./src/pages/LoginPage.jsx =====
import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { Icons } from '../components/Icons';

export default function LoginPage() {
  return (
    <div className="w-full max-w-md animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] mb-4 sm:mb-6 shadow-lg shadow-[var(--accent-500)]/20">
          <Icons.User size={28} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          Sign in to continue your journey
        </p>
      </div>

      {/* Card */}
      <div className="card p-5 sm:p-8">
        <LoginForm />

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-primary)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-[var(--surface-glass)] text-[var(--text-muted)] rounded-full">
              New here?
            </span>
          </div>
        </div>

        {/* Register link */}
        <Link
          to="/register"
          className="btn-secondary w-full justify-center"
        >
          <Icons.UserPlus size={16} />
          <span>Create an Account</span>
        </Link>
      </div>

      {/* Terms */}
      <p className="text-center text-[10px] sm:text-xs text-[var(--text-muted)] mt-4 sm:mt-6 px-4">
        By signing in, you agree to our{' '}
        <Link to="/terms" className="text-[var(--accent-500)] hover:underline">Terms of Service</Link>
        {' '}&{' '}
        <Link to="/privacy" className="text-[var(--accent-500)] hover:underline">Privacy Policy</Link>
      </p>
    </div>
  );
}