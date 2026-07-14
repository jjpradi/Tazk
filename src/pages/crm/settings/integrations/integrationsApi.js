import http from '../../../../http-common';

class IntegrationsApi {
  listApiKeys() {
    return http.get('/leadsservice/api/integrations/api-keys');
  }

  createApiKey(payload) {
    return http.post('/leadsservice/api/integrations/api-keys', payload);
  }

  revokeApiKey(apiKeyId) {
    return http.delete(`/leadsservice/api/integrations/api-keys/${apiKeyId}`);
  }

  listWebhooks() {
    return http.get('/leadsservice/api/integrations/webhooks');
  }

  createWebhook(payload) {
    return http.post('/leadsservice/api/integrations/webhooks', payload);
  }

  updateWebhook(webhookId, payload) {
    return http.put(`/leadsservice/api/integrations/webhooks/${webhookId}`, payload);
  }

  deleteWebhook(webhookId) {
    return http.delete(`/leadsservice/api/integrations/webhooks/${webhookId}`);
  }

  getCalendarStatus() {
    return http.get('/leadsservice/api/integrations/calendar/status');
  }

  connectCalendar(payload) {
    return http.put('/leadsservice/api/integrations/calendar/tokens', payload);
  }

  disconnectCalendar(provider) {
    return http.delete(`/leadsservice/api/integrations/calendar/tokens/${provider}`);
  }

  downloadInvoicesCsv() {
    return http.get('/leadsservice/api/integrations/accounting/export/invoices.csv', {
      responseType: 'blob',
    });
  }

  downloadReceiptsCsv() {
    return http.get('/leadsservice/api/integrations/accounting/export/receipts.csv', {
      responseType: 'blob',
    });
  }
}

export default new IntegrationsApi();

