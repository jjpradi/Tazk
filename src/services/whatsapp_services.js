import http from '../http-common';

class WhatsappService {
  send({entityType, entityId, to, message, templateId, metadata} = {}) {
    return http.post('/leadsservice/api/whatsapp/send', {
      entityType,
      entityId,
      to,
      message,
      templateId,
      metadata,
    });
  }

  thread(entityType, entityId, limit = 50) {
    const qs = limit ? `?limit=${encodeURIComponent(limit)}` : '';
    return http.get(
      `/leadsservice/api/whatsapp/thread/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}${qs}`,
    );
  }
}

export default new WhatsappService();

