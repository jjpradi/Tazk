import http from '../../../http-common';

const BASE = '/accountsReports';

const reportsApi = {
  trialBalance(params) {
    return http.get(`${BASE}/trial-balance`, { params });
  },
  profitLoss(params) {
    return http.get(`${BASE}/profit-loss`, { params });
  },
  balanceSheet(params) {
    return http.get(`${BASE}/balance-sheet`, { params });
  },
  ledgerSummary(accountId, params) {
    return http.get(`${BASE}/ledger/${accountId}/summary`, { params });
  },
  ledgerVouchers(accountId, params) {
    return http.get(`${BASE}/ledger/${accountId}/vouchers`, { params });
  },
  voucherDetail(transactionId) {
    return http.get(`${BASE}/voucher/${transactionId}`);
  },
  voucherList(params) {
    return http.get(`${BASE}/vouchers`, { params });
  },
  gstTds(params) {
    return http.get(`${BASE}/gst-tds`, { params });
  },
};

export default reportsApi;
