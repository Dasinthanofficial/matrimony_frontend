// ===== FIXED FILE: ./src/components/ThemeToggle.jsx =====
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Icons } from './Icons';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      // ✅ FIX: Use CSS variables instead of hardcoded white-based colors
      className={`p-2 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-primary)] hover:bg-[var(--surface-glass-hover)] transition-all ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Icons.Sun size={18} className="text-amber-400" />
      ) : (
        <Icons.Moon size={18} className="text-slate-600" />
      )}
    </button>
  );
}