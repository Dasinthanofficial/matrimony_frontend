import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Icons } from '../components/Icons';

export default function AuthLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    // Changed overflow-hidden to overflow-x-hidden to allow vertical scrolling
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col relative overflow-x-hidden">
      {/* Background effects — shared across all auth pages */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-[var(--accent-500)]/8 blur-[100px] sm:blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-[var(--accent-700)]/8 blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-[var(--accent-500)]/5 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Icons.Heart size={16} className="text-white" />
          </div>
          <span className="text-xl sm:text-2xl font-bold">
            Matri<span className="text-[var(--accent-500)]">mony</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-primary)] hover:bg-[var(--surface-glass-hover)] transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Icons.Sun size={18} className="text-amber-400" />
            ) : (
              <Icons.Moon size={18} />
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      {/* Changed centering logic: use flex-col and let child use margin-auto to avoid clipping top on overflow */}
      <main className="relative z-10 flex-1 flex flex-col p-4 sm:p-6">
        <div className="w-full m-auto flex justify-center">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center">
        <p className="text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} Matrimony. All rights reserved.
        </p>
      </footer>
    </div>
  );
}