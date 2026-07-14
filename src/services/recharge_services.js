import http from '../http-common';

// Every call is scoped to the currently-selected POS branch via header_location_id.
// Pass it in `params` for GETs and in the body for POST/PUT/DELETE so server-side
// getCtx() can enforce per-location data isolation.
const RechargeService = {
  listOperators: (header_location_id) =>
    http.get('/recharge/operators', { params: { header_location_id } }),
  createOperator: (data) => http.post('/recharge/operators', data),
  updateOperator: (id, data) => http.put(`/recharge/operators/${id}`, data),
  deleteOperator: (id) => http.delete(`/recharge/operators/${id}`),

  getDashboard: (header_location_id) =>
    http.get('/recharge/dashboard', { params: { header_location_id } }),

  listWalletLoads: (params) => http.get('/recharge/wallet-loads', { params }),
  createWalletLoad: (data) => http.post('/recharge/wallet-loads', data),
  updateWalletLoad: (id, data) => http.put(`/recharge/wallet-loads/${id}`, data),
  deleteWalletLoad: (id) => http.delete(`/recharge/wallet-loads/${id}`),

  listTransactions: (params) => http.get('/recharge/transactions', { params }),
  createTransaction: (data) => http.post('/recharge/transactions', data),

  getPaymentMethods: (header_location_id) =>
    http.get('/recharge/payment-methods', { params: { header_location_id } }),

  getDailySummary: (params) => http.get('/recharge/daily-summary', { params }),
};

export default RechargeService;
