import http from '../http-common';
import ROUTE_PREFIXES from 'utils/routesprefix';

const BASE = ROUTE_PREFIXES.documentManagement;

class DocumentManagementService {
  // Document Categories
  getDocumentCategories() {
    return http.get(`${BASE}/categories`);
  }
  createDocumentCategory(data) {
    return http.post(`${BASE}/category`, data);
  }
  updateDocumentCategory(data) {
    return http.put(`${BASE}/category`, data);
  }
  deleteDocumentCategory(id) {
    return http.delete(`${BASE}/category/${id}`);
  }

  // Employee Documents
  getEmployeeDocuments(employee_id) {
    return http.get(`${BASE}/employee/${employee_id}`);
  }
  getDocumentById(id) {
    return http.get(`${BASE}/detail/${id}`);
  }
  createDocument(data) {
    return http.post(`${BASE}/document`, data);
  }
  uploadDocument(data) {
    return http.post(`${BASE}/upload`, data);
  }
  verifyDocument(data) {
    return http.post(`${BASE}/verify`, data);
  }
  rejectDocument(data) {
    return http.post(`${BASE}/reject`, data);
  }
  deleteDocument(id) {
    return http.delete(`${BASE}/document/${id}`);
  }

  // Lookup
  getVerificationTypes() {
    return http.get(`${BASE}/verificationTypes`);
  }

  // Dashboard
  getDocumentDashboard() {
    return http.get(`${BASE}/dashboard`);
  }
  getExpiringDocuments(days = 30) {
    return http.get(`${BASE}/expiring?days=${days}`);
  }
  getPendingVerifications() {
    return http.get(`${BASE}/pendingVerifications`);
  }
}

const documentManagementService = new DocumentManagementService();
export default documentManagementService;
