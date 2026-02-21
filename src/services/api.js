// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const REQUEST_TIMEOUT_MS = 30000;

/* ====================== COOKIE MANAGEMENT ====================== */
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  // ✅ FIX: Lax works with PayHere top-level redirects back to your site
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax${secure}`;
};

const deleteCookie = (name) => {
  // ✅ FIX: keep SameSite consistent
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
};

/* ====================== TOKEN MANAGEMENT ====================== */
export const getToken = () => getCookie('accessToken');
export const setToken = (token) => setCookie('accessToken', token, 7);
export const removeToken = () => deleteCookie('accessToken');

export const getRefreshToken = () => getCookie('refreshToken');
export const setRefreshToken = (token) => setCookie('refreshToken', token, 30);
export const removeRefreshToken = () => deleteCookie('refreshToken');

export const clearAuthData = () => {
  removeToken();
  removeRefreshToken();
  deleteCookie('user');
};

/* ====================== ERROR PARSING ====================== */
const parseValidationErrors = (errors) => {
  if (!errors || !Array.isArray(errors)) return [];
  return errors.map((err) => {
    if (typeof err === 'string') return err;
    if (err.message) return `${err.path || err.field || 'Field'}: ${err.message}`;
    if (err.msg) return `${err.param || err.path || 'Field'}: ${err.msg}`;
    if (err.field && err.error) return `${err.field}: ${err.error}`;
    return JSON.stringify(err);
  });
};

/* ====================== RESPONSE META (HTTP STATUS) ====================== */
// ✅ FIX: Attach httpStatus to object-shaped JSON responses (useful for 202 polling flows)
const attachMeta = (data, httpStatus) => {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return { ...data, _meta: { ...(data._meta || {}), httpStatus } };
  }
  return data;
};

/* ====================== REFRESH TOKEN (single-flight) ====================== */
let refreshPromise = null;
let isRedirecting = false;
let redirectTimer = null;

const resetRedirectGuard = () => {
  isRedirecting = false;
  if (redirectTimer) {
    clearTimeout(redirectTimer);
    redirectTimer = null;
  }
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });
      if (!response.ok) return false;
      const data = await response.json();
      setToken(data.token);
      if (data.refreshToken) setRefreshToken(data.refreshToken);

      // ✅ FIX: Notify AuthContext + socket of new token
      window.dispatchEvent(new CustomEvent('auth:token_refreshed', { detail: { token: data.token } }));

      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/* ====================== API CALL HELPER ====================== */
export const apiCall = async (endpoint, options = {}) => {
  const token = getToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  };

  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || REQUEST_TIMEOUT_MS);
  config.signal = options.signal || controller.signal;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    clearTimeout(timeoutId);

    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        config.headers['Authorization'] = `Bearer ${getToken()}`;

        const retryController = new AbortController();
        const retryTimeout = setTimeout(() => retryController.abort(), REQUEST_TIMEOUT_MS);
        config.signal = retryController.signal;

        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, config);
        clearTimeout(retryTimeout);

        const retryCt = retryResponse.headers.get('content-type') || '';
        const retryData = retryCt.includes('application/json')
          ? await retryResponse.json().catch(() => ({}))
          : await retryResponse.text().catch(() => '');

        if (!retryResponse.ok) {
          const errObj = typeof retryData === 'object' ? retryData : { message: String(retryData || '') };
          const error = new Error(errObj.message || 'Request failed after token refresh');
          error.status = retryResponse.status;
          error.data = errObj;
          throw error;
        }

        return attachMeta(retryData, retryResponse.status);
      }

      clearAuthData();
      if (!isRedirecting) {
        isRedirecting = true;
        redirectTimer = setTimeout(resetRedirectGuard, 5000);
        window.location.href = '/login';
      }
      throw new Error('Session expired');
    }

    const contentType = response.headers.get('content-type');
    let data = {};

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (!response.ok) {
      const textBody = await response.text().catch(() => '');
      const error = new Error(textBody || `HTTP error ${response.status}`);
      error.status = response.status;
      error.data = { message: `Server returned ${response.status}` };
      throw error;
    }

    if (!response.ok) {
      let errorMessage = data.message || data.error || data.msg || `HTTP error ${response.status}`;

      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const parsedErrors = parseValidationErrors(data.errors);
        errorMessage = parsedErrors.join('\n');
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return attachMeta(data, response.status);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      const timeoutError = new Error('Request timed out. Please check your connection and try again.');
      timeoutError.status = 0;
      timeoutError.isTimeout = true;
      throw timeoutError;
    }

    throw error;
  }
};

/* ====================== AUTH API ====================== */
export const authAPI = {
  register: (data) => {
    if (data instanceof FormData) return apiCall('/auth/register', { method: 'POST', body: data });
    return apiCall('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  },
  login: (data) => {
    resetRedirectGuard();
    return apiCall('/auth/login', { method: 'POST', body: JSON.stringify(data) });
  },
  logout: () => {
    const refreshToken = getRefreshToken();
    return apiCall('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }).finally(() => {
      clearAuthData();
      resetRedirectGuard();
    });
  },
  getMe: () => apiCall('/auth/me'),
  sendEmailOtp: (email) => apiCall('/auth/send-email-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyEmail: (token) => apiCall(`/auth/verify-email/${token}`),
  forgotPassword: (email) => apiCall('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) =>
    apiCall(`/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify({ password }) }),
  changePassword: (currentPassword, newPassword) =>
    apiCall('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
  deleteAccount: (password) => apiCall('/auth/delete-account', { method: 'DELETE', body: JSON.stringify({ password }) }),
  refreshToken: () => refreshAccessToken(),
};

/* ====================== PROFILE API ====================== */
export const profileAPI = {
  getMyProfile: () => apiCall('/profile'),
  createProfile: (data) => apiCall('/profile', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (data) => apiCall('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  deleteProfile: () => apiCall('/profile', { method: 'DELETE' }),
  getProfileById: (id) => apiCall(`/profile/${id}`),
  getCompletion: () => apiCall('/profile/completion'),
  uploadPhotos: (formData) => apiCall('/profile/photos', { method: 'POST', body: formData }),
  deletePhoto: (photoId) => apiCall(`/profile/photos/${photoId}`, { method: 'DELETE' }),
  setProfilePhoto: (photoId) => apiCall(`/profile/photos/${photoId}/profile`, { method: 'PUT' }),
  updatePartnerPreferences: (data) => apiCall('/profile/partner-preferences', { method: 'PUT', body: JSON.stringify(data) }),
  updatePrivacySettings: (data) => apiCall('/profile/privacy-settings', { method: 'PUT', body: JSON.stringify(data) }),
};

/* ====================== SEARCH API ====================== */
export const searchAPI = {
  search: (params = {}) => apiCall(`/search?${new URLSearchParams(params).toString()}`),
  quickSearch: (params = {}) => apiCall(`/search/quick?${new URLSearchParams(params).toString()}`),
  getSuggested: (limit = 10) => apiCall(`/search/suggested?limit=${limit}`),
  getRecent: (limit = 10) => apiCall(`/search/recent?limit=${limit}`),
  getFilterOptions: () => apiCall('/search/filters/options'),
  searchById: (profileId) => apiCall(`/search/by-id/${profileId}`),
};

/* ====================== INTEREST API ====================== */
export const interestAPI = {
  sendInterest: (receiverId, message = '') =>
    apiCall('/interests', { method: 'POST', body: JSON.stringify({ receiverId, message }) }),
  getSent: (params = {}) => apiCall(`/interests/sent?${new URLSearchParams(params).toString()}`),
  getReceived: (params = {}) => apiCall(`/interests/received?${new URLSearchParams(params).toString()}`),
  getAccepted: (params = {}) => apiCall(`/interests/accepted?${new URLSearchParams(params).toString()}`),
  getDeclined: (params = {}) => apiCall(`/interests/declined?${new URLSearchParams(params).toString()}`),
  getMutual: (params = {}) => apiCall(`/interests/mutual?${new URLSearchParams(params).toString()}`),
  getStatus: (userId) => apiCall(`/interests/status/${userId}`),
  accept: (id) => apiCall(`/interests/${id}/accept`, { method: 'PUT' }),
  decline: (id, reason = '') => apiCall(`/interests/${id}/decline`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  block: (id) => apiCall(`/interests/${id}/block`, { method: 'PUT' }),
  withdraw: (id) => apiCall(`/interests/${id}`, { method: 'DELETE' }),
  getShortlist: (params = {}) => apiCall(`/interests/shortlist?${new URLSearchParams(params).toString()}`),
  addToShortlist: (userId, note = '') =>
    apiCall(`/interests/shortlist/${userId}`, { method: 'POST', body: JSON.stringify({ note }) }),
  removeFromShortlist: (userId) => apiCall(`/interests/shortlist/${userId}`, { method: 'DELETE' }),
  isShortlisted: (userId) => apiCall(`/interests/shortlist/check/${userId}`),
  updateShortlistNote: (userId, note) =>
    apiCall(`/interests/shortlist/${userId}/note`, { method: 'PUT', body: JSON.stringify({ note }) }),
};

/* ====================== CHAT API ====================== */
export const chatAPI = {
  getConversations: (params = {}) => apiCall(`/chat?${new URLSearchParams(params).toString()}`),
  getConversation: (conversationId) => apiCall(`/chat/${conversationId}`),
  getOrCreateConversation: (participantId) => apiCall(`/chat/with/${participantId}`),
  getMessages: (conversationId, params = {}) =>
    apiCall(`/chat/${conversationId}/messages?${new URLSearchParams(params).toString()}`),
  sendMessage: (data) => apiCall('/chat/message', { method: 'POST', body: JSON.stringify(data) }),
  markAsRead: (conversationId) => apiCall(`/chat/${conversationId}/read`, { method: 'PUT' }),
  deleteMessage: (messageId) => apiCall(`/chat/message/${messageId}`, { method: 'DELETE' }),
  deleteConversation: (conversationId) => apiCall(`/chat/${conversationId}`, { method: 'DELETE' }),
  getUnreadCount: () => apiCall('/chat/unread-count'),
  blockUser: (userId) => apiCall(`/chat/block/${userId}`, { method: 'POST' }),
  unblockUser: (userId) => apiCall(`/chat/unblock/${userId}`, { method: 'POST' }),
  getBlockedUsers: () => apiCall('/chat/blocked'),
};

/* ====================== SUBSCRIPTION API ====================== */
export const subscriptionAPI = {
  getPlans: () => apiCall('/plans'),
  getMySubscription: () => apiCall('/subscriptions/my-subscription'),
  createCheckoutSession: (planId) =>
    apiCall('/subscriptions/create-checkout', { method: 'POST', body: JSON.stringify({ planId }) }),
  createPaymentIntent: (planCode) =>
    apiCall('/subscriptions/create-payment-intent', { method: 'POST', body: JSON.stringify({ planCode }) }),
  verifyPayment: ({ orderId }) => apiCall('/subscriptions/verify', { method: 'POST', body: JSON.stringify({ orderId }) }),
  cancelSubscription: (reason = '') =>
    apiCall('/subscriptions/cancel', { method: 'POST', body: JSON.stringify({ reason }) }),
  getPaymentHistory: (page = 1, limit = 10) => apiCall(`/subscriptions/history?page=${page}&limit=${limit}`),
  checkFeatureAccess: (feature) => apiCall(`/subscriptions/check-feature/${feature}`),
};

/* ====================== VERIFIED BADGE (AGENCY) API ====================== */
export const verifiedBadgeAPI = {
  getConfig: () => apiCall('/payments/agency/verified-badge/config'),
  getStatus: () => apiCall('/payments/agency/verified-badge/status'), // ✅ add this
  createCheckout: () => apiCall('/payments/agency/verified-badge/checkout', { method: 'POST', body: JSON.stringify({}) }),
  verifyPayment: ({ orderId }) =>
    apiCall('/payments/agency/verified-badge/verify', { method: 'POST', body: JSON.stringify({ orderId }) }),
};

/* ====================== ADMIN API ====================== */
export const adminAPI = {
  getDashboardStats: () => apiCall('/admin/dashboard/stats'),
  getUsers: (params = {}) => apiCall(`/admin/users?${new URLSearchParams(params).toString()}`),
  getAgencyProfiles: (params = {}) => apiCall(`/admin/agency-profiles?${new URLSearchParams(params).toString()}`),
  suspendUser: (userId, reason = '') =>
    apiCall(`/admin/users/${userId}/suspend`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  unsuspendUser: (userId) => apiCall(`/admin/users/${userId}/unsuspend`, { method: 'PUT' }),
  deleteUser: (userId, reason = '') =>
    apiCall(`/admin/users/${userId}`, { method: 'DELETE', body: JSON.stringify({ reason }) }),
  updateUserRole: (userId, role) =>
    apiCall(`/admin/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),

  getUserFullDetails: (userId) => apiCall(`/admin/users/${userId}/full`),

  getReports: (params = {}) => apiCall(`/admin/reports?${new URLSearchParams(params).toString()}`),
  resolveReport: (reportId, action, resolutionNote = '') =>
    apiCall(`/admin/reports/${reportId}/resolve`, { method: 'PUT', body: JSON.stringify({ action, resolutionNote }) }),
  rejectReport: (reportId, resolutionNote = '') =>
    apiCall(`/admin/reports/${reportId}/reject`, { method: 'PUT', body: JSON.stringify({ resolutionNote }) }),

  getLogs: (params = {}) => apiCall(`/admin/logs?${new URLSearchParams(params).toString()}`),
  approveAgency: (agencyId) => apiCall(`/admin/agencies/${agencyId}/approve`, { method: 'PUT' }),
  rejectAgency: (agencyId, reason = '') =>
    apiCall(`/admin/agencies/${agencyId}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),

  getPlans: () => apiCall('/admin/plans'),
  createPlan: (payload) => apiCall('/admin/plans', { method: 'POST', body: JSON.stringify(payload) }),
  updatePlan: (planId, payload) => apiCall(`/admin/plans/${planId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  togglePlan: (planId) => apiCall(`/admin/plans/${planId}/toggle`, { method: 'PATCH' }),
  deletePlan: (planId) => apiCall(`/admin/plans/${planId}`, { method: 'DELETE' }),

  getFinancePayments: (params = {}) => apiCall(`/admin/finance/payments?${new URLSearchParams(params).toString()}`),
  getFinancePayouts: (params = {}) => apiCall(`/admin/finance/payouts?${new URLSearchParams(params).toString()}`),

  // ✅ NEW: Verified Badge config (admin controls price/duration/enabled)
  getVerifiedBadgeConfig: () => apiCall('/admin/verified-badge'),
  updateVerifiedBadgeConfig: (payload) =>
    apiCall('/admin/verified-badge', { method: 'PUT', body: JSON.stringify(payload) }),
  grantVerifiedBadge: (agencyId) => apiCall(`/admin/verified-badge/grant/${agencyId}`, { method: 'POST' }),
  revokeVerifiedBadge: (agencyId) => apiCall(`/admin/verified-badge/revoke/${agencyId}`, { method: 'POST' }),
};

/* ====================== AGENCY API ====================== */
export const agencyAPI = {
  getMyProfiles: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiCall(qs ? `/agency/profiles?${qs}` : '/agency/profiles');
  },
  getOverview: () => apiCall('/agency/overview'),
  deleteProfile: (id) => apiCall(`/agency/profiles/${id}`, { method: 'DELETE' }),
  createProfile: (data) => apiCall('/agency/profiles', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (id, data) => apiCall(`/agency/profiles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

/* ====================== MARRIAGE SUCCESS API ====================== */
export const marriageSuccessAPI = {
  getAgencyPayments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiCall(qs ? `/marriage-success/agency/payments?${qs}` : '/marriage-success/agency/payments');
  },
  getAllPayments: (params = {}) => apiCall(`/marriage-success/admin/all?${new URLSearchParams(params).toString()}`),
  markAgencyPaid: (id, data) =>
    apiCall(`/marriage-success/admin/mark-paid/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

/* ====================== AGENCY ORDERS API ====================== */
export const agencyOrderAPI = {
  createCheckout: ({ serviceId }) =>
    apiCall('/agency-orders/checkout', { method: 'POST', body: JSON.stringify({ serviceId }) }),
  verifyPayment: ({ orderId }) => apiCall('/agency-orders/verify', { method: 'POST', body: JSON.stringify({ orderId }) }),
  listMine: (params = {}) => apiCall(`/agency-orders/me?${new URLSearchParams(params).toString()}`),
  listAgency: (params = {}) => apiCall(`/agency-orders/agency?${new URLSearchParams(params).toString()}`),
  updateStatus: (id, status) => apiCall(`/agency-orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

/* ====================== MARKETPLACE PAYMENTS API (DEPRECATED) ====================== */
export const paymentsMarketplaceAPI = {
  createAgencyServiceCheckout: (serviceId) =>
    apiCall('/payments/agency-service/checkout', { method: 'POST', body: JSON.stringify({ serviceId }) }),
};

/* ====================== NOTIFICATION API ====================== */
export const notificationAPI = {
  getNotifications: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiCall(qs ? `/notifications?${qs}` : '/notifications');
  },
  getUnreadCount: () => apiCall('/notifications/unread-count'),
  markAsRead: (id) => apiCall(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: () => apiCall('/notifications/read-all', { method: 'PUT' }),
  markRead: (id) => apiCall(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => apiCall('/notifications/read-all', { method: 'PUT' }),
  deleteNotification: (id) => apiCall(`/notifications/${id}`, { method: 'DELETE' }),
  deleteAll: () => apiCall('/notifications', { method: 'DELETE' }),
};

/* ====================== AGENCY FEEDBACK API ====================== */
export const agencyFeedbackAPI = {
  list: (agencyId, params = {}) =>
    apiCall(`/agencies/${agencyId}/feedback?${new URLSearchParams(params).toString()}`),
  getMine: (agencyId) => apiCall(`/agencies/${agencyId}/feedback/me`),
  upsert: (agencyId, { rating, comment }) =>
    apiCall(`/agencies/${agencyId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    }),
};

export const dashboardAPI = {
  getSummary: () => apiCall('/dashboard/summary'),
  getVisitors: () => apiCall('/dashboard/visitors'),
  getNewMatches: (limit = 6) => apiCall(`/search/suggested?limit=${limit}`),
};

export default {
  auth: authAPI,
  profile: profileAPI,
  search: searchAPI,
  interest: interestAPI,
  chat: chatAPI,
  subscription: subscriptionAPI,
  verifiedBadge: verifiedBadgeAPI,
  agencyFeedback: agencyFeedbackAPI,
  admin: adminAPI,
  agency: agencyAPI,
  agencyOrders: agencyOrderAPI,
  paymentsMarketplace: paymentsMarketplaceAPI,
  notification: notificationAPI,
  dashboard: dashboardAPI,
  apiCall,
  getToken,
  setToken,
  clearAuthData,
};

