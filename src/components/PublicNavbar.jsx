// ===== FILE: ./src/components/PublicNavbar.jsx =====
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Icons } from './Icons';

const navLinks = [
  { name: 'Home', path: '/', icon: Icons.Home },
  { name: 'About', path: '/about', icon: Icons.Users },
  { name: 'Pricing', path: '/pricing', icon: Icons.Crown },
  { name: 'Contact', path: '/contact', icon: Icons.Mail },
];

export default function PublicNavbar() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isLight = theme === 'light';
  const isTransparent = !scrolled && !mobileMenuOpen;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navClasses = isTransparent
    ? isLight
      ? 'bg-white/70 backdrop-blur-xl border-b border-black/5 text-[var(--text-primary)]'
      : 'bg-transparent text-white'
    : 'bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border-primary)] shadow-lg shadow-black/5 text-[var(--text-primary)]';

  const LayoutGridIcon = Icons.LayoutGrid || Icons.Grid || Icons.Squares || Icons.AppWindow;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClasses}`}>
        <div className="pt-[env(safe-area-inset-top)]">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12 sm:h-16 lg:h-20 gap-2 flex-nowrap">
              <Link to="/" className="flex items-center gap-2 group flex-shrink-0 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-11 lg:h-11 rounded-xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center shadow-lg shadow-[var(--accent-500)]/25 group-hover:shadow-[var(--accent-500)]/40 transition-all duration-300 group-hover:scale-105">
                    <Icons.Heart size={16} className="text-white sm:hidden" />
                    <Icons.Heart size={18} className="text-white hidden sm:block lg:hidden" />
                    <Icons.Heart size={20} className="text-white hidden lg:block" />
                  </div>
                </div>
                <span className="sr-only">Matrimony</span>
                <span className="hidden sm:inline text-lg lg:text-2xl font-bold truncate">
                  Matri<span className="text-[var(--accent-500)]">mony</span>
                </span>
              </Link>

              <div className="hidden md:flex items-center">
                <div
                  className={`flex items-center gap-1 p-1.5 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
                    isTransparent
                      ? isLight
                        ? 'bg-white/70 border-black/10'
                        : 'bg-white/[0.08] border-white/[0.12]'
                      : 'bg-[var(--surface-glass)] border-[var(--border-primary)]'
                  }`}
                >
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={({ isActive }) => `
                        relative px-4 lg:px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                        ${
                          isActive
                            ? 'text-white'
                            : isTransparent
                              ? isLight
                                ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                : 'text-white/70 hover:text-white'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] shadow-lg shadow-[var(--accent-500)]/25" />
                          )}
                          <span className="relative">{link.name}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <button
                  onClick={toggleTheme}
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center
                    transition-all duration-300
                    ${
                      isTransparent
                        ? isLight
                          ? 'bg-black/5 border border-black/10 hover:bg-black/10 text-slate-900'
                          : 'bg-white/[0.15] backdrop-blur-md border border-white/[0.25] hover:bg-white/[0.25] text-white'
                        : 'bg-[var(--surface-glass)] border border-[var(--border-primary)] hover:bg-[var(--surface-glass-hover)] text-[var(--text-primary)]'
                    }
                  `}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Icons.Sun size={16} className="text-amber-400" />
                  ) : (
                    <Icons.Moon size={16} className={isTransparent && !isLight ? 'text-white' : 'text-slate-600'} />
                  )}
                </button>

                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="hidden sm:flex items-center gap-2 px-4 lg:px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] text-white text-sm font-semibold shadow-lg shadow-[var(--accent-500)]/25 hover:shadow-[var(--accent-500)]/40 hover:scale-105 transition-all duration-300"
                  >
                    {LayoutGridIcon ? <LayoutGridIcon size={16} /> : null}
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className={`hidden sm:flex px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isTransparent
                          ? isLight
                            ? 'text-[var(--text-secondary)] hover:bg-black/5'
                            : 'text-white/90 hover:bg-white/10'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-glass-hover)]'
                      }`}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="hidden sm:flex items-center gap-2 px-4 lg:px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] text-white text-sm font-semibold shadow-lg shadow-[var(--accent-500)]/25 hover:shadow-[var(--accent-500)]/40 hover:scale-105 transition-all duration-300"
                    >
                      <Icons.UserPlus size={16} />
                      <span>Get Started</span>
                    </Link>
                  </>
                )}

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`
                    md:hidden w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center
                    transition-all duration-300
                    ${
                      isTransparent
                        ? isLight
                          ? 'bg-black/5 border border-black/20 hover:bg-black/10 text-slate-900'
                          : 'bg-white/[0.15] backdrop-blur-md border border-white/[0.30] hover:bg-white/[0.25] text-white'
                        : 'bg-[var(--surface-glass)] border border-[var(--border-primary)] hover:bg-[var(--surface-glass-hover)] text-[var(--text-primary)]'
                    }
                  `}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <Icons.X size={20} strokeWidth={2.2} className="text-current" />
                  ) : (
                    <Icons.Menu size={20} strokeWidth={2.2} className="text-current" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Mobile Menu Overlay ===== */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${mobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          className={`absolute top-[calc(3rem+env(safe-area-inset-top))] sm:top-[calc(4rem+env(safe-area-inset-top))] left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ${
            mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="m-4 p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const LinkIcon = link.icon || Icons.Circle;
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[var(--accent-500)]/15 to-transparent text-[var(--accent-500)] border border-[var(--accent-500)]/20'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-glass-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {LinkIcon ? <LinkIcon size={18} className={isActive ? 'text-[var(--accent-500)]' : ''} /> : null}
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="my-4 h-px bg-[var(--border-primary)]" />

            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--surface-glass-hover)]"
                >
                  <Icons.Lock size={16} />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] text-white text-sm font-semibold"
                >
                  <Icons.UserPlus size={16} />
                  <span>Register</span>
                </Link>
              </div>
            ) : (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] text-white text-sm font-semibold"
              >
                {LayoutGridIcon ? <LayoutGridIcon size={16} /> : null}
                <span>Go to Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}