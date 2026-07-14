import http from 'http-common';
import ROUTE_PREFIXES from 'utils/routesprefix';

const base = ROUTE_PREFIXES.codeGenerator;

const codeGeneratorService = {
  health() {
    return http.get(`${base}/health`);
  },
  generate(payload) {
    return http.post(`${base}/generate`, payload);
  },
  bulkGenerate(payload) {
    return http.post(`${base}/bulk-generate`, payload);
  },
  checkDuplicate(payload) {
    return http.post(`${base}/check-duplicate`, payload);
  },
  // Registry
  listRegistry(params) {
    return http.get(`${base}/registry`, { params });
  },
  getCodeById(id) {
    return http.get(`${base}/registry/${id}`);
  },
  updateStatus(id, status) {
    return http.patch(`${base}/registry/${id}/status`, { status });
  },
  softDelete(id) {
    return http.delete(`${base}/registry/${id}`);
  },
  logPrint(id, payload) {
    return http.post(`${base}/registry/${id}/log-print`, payload || {});
  },
  getPrintLogs(codeId, params) {
    return http.get(`${base}/print-logs/${codeId}`, { params });
  },
  // Templates
  listTemplates(params) {
    return http.get(`${base}/templates`, { params });
  },
  getTemplate(id) {
    return http.get(`${base}/templates/${id}`);
  },
  createTemplate(payload) {
    return http.post(`${base}/templates`, payload);
  },
  updateTemplate(id, payload) {
    return http.patch(`${base}/templates/${id}`, payload);
  },
  deleteTemplate(id) {
    return http.delete(`${base}/templates/${id}`);
  },
  setTemplateDefault(id) {
    return http.post(`${base}/templates/${id}/set-default`);
  },
  // Settings
  getSettings() {
    return http.get(`${base}/settings`);
  },
  updateSettings(payload) {
    return http.put(`${base}/settings`, payload);
  },
};

export default codeGeneratorService;
