import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI, userAPI } from '../services/api';
import { Icons } from '../components/Icons';
import i18n, { normalizeLang, persistLanguage } from '../i18n';

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isAgency = user?.role === 'agency';

  const [loading, setLoading] = useState(false);

  // delete account UI
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Language state
  const initialLang = useMemo(() => {
    return normalizeLang(user?.preferredLanguage || localStorage.getItem('i18nextLng') || i18n.language || 'en');
  }, [user?.preferredLanguage]);

  const [lang, setLang] = useState(initialLang);
  const [savingLang, setSavingLang] = useState(false);

  const saveLanguage = async () => {
    try {
      setSavingLang(true);
      const next = normalizeLang(lang);

      await userAPI.updateMyLanguage(next);

      persistLanguage(next);
      await i18n.changeLanguage(next);

      await refreshUser();
      alert('Language updated');
    } catch (e) {
      alert(e?.message || 'Failed to update language');
    } finally {
      setSavingLang(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      setDeleteError('Password is required');
      return;
    }

    setLoading(true);
    setDeleteError('');
    try {
      await authAPI.deleteAccount(deletePassword);
      await logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-box-md icon-box-accent">
              <Icons.Settings size={20} />
            </div>
            <div>
              <h1 className="heading-md">Settings</h1>
              <p className="text-sm text-[var(--text-muted)]">Manage your account preferences</p>
            </div>
          </div>
          <Link to={isAgency ? '/agency' : '/dashboard'} className="btn-secondary">
            <Icons.ChevronLeft size={16} />
            <span>Back</span>
          </Link>
        </div>
      </header>

      <div className="space-y-6">
        {/* Language */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Icons.Languages size={16} className="text-[var(--accent-500)]" />
            Language
          </h3>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="font-medium mb-1">Preferred Language</p>
              <p className="text-sm text-[var(--text-muted)]">
                This will be used across your account after login.
              </p>
            </div>

            <div className="flex gap-3 sm:items-center">
              <select className="select" value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="en">English</option>
                <option value="si">සිංහල</option>
                <option value="ta">தமிழ்</option>
              </select>

              <button onClick={saveLanguage} disabled={savingLang} className="btn-primary">
                {savingLang ? <Icons.Loader size={16} className="animate-spin" /> : <Icons.Check size={16} />}
                <span>{savingLang ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Icons.User size={16} className="text-[var(--accent-500)]" />
            Account
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
              </div>
              <span className="badge-success">{user?.isEmailVerified ? 'Verified' : 'Unverified'}</span>
            </div>
            <div className="divider" />
            <Link to="/forgot-password" className="btn-secondary w-full justify-center">
              <Icons.Lock size={16} />
              <span>Change Password</span>
            </Link>
          </div>
        </div>

        {/* Appearance */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Icons.Sun size={16} className="text-[var(--accent-500)]" />
            Appearance
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-[var(--text-muted)]">Choose your preferred theme</p>
            </div>
            <button onClick={toggleTheme} className="btn-secondary">
              {theme === 'dark' ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>

        {/* ✅ Privacy */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Icons.Shield size={16} className="text-[var(--accent-500)]" />
            Privacy
          </h3>

          {!isAgency ? (
            <Link to="/complete-profile" className="btn-secondary w-full justify-center">
              <Icons.Eye size={16} />
              <span>Manage Privacy Settings</span>
            </Link>
          ) : (
            <div className="p-4 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-primary)]">
              <p className="text-sm text-[var(--text-secondary)]">
                Agency accounts don’t use the user profile privacy wizard. Manage privacy per profile from{' '}
                <Link to="/agency/profiles" className="text-[var(--accent-500)] hover:underline font-medium">
                  Agency Profiles
                </Link>
                .
              </p>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="card p-6 border-red-500/30">
          <h3 className="font-semibold mb-4 text-red-500 flex items-center gap-2">
            <Icons.AlertTriangle size={16} />
            Danger Zone
          </h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-ghost text-red-500 hover:bg-red-500/10 w-full justify-center"
            >
              <Icons.Trash2 size={16} />
              <span>Delete Account</span>
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <p className="text-sm text-red-400 font-medium mb-3">
                  This will permanently delete your account, profile, messages, and all associated data.
                </p>

                <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  Enter your password to confirm
                </label>
                <div className="relative">
                  <Icons.Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeleteError('');
                    }}
                    className="input pl-10"
                    placeholder="Your current password"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                  />
                </div>

                {deleteError && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                    <Icons.AlertCircle size={12} />
                    {deleteError}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !deletePassword}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Icons.Loader size={16} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Icons.Trash2 size={16} />
                      <span>Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}