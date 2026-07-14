import http from '../http-common';

const CompanyLoansService = {
  // CRUD
  create: (data) => http.post('/allLoans', data),
  getAll: (params) => http.get('/allLoans', { params }),
  getById: (id) => http.get(`/allLoans/${id}`),
  update: (id, data) => http.put(`/allLoans/${id}`, data),
  delete: (id) => http.delete(`/allLoans/${id}`),

  // Legacy search (backward compat)
  searchLoan: (data) => http.post('/allLoans/searchLoan', data),

  // Actions
  disburse: (id, data) => http.post(`/allLoans/${id}/disburse`, data),
  payEmi: (scheduleId, data) => http.post(`/allLoans/schedule/${scheduleId}/pay`, data),
  prepay: (id, data) => http.post(`/allLoans/${id}/prepay`, data),
  foreclose: (id, data) => http.post(`/allLoans/${id}/foreclose`, data),
  restructure: (id, data) => http.post(`/allLoans/${id}/restructure`, data),

  // Schedule & Transactions
  getSchedule: (id) => http.get(`/allLoans/${id}/schedule`),
  getTransactions: (id) => http.get(`/allLoans/${id}/transactions`),

  // Dashboard
  getDashboard: () => http.get('/allLoans/dashboard'),
  getLoansDue: () => http.get('/allLoans/companyLoansDueForDashboard'),

  // Payment accounts
  getPaymentAccounts: () => http.get('/allLoans/paymentAccounts'),

  // Documents
  uploadDocument: (loanId, data) => http.post(`/allLoans/${loanId}/documents`, data),
  getDocuments: (loanId) => http.get(`/allLoans/${loanId}/documents`),
  deleteDocument: (docId) => http.delete(`/allLoans/documents/${docId}`),
};

export default CompanyLoansService;
