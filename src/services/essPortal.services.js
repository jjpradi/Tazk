import http from '../http-common';
import ROUTE_PREFIXES from 'utils/routesprefix';

const BASE = ROUTE_PREFIXES.essPortal;

class EssPortalService {
  // Profile Change Requests
  getMyChangeRequests() {
    return http.get(`${BASE}/changeRequests`);
  }
  getPendingChangeRequests() {
    return http.get(`${BASE}/changeRequests/pending`);
  }
  createChangeRequest(data) {
    return http.post(`${BASE}/changeRequest`, data);
  }
  approveChangeRequest(data) {
    return http.post(`${BASE}/changeRequest/approve`, data);
  }
  rejectChangeRequest(data) {
    return http.post(`${BASE}/changeRequest/reject`, data);
  }
  deleteChangeRequest(id) {
    return http.delete(`${BASE}/changeRequest/${id}`);
  }

  // My Salary Structure
  getMySalaryStructure() {
    return http.get(`${BASE}/salary/structure`);
  }
  getMySalaryDeductions() {
    return http.get(`${BASE}/salary/deductions`);
  }

  // Team View
  getMyTeamMembers() {
    return http.get(`${BASE}/team/members`);
  }
  getTeamAttendanceSummary() {
    return http.get(`${BASE}/team/attendance`);
  }
  getTeamPendingRequests() {
    return http.get(`${BASE}/team/pendingRequests`);
  }

  // My Requests
  getMyRequests() {
    return http.get(`${BASE}/myRequests`);
  }
}

const essPortalService = new EssPortalService();
export default essPortalService;
