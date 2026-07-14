import http from '../http-common';
import ROUTE_PREFIXES from 'utils/routesprefix';

const BASE = ROUTE_PREFIXES.recruitment;

class RecruitmentService {
  // Pipeline Stages
  getStages() { return http.get(`${BASE}/stages`); }
  createStage(data) { return http.post(`${BASE}/stage`, data); }
  updateStage(data) { return http.put(`${BASE}/stage`, data); }
  deleteStage(id) { return http.delete(`${BASE}/stage/${id}`); }

  // Job Positions
  getJobPositions() { return http.get(`${BASE}/jobs`); }
  getJobPositionById(id) { return http.get(`${BASE}/job/${id}`); }
  createJobPosition(data) { return http.post(`${BASE}/job`, data); }
  updateJobPosition(data) { return http.put(`${BASE}/job`, data); }
  updateJobPositionStatus(data) { return http.post(`${BASE}/job/status`, data); }
  deleteJobPosition(id) { return http.delete(`${BASE}/job/${id}`); }

  // Candidates
  getCandidates() { return http.get(`${BASE}/candidates`); }
  getCandidateById(id) { return http.get(`${BASE}/candidate/${id}`); }
  createCandidate(data) { return http.post(`${BASE}/candidate`, data); }
  updateCandidate(data) { return http.put(`${BASE}/candidate`, data); }
  deleteCandidate(id) { return http.delete(`${BASE}/candidate/${id}`); }

  // Applications
  getApplications() { return http.get(`${BASE}/applications`); }
  getApplicationsByJob(job_id) { return http.get(`${BASE}/applications/job/${job_id}`); }
  createApplication(data) { return http.post(`${BASE}/application`, data); }
  updateApplicationStatus(data) { return http.post(`${BASE}/application/status`, data); }
  deleteApplication(id) { return http.delete(`${BASE}/application/${id}`); }

  // Interviews
  getInterviewsByApplication(application_id) { return http.get(`${BASE}/interviews/application/${application_id}`); }
  getUpcomingInterviews() { return http.get(`${BASE}/interviews/upcoming`); }
  createInterview(data) { return http.post(`${BASE}/interview`, data); }
  updateInterview(data) { return http.put(`${BASE}/interview`, data); }
  submitInterviewFeedback(data) { return http.post(`${BASE}/interview/feedback`, data); }
  deleteInterview(id) { return http.delete(`${BASE}/interview/${id}`); }

  // Dashboard
  getDashboardStats() { return http.get(`${BASE}/dashboard`); }
  getPipelineSummary() { return http.get(`${BASE}/dashboard/pipeline`); }
  getSourceEffectiveness() { return http.get(`${BASE}/dashboard/sources`); }
}

const recruitmentService = new RecruitmentService();
export default recruitmentService;
