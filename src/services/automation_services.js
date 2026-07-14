import http from '../http-common';

class AutomationService {
  listRules() {
    return http.get('/leadsservice/api/automation/rules');
  }

  createRule(payload) {
    return http.post('/leadsservice/api/automation/rules', payload);
  }

  updateRule(ruleId, payload) {
    return http.put(`/leadsservice/api/automation/rules/${ruleId}`, payload);
  }

  enableRule(ruleId) {
    return http.post(`/leadsservice/api/automation/rules/${ruleId}/enable`);
  }

  disableRule(ruleId) {
    return http.post(`/leadsservice/api/automation/rules/${ruleId}/disable`);
  }

  runNow() {
    return http.post('/leadsservice/api/automation/run');
  }
}

export default new AutomationService();

