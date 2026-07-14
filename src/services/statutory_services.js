import http from '../http-common';

class StatutoryService {
  // ── Company Settings ────────────────────────────────────────────────────
  getCompanySettings(month) {
    return http.get(`/statutory/company?month=${month}`);
  }

  getCompanySettingsHistory(type) {
    return http.get(`/statutory/company/history?type=${type}`);
  }

  upsertCompanySettings(data) {
    return http.post(`/statutory/company`, data);
  }

  // ── Employee Profiles ───────────────────────────────────────────────────
  getEmployeeProfiles(employeeId, month) {
    return http.get(`/statutory/employee/${employeeId}?month=${month}`);
  }

  getEmployeeProfilesHistory(employeeId, type) {
    return http.get(`/statutory/employee/${employeeId}/history?type=${type}`);
  }

  upsertEmployeeProfiles(employeeId, data) {
    return http.post(`/statutory/employee/${employeeId}`, data);
  }

  // ── PT Masters ──────────────────────────────────────────────────────────
  getPTStates() {
    return http.get(`/statutory/pt/states`);
  }

  getPTLocales(stateCode) {
    return http.get(`/statutory/pt/locales?state_code=${stateCode}`);
  }

  getPTSlabs(localeId, month) {
    const monthParam = month ? `&month=${month}` : '';
    return http.get(`/statutory/pt/slabs?locale_id=${localeId}${monthParam}`);
  }

  upsertPTSlabs(data) {
    return http.post(`/statutory/pt/slabs`, data);
  }

  // ── Wage Builder ────────────────────────────────────────────────────────
  getWageBuilder() {
    return http.get(`/statutory/wageBuilder`);
  }

  updateWageBuilder(allowanceTypeId, data) {
    return http.put(`/statutory/wageBuilder/${allowanceTypeId}`, data);
  }

  // ── Audit ───────────────────────────────────────────────────────────────
  getAuditLog(entityType, entityId) {
    const params = entityType && entityId
      ? `?entity_type=${entityType}&entity_id=${entityId}`
      : '';
    return http.get(`/statutory/audit${params}`);
  }

  // ── Reports ───────────────────────────────────────────────────────────
  getStatutorySummary(data) {
    return http.post(`/statutory/reports/summary`, data);
  }

  getPfEcrExport(data) {
    return http.post(`/statutory/reports/pf-ecr`, data);
  }

  getEsiExport(data) {
    return http.post(`/statutory/reports/esi`, data);
  }

  getPtStatement(data) {
    return http.post(`/statutory/reports/pt`, data);
  }
}

export default new StatutoryService();
