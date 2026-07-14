import http from '../http-common';
import ROUTE_PREFIXES from 'utils/routesprefix';

const BASE = ROUTE_PREFIXES.employeeProfile;

class EmployeeProfileService {
  // Profile
  searchEmployees(data) {
    return http.post(`${BASE}/employees`,data);
  }
  getProfile(employee_id) {
    return http.get(`${BASE}/${employee_id}`);
  }
  updatePersonalInfo(data) {
    return http.post(`${BASE}/updatePersonalInfo`, data);
  }
  updateEmployeeProfile(data) {
    return http.post(`${BASE}/updateEmployeeProfile`, data);
  }

  // Grades
  getGrades() {
    return http.get(`${BASE}/grade`);
  }
  createGrade(data) {
    return http.post(`${BASE}/grade`, data);
  }
  updateGrade(data) {
    return http.put(`${BASE}/grade`, data);
  }
  deleteGrade(id) {
    return http.delete(`${BASE}/grade/${id}`);
  }

  // Qualifications
  getQualifications(employee_id) {
    return http.get(`${BASE}/qualification/${employee_id}`);
  }
  createQualification(data) {
    return http.post(`${BASE}/qualification`, data);
  }
  updateQualification(data) {
    return http.put(`${BASE}/qualification`, data);
  }
  deleteQualification(id) {
    return http.delete(`${BASE}/qualification/${id}`);
  }

  // Emergency Contacts
  getEmergencyContacts(employee_id) {
    return http.get(`${BASE}/emergencyContact/${employee_id}`);
  }
  createEmergencyContact(data) {
    return http.post(`${BASE}/emergencyContact`, data);
  }
  updateEmergencyContact(data) {
    return http.put(`${BASE}/emergencyContact`, data);
  }
  deleteEmergencyContact(id) {
    return http.delete(`${BASE}/emergencyContact/${id}`);
  }

  // Work History
  getWorkHistory(employee_id) {
    return http.get(`${BASE}/workHistory/${employee_id}`);
  }
  createWorkHistory(data) {
    return http.post(`${BASE}/workHistory`, data);
  }
  updateWorkHistory(data) {
    return http.put(`${BASE}/workHistory`, data);
  }
  deleteWorkHistory(id) {
    return http.delete(`${BASE}/workHistory/${id}`);
  }
}

export default new EmployeeProfileService();
