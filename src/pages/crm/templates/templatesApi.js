import http from '../../../http-common';

function toQueryString(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

class TemplatesApi {
  list({page = 1, limit = 25, search = '', channel, isActive} = {}) {
    const qs = toQueryString({page, limit, search, channel, isActive});
    return http.get(`/leadsservice/api/templates${qs}`);
  }

  get(templateId) {
    return http.get(`/leadsservice/api/templates/${templateId}`);
  }

  create(payload) {
    return http.post('/leadsservice/api/templates', payload);
  }

  update(templateId, payload) {
    return http.put(`/leadsservice/api/templates/${templateId}`, payload);
  }

  remove(templateId) {
    return http.delete(`/leadsservice/api/templates/${templateId}`);
  }
}

export default new TemplatesApi();

