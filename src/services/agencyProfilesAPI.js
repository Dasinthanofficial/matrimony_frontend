// ===== FIXED FILE: ./src/services/agencyProfilesAPI.js =====
// ✅ FIX: Rewritten to use apiCall from api.js (was using non-existent api.post/get/etc.)
import { apiCall } from './api';

export const agencyProfilesAPI = {
  createProfile: (data) => apiCall('/agency/profiles', { method: 'POST', body: JSON.stringify(data) }),
  listMyProfiles: () => apiCall('/agency/profiles'),
  updateProfile: (id, data) => apiCall(`/agency/profiles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProfile: (id) => apiCall(`/agency/profiles/${id}`, { method: 'DELETE' }),
};