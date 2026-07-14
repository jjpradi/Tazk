import http from '../http-common';

class ReportsViewService {
  get(table) {
    return http.get(`/reports/${table}`);
  }
}

export default new ReportsViewService();
