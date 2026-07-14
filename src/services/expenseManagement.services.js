import http from '../http-common';
import ROUTE_PREFIXES from 'utils/routesprefix';

const BASE = ROUTE_PREFIXES.expenseManagement;

class ExpenseManagementService {
  // Expense Policies
  getExpensePolicies() { return http.get(`${BASE}/policies`); }
  getExpensePolicyById(id) { return http.get(`${BASE}/policy/${id}`); }
  createExpensePolicy(data) { return http.post(`${BASE}/policy`, data); }
  updateExpensePolicy(data) { return http.put(`${BASE}/policy`, data); }
  deleteExpensePolicy(id) { return http.delete(`${BASE}/policy/${id}`); }

  // Policy Validation
  validateClaim(data) { return http.post(`${BASE}/validate`, data); }

  // Enhanced Claims
  getClaimsWithPolicyInfo() { return http.get(`${BASE}/claims`); }
  getClaimsByEmployee(employee_id) { return http.get(`${BASE}/claims/employee/${employee_id}`); }
  getViolationClaims() { return http.get(`${BASE}/claims/violations`); }
  updateClaimWithPolicy(data) { return http.post(`${BASE}/claims/updatePolicy`, data); }

  // Reports
  getExpenseSummaryStats(from_date, to_date) { return http.get(`${BASE}/report/summary?from_date=${from_date}&to_date=${to_date}`); }
  getExpenseByCategory(from_date, to_date) { return http.get(`${BASE}/report/byCategory?from_date=${from_date}&to_date=${to_date}`); }
  getExpenseByDepartment(from_date, to_date) { return http.get(`${BASE}/report/byDepartment?from_date=${from_date}&to_date=${to_date}`); }
  getExpenseByEmployee(from_date, to_date) { return http.get(`${BASE}/report/byEmployee?from_date=${from_date}&to_date=${to_date}`); }
}

const expenseManagementService = new ExpenseManagementService();
export default expenseManagementService;
