import http from '../../../http-common';

class TimelineApi {
  list(entityType, entityId, limit = 50) {
    const safeLimit = limit ? `?limit=${encodeURIComponent(limit)}` : '';
    return http.get(
      `/leadsservice/api/timeline/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}${safeLimit}`,
    );
  }

  create(payload) {
    return http.post('/leadsservice/api/timeline/events', payload);
  }
}

export default new TimelineApi();

