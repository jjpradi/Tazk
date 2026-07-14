import http from '../http-common';
import ROUTE_PREFIXES from 'utils/routesprefix';

const BASE = ROUTE_PREFIXES.performance;

class PerformanceService {
  // Appraisal Cycles
  getCycles() { return http.get(`${BASE}/cycles`); }
  getCycleById(id) { return http.get(`${BASE}/cycle/${id}`); }
  createCycle(data) { return http.post(`${BASE}/cycle`, data); }
  updateCycle(data) { return http.put(`${BASE}/cycle`, data); }
  updateCycleStatus(data) { return http.post(`${BASE}/cycle/status`, data); }
  deleteCycle(id) { return http.delete(`${BASE}/cycle/${id}`); }

  // KRA Templates
  getTemplates() { return http.get(`${BASE}/templates`); }
  createTemplate(data) { return http.post(`${BASE}/template`, data); }
  updateTemplate(data) { return http.put(`${BASE}/template`, data); }
  deleteTemplate(id) { return http.delete(`${BASE}/template/${id}`); }
  getTemplateItems(id) { return http.get(`${BASE}/template/items/${id}`); }
  createTemplateItem(data) { return http.post(`${BASE}/template/item`, data); }
  updateTemplateItem(data) { return http.put(`${BASE}/template/item`, data); }
  deleteTemplateItem(id) { return http.delete(`${BASE}/template/item/${id}`); }

  // Appraisals
  getAppraisalsByCycle(cycle_id) { return http.get(`${BASE}/appraisals/cycle/${cycle_id}`); }
  getMyAppraisals() { return http.get(`${BASE}/appraisals/my`); }
  getTeamAppraisals(cycle_id) { return http.get(`${BASE}/appraisals/team/${cycle_id}`); }
  getAppraisalById(id) { return http.get(`${BASE}/appraisal/${id}`); }
  createAppraisal(data) { return http.post(`${BASE}/appraisal`, data); }
  bulkCreateAppraisals(data) { return http.post(`${BASE}/appraisals/bulk`, data); }
  submitSelfReview(data) { return http.post(`${BASE}/appraisal/selfReview`, data); }
  submitManagerReview(data) { return http.post(`${BASE}/appraisal/managerReview`, data); }
  submitHrReview(data) { return http.post(`${BASE}/appraisal/hrReview`, data); }

  // KRA Scores
  getKraScores(appraisal_id) { return http.get(`${BASE}/kraScores/${appraisal_id}`); }
  upsertKraScore(data) { return http.post(`${BASE}/kraScore`, data); }

  // Goals
  getGoals() { return http.get(`${BASE}/goals`); }
  getGoalsByEmployee(employee_id) { return http.get(`${BASE}/goals/employee/${employee_id}`); }
  getGoalsByCycle(cycle_id) { return http.get(`${BASE}/goals/cycle/${cycle_id}`); }
  createGoal(data) { return http.post(`${BASE}/goal`, data); }
  updateGoal(data) { return http.put(`${BASE}/goal`, data); }
  deleteGoal(id) { return http.delete(`${BASE}/goal/${id}`); }

  // Dashboard
  getDashboardStats() { return http.get(`${BASE}/dashboard`); }
  getRatingDistribution(cycle_id) { return http.get(`${BASE}/dashboard/ratings/${cycle_id}`); }
}

const performanceService = new PerformanceService();
export default performanceService;
