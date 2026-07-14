import http from '../http-common';
import ROUTE_PREFIXES from 'utils/routesprefix';

const BASE = ROUTE_PREFIXES.hrPolicies;

class HrPoliciesService {
  // Policies CRUD
  getPolicies() { return http.get(`${BASE}/list`); }
  getActivePolicies() { return http.get(`${BASE}/active`); }
  getPolicyById(id) { return http.get(`${BASE}/detail/${id}`); }
  createPolicy(data) { return http.post(`${BASE}/policy`, data); }
  updatePolicy(data) { return http.put(`${BASE}/policy`, data); }
  publishPolicy(data) { return http.post(`${BASE}/publish`, data); }
  archivePolicy(data) { return http.post(`${BASE}/archive`, data); }
  deletePolicy(id) { return http.delete(`${BASE}/policy/${id}`); }

  // Acknowledgments
  acknowledgePolicy(data) { return http.post(`${BASE}/acknowledge`, data); }
  getPolicyAcknowledgments(policy_id) { return http.get(`${BASE}/acknowledgments/${policy_id}`); }
  getMyAcknowledgedPolicies() { return http.get(`${BASE}/myAcknowledged`); }
  getPendingAcknowledgments() { return http.get(`${BASE}/pendingAcknowledgments`); }

  // Compliance
  getComplianceDashboard() { return http.get(`${BASE}/compliance`); }
  getUnacknowledgedEmployees(policy_id) { return http.get(`${BASE}/unacknowledged/${policy_id}`); }
}

const hrPoliciesService = new HrPoliciesService();
export default hrPoliciesService;
