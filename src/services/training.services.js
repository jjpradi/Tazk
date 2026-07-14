import http from '../http-common';
import ROUTE_PREFIXES from 'utils/routesprefix';

const BASE = ROUTE_PREFIXES.training;

class TrainingService {
  // Skills
  getSkills() { return http.get(`${BASE}/skills`); }
  createSkill(data) { return http.post(`${BASE}/skill`, data); }
  updateSkill(data) { return http.put(`${BASE}/skill`, data); }
  deleteSkill(id) { return http.delete(`${BASE}/skill/${id}`); }

  // Programs
  getPrograms() { return http.get(`${BASE}/programs`); }
  getProgramById(id) { return http.get(`${BASE}/program/${id}`); }
  createProgram(data) { return http.post(`${BASE}/program`, data); }
  updateProgram(data) { return http.put(`${BASE}/program`, data); }
  deleteProgram(id) { return http.delete(`${BASE}/program/${id}`); }

  // Sessions
  getSessions() { return http.get(`${BASE}/sessions`); }
  getSessionsByProgram(program_id) { return http.get(`${BASE}/sessions/program/${program_id}`); }
  createSession(data) { return http.post(`${BASE}/session`, data); }
  updateSession(data) { return http.put(`${BASE}/session`, data); }
  updateSessionStatus(data) { return http.post(`${BASE}/session/status`, data); }
  deleteSession(id) { return http.delete(`${BASE}/session/${id}`); }

  // Enrollments
  getEnrollmentsBySession(session_id) { return http.get(`${BASE}/enrollments/session/${session_id}`); }
  getEnrollmentsByEmployee(employee_id) { return http.get(`${BASE}/enrollments/employee/${employee_id}`); }
  createEnrollment(data) { return http.post(`${BASE}/enrollment`, data); }
  bulkCreateEnrollment(data) { return http.post(`${BASE}/enrollment/bulk`, data); }
  updateEnrollment(data) { return http.put(`${BASE}/enrollment`, data); }
  deleteEnrollment(id) { return http.delete(`${BASE}/enrollment/${id}`); }

  // Feedback
  getFeedbackBySession(session_id) { return http.get(`${BASE}/feedback/session/${session_id}`); }
  createFeedback(data) { return http.post(`${BASE}/feedback`, data); }
  deleteFeedback(id) { return http.delete(`${BASE}/feedback/${id}`); }

  // Employee Skills
  getEmployeeSkills() { return http.get(`${BASE}/employeeSkills`); }
  getSkillsByEmployee(employee_id) { return http.get(`${BASE}/employeeSkills/employee/${employee_id}`); }
  upsertEmployeeSkill(data) { return http.post(`${BASE}/employeeSkill`, data); }
  deleteEmployeeSkill(id) { return http.delete(`${BASE}/employeeSkill/${id}`); }

  // Dashboard
  getDashboardStats() { return http.get(`${BASE}/dashboard`); }
  getCategoryBreakdown() { return http.get(`${BASE}/dashboard/categories`); }
  getSkillGapSummary() { return http.get(`${BASE}/dashboard/skillGap`); }
}

const trainingService = new TrainingService();
export default trainingService;
