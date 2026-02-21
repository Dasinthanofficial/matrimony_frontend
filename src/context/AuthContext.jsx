// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax${secure}`;
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
};

const pickUserForCookie = (u) => {
  if (!u) return null;
  return {
    _id: u._id || u.id || null,
    id: u.id || u._id || null,
    email: u.email || null,
    fullName: u.fullName || null,
    role: u.role || 'user',
    profileId: u.profileId || null,
    photoUrl: u.photoUrl || null,
    isPremium: !!u.isPremium,
    isEmailVerified: !!u.isEmailVerified,
    isPhoneVerified: !!u.isPhoneVerified,
    subscription: u.subscription || null,
    premiumExpiry: u.premiumExpiry || null,
    agencyVerification: u.agencyVerification
      ? {
          status: u.agencyVerification.status,
          submittedAt: u.agencyVerification.submittedAt,
          reviewedAt: u.agencyVerification.reviewedAt,
          rejectionReason: u.agencyVerification.rejectionReason,
        }
      : { status: 'none' },
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hydrationDone = useRef(false);

  useEffect(() => {
    const storedToken = getCookie('accessToken');
    const storedUser = getCookie('user');

    if (storedToken) setTokenState(storedToken);

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(decodeURIComponent(storedUser));
        setUser(parsed);
      } catch {
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        deleteCookie('user');
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const onRefreshed = (e) => {
      const t = e?.detail?.token;
      if (t) {
        setTokenState(t);
        hydrationDone.current = false;
      }
    };
    window.addEventListener('auth:token_refreshed', onRefreshed);
    return () => window.removeEventListener('auth:token_refreshed', onRefreshed);
  }, []);

  const clearAuthData = useCallback(() => {
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    deleteCookie('user');
    setTokenState(null);
    setUser(null);
    hydrationDone.current = false;
  }, []);

  useEffect(() => {
    if (loading || !token) return;
    if (hydrationDone.current) return;

    hydrationDone.current = true;
    let cancelled = false;

    authAPI
      .getMe()
      .then(async (response) => {
        if (cancelled) return;
        const userData = response.user;
        const minimal = pickUserForCookie(userData);
        setCookie('user', encodeURIComponent(JSON.stringify(minimal)), 7);
        setUser(userData);
      })
      .catch(() => {
        if (cancelled) return;
        clearAuthData();
      });

    return () => {
      cancelled = true;
    };
  }, [loading, token, clearAuthData]);

  const storeAuthData = useCallback(async (data) => {
    setCookie('accessToken', data.token, 7);
    const minimal = pickUserForCookie(data.user);
    setCookie('user', encodeURIComponent(JSON.stringify(minimal)), 7);
    if (data.refreshToken) setCookie('refreshToken', data.refreshToken, 30);

    setTokenState(data.token);
    setUser(data.user);
    hydrationDone.current = true;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = getCookie('refreshToken');
      if (refreshToken) {
        await authAPI.logout();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuthData();
    }
  }, [clearAuthData]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.user;
      const minimal = pickUserForCookie(userData);
      setCookie('user', encodeURIComponent(JSON.stringify(minimal)), 7);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      clearAuthData();
      throw err;
    }
  }, [clearAuthData]);

  const register = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authAPI.register(data);
        await storeAuthData(response);
        return response;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeAuthData]
  );

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        const data = await authAPI.login({ email, password });
        await storeAuthData(data);
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeAuthData]
  );

  const getUserId = useCallback(() => user?.id || user?._id || null, [user]);

  const hasPremiumAccess = useCallback(() => {
    if (!user) return false;

    const plan = String(user.subscription?.plan || 'free');
    const isActiveFlag = user.subscription?.isActive === true;

    if (isActiveFlag) {
      const endDateRaw = user.subscription?.endDate;
      if (!endDateRaw) return plan !== 'free';
      const endDate = new Date(endDateRaw);
      if (!Number.isNaN(endDate.valueOf())) return new Date() < endDate;
    }

    if (user.premiumExpiry) {
      const exp = new Date(user.premiumExpiry);
      if (!Number.isNaN(exp.valueOf()) && new Date() < exp) return true;
    }

    if (user.isPremium && user.premiumExpiry) {
      const exp = new Date(user.premiumExpiry);
      return !Number.isNaN(exp.valueOf()) && new Date() < exp;
    }

    return false;
  }, [user]);

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    refreshUser,
    getUserId,
    hasPremiumAccess,
    isAuthenticated: Boolean(token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;