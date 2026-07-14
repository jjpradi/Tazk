import http from 'http-common';

class CrmIntegrationsApi {
  listApiKeys() {
    return http.get('/leadsservice/api/integrations/api-keys');
  }

  createApiKey(payload) {
    return http.post('/leadsservice/api/integrations/api-keys', payload);
  }

  revokeApiKey(apiKeyId) {
    return http.post(`/leadsservice/api/integrations/api-keys/${apiKeyId}/revoke`);
  }

  listWebhooks() {
    return http.get('/leadsservice/api/integrations/webhooks');
  }

  createWebhook(payload) {
    return http.post('/leadsservice/api/integrations/webhooks', payload);
  }

  disableWebhook(webhookId) {
    return http.post(`/leadsservice/api/integrations/webhooks/${webhookId}/disable`);
  }

  listWebsiteForms() {
    return http.get('/leadsservice/api/integrations/website-forms');
  }

  createWebsiteForm(payload) {
    return http.post('/leadsservice/api/integrations/website-forms', payload);
  }

  updateWebsiteForm(websiteFormId, payload) {
    return http.put(`/leadsservice/api/integrations/website-forms/${websiteFormId}`, payload);
  }

  listGenericWebhooks() {
    return http.get('/leadsservice/api/integrations/generic-webhooks');
  }

  createGenericWebhook(payload) {
    return http.post('/leadsservice/api/integrations/generic-webhooks', payload);
  }

  updateGenericWebhook(genericWebhookId, payload) {
    return http.put(`/leadsservice/api/integrations/generic-webhooks/${genericWebhookId}`, payload);
  }

  listEmailInbound() {
    return http.get('/leadsservice/api/integrations/email-inbound');
  }

  createEmailInbound(payload) {
    return http.post('/leadsservice/api/integrations/email-inbound', payload);
  }

  updateEmailInbound(emailInboundId, payload) {
    return http.put(`/leadsservice/api/integrations/email-inbound/${emailInboundId}`, payload);
  }

  previewLeadsCsvImport(payload) {
    return http.post('/leadsservice/api/imports/leads/csv/preview', payload);
  }

  startLeadsCsvImport(payload) {
    return http.post('/leadsservice/api/imports/leads/csv/start', payload);
  }

  getImportJob(importJobId) {
    return http.get(`/leadsservice/api/imports/${importJobId}`);
  }

  listImportJobRows(importJobId, params = {}) {
    return http.get(`/leadsservice/api/imports/${importJobId}/rows`, { params });
  }
}

export default new CrmIntegrationsApi();
