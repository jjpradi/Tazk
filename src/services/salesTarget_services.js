import http from '../http-common';

const SalesTargetService = {
  // Periods
  createPeriod: (data) => http.post('/salesTarget/periods', data),
  getPeriods: (params) => http.get('/salesTarget/periods', { params }),
  getPeriodById: (id) => http.get(`/salesTarget/periods/${id}`),
  updatePeriodStatus: (id, data) => http.put(`/salesTarget/periods/${id}/status`, data),
  deletePeriod: (id) => http.delete(`/salesTarget/periods/${id}`),

  // Targets
  createTarget: (data) => http.post('/salesTarget/targets', data),
  createTargetsBulk: (data) => http.post('/salesTarget/targets/bulk', data),
  getTargets: (params) => http.get('/salesTarget/targets', { params }),
  updateTarget: (id, data) => http.put(`/salesTarget/targets/${id}`, data),
  deleteTarget: (id) => http.delete(`/salesTarget/targets/${id}`),
  getTargetHierarchy: (params) => http.get('/salesTarget/targets/hierarchy', { params }),
  getMyTargets: (params) => http.get('/salesTarget/targets/my', { params }),

  // Auto-suggest
  autoSuggest: (params) => http.get('/salesTarget/suggest', { params }),

  // Computation
  computeAchievement: (data) => http.post('/salesTarget/compute/achievement', data),
  computeIncentives: (data) => http.post('/salesTarget/compute/incentives', data),
  computeFull: (data) => http.post('/salesTarget/compute/full', data),

  // Incentive Plans
  createPlan: (data) => http.post('/salesTarget/plans', data),
  getPlans: (params) => http.get('/salesTarget/plans', { params }),
  getPlanById: (id) => http.get(`/salesTarget/plans/${id}`),
  updatePlan: (id, data) => http.put(`/salesTarget/plans/${id}`, data),
  deletePlan: (id) => http.delete(`/salesTarget/plans/${id}`),

  // Incentive Results
  getResults: (params) => http.get('/salesTarget/results', { params }),
  getMyResults: (params) => http.get('/salesTarget/results/my', { params }),
  getResultById: (id) => http.get(`/salesTarget/results/${id}`),
  submitResult: (id) => http.put(`/salesTarget/results/${id}/submit`),
  approveResult: (id) => http.put(`/salesTarget/results/${id}/approve`),
  rejectResult: (id, data) => http.put(`/salesTarget/results/${id}/reject`, data),
  bulkApprove: (data) => http.post('/salesTarget/results/bulkApprove', data),

  // Leaderboard
  getLeaderboard: (params) => http.get('/salesTarget/leaderboard', { params }),

  // Team
  getTeam: (params) => http.get('/salesTarget/team', { params }),

  // Customer Targets
  getCustomersForTarget: (params) => http.get('/salesTarget/customers', { params }),
  getProductCategoriesAndBrands: () => http.get('/salesTarget/productCategories'),
  getProductMixForTarget: (params) => http.get('/salesTarget/productMix', { params }),
  saveProductMixTargets: (data) => http.post('/salesTarget/productMix', data),

  // Historical Trend
  getHistoricalTrend: (params) => http.get('/salesTarget/trend', { params }),

  // Approval Log
  getApprovalLog: (params) => http.get('/salesTarget/approvalLog', { params }),
};

export default SalesTargetService;
