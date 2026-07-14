import http from '../http-common';
import ROUTE_PREFIXES from 'utils/routesprefix';

const BASE = ROUTE_PREFIXES.hrAnalytics;

class HrAnalyticsService {
  // Headcount
  getHeadcountSummary() { return http.get(`${BASE}/headcount/summary`); }
  getHeadcountByDepartment() { return http.get(`${BASE}/headcount/department`); }
  getHeadcountByGrade() { return http.get(`${BASE}/headcount/grade`); }
  getHeadcountTrend() { return http.get(`${BASE}/headcount/trend`); }

  // Attrition
  getAttritionSummary(from, to) { return http.get(`${BASE}/attrition/summary`, { params: { from, to } }); }
  getAttritionTrend() { return http.get(`${BASE}/attrition/trend`); }
  getAttritionByDepartment(from, to) { return http.get(`${BASE}/attrition/department`, { params: { from, to } }); }
  getAttritionByTenure(from, to) { return http.get(`${BASE}/attrition/tenure`, { params: { from, to } }); }

  // Demographics
  getGenderDiversity() { return http.get(`${BASE}/demographics/gender`); }
  getAgeDistribution() { return http.get(`${BASE}/demographics/age`); }
  getTenureDistribution() { return http.get(`${BASE}/demographics/tenure`); }
  getEmploymentTypeBreakdown() { return http.get(`${BASE}/demographics/employmentType`); }

  // Salary Cost
  getSalaryCostByDepartment(month, year) { return http.get(`${BASE}/salaryCost/department`, { params: { month, year } }); }
  getSalaryCostTrend(from, to) { return http.get(`${BASE}/salaryCost/trend`, { params: { from, to } }); }
  getSalaryCostByGrade(month, year) { return http.get(`${BASE}/salaryCost/grade`, { params: { month, year } }); }

  // Compliance
  getProbationDue() { return http.get(`${BASE}/compliance/probation`); }
  getDocumentExpiry() { return http.get(`${BASE}/compliance/documentExpiry`); }
  getPolicyAcknowledgmentStatus() { return http.get(`${BASE}/compliance/policyAcknowledgment`); }

  // New Joiners
  getNewJoiners(from, to) { return http.get(`${BASE}/joiners`, { params: { from, to } }); }

  // Events
  getUpcomingBirthdays() { return http.get(`${BASE}/events/birthdays`); }
  getWorkAnniversaries() { return http.get(`${BASE}/events/anniversaries`); }

  // Dashboard
  getHrDashboardKpis() { return http.get(`${BASE}/dashboard`); }
}

const hrAnalyticsService = new HrAnalyticsService();
export default hrAnalyticsService;
