// ===== FIXED FILE: ./src/services/agencyOrdersAPI.js =====
// ✅ FIX: Thin wrapper over the unified agencyOrderAPI in api.js
// Keeps backward compatibility with existing page imports
import { agencyOrderAPI } from './api';

export const agencyOrdersAPI = {
  createCheckout: agencyOrderAPI.createCheckout,
  verifyPayment: agencyOrderAPI.verifyPayment,
  myOrders: (params) => agencyOrderAPI.listMine(params),
  agencyOrders: (params) => agencyOrderAPI.listAgency(params),
  updateStatus: ({ orderId, status }) => agencyOrderAPI.updateStatus(orderId, status),
};