import http from '../http-common';

class EmailService {
  send({entityType, entityId, to, from, subject, body, templateId, metadata} = {}) {
    return http.post('/leadsservice/api/email/send', {
      entityType,
      entityId,
      to,
      from,
      subject,
      body,
      templateId,
      metadata,
    });
  }

  thread(entityType, entityId, limit = 50) {
    const qs = limit ? `?limit=${encodeURIComponent(limit)}` : '';
    return http.get(
      `/leadsservice/api/email/thread/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}${qs}`,
    );
  }
}

export default new EmailService();

