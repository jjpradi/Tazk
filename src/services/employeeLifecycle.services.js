import http from '../http-common';
import ROUTE_PREFIXES from 'utils/routesprefix';

const BASE = ROUTE_PREFIXES.employeeLifecycle;

class EmployeeLifecycleService {
  // Dashboard
  getDashboardStats() {
    return http.get(`${BASE}/dashboard`);
  }

  // Lifecycle Events
  getLifecycleEvents(employee_id) {
    return http.get(`${BASE}/events/${employee_id}`);
  }
  getLifecycleEventById(id) {
    return http.get(`${BASE}/event/${id}`);
  }
  getLifecycleEventsByType(event_type) {
    return http.get(`${BASE}/eventsByType/${event_type}`);
  }
  createLifecycleEvent(data) {
    return http.post(`${BASE}/event`, data);
  }
  updateLifecycleEvent(data) {
    return http.put(`${BASE}/event`, data);
  }
  approveLifecycleEvent(data) {
    return http.post(`${BASE}/event/approve`, data);
  }
  completeLifecycleEvent(data) {
    return http.post(`${BASE}/event/complete`, data);
  }
  cancelLifecycleEvent(data) {
    return http.post(`${BASE}/event/cancel`, data);
  }
  deleteLifecycleEvent(id) {
    return http.delete(`${BASE}/event/${id}`);
  }

  // Probation
  getProbationEmployees() {
    return http.get(`${BASE}/probation`);
  }

  // Onboarding Checklist Templates
  getChecklistTemplates() {
    return http.get(`${BASE}/checklistTemplate`);
  }
  createChecklistTemplate(data) {
    return http.post(`${BASE}/checklistTemplate`, data);
  }
  updateChecklistTemplate(data) {
    return http.put(`${BASE}/checklistTemplate`, data);
  }
  deleteChecklistTemplate(id) {
    return http.delete(`${BASE}/checklistTemplate/${id}`);
  }

  // Employee Onboarding Checklist
  getOnboardingDashboard() {
    return http.get(`${BASE}/onboardingDashboard`);
  }
  getEmployeeChecklist(employee_id) {
    return http.get(`${BASE}/checklist/${employee_id}`);
  }
  initializeEmployeeChecklist(data) {
    return http.post(`${BASE}/checklist/initialize`, data);
  }
  updateChecklistItemStatus(data) {
    return http.post(`${BASE}/checklist/updateStatus`, data);
  }

  // FnF
  getAllPendingFnf() {
    return http.get(`${BASE}/fnf/pending`);
  }
  getFnfByEmployee(employee_id) {
    return http.get(`${BASE}/fnf/${employee_id}`);
  }
  getFnfById(id) {
    return http.get(`${BASE}/fnf/detail/${id}`);
  }
  createFnfSettlement(data) {
    return http.post(`${BASE}/fnf`, data);
  }
  updateFnfSettlement(data) {
    return http.put(`${BASE}/fnf`, data);
  }
  approveFnf(data) {
    return http.post(`${BASE}/fnf/approve`, data);
  }
  markFnfPaid(data) {
    return http.post(`${BASE}/fnf/markPaid`, data);
  }
  deleteFnfSettlement(id) {
    return http.delete(`${BASE}/fnf/${id}`);
  }

  // Employee Status
  updateEmployeeStatus(data) {
    return http.post(`${BASE}/updateStatus`, data);
  }
}

export default new EmployeeLifecycleService();
