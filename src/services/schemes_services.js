import http from '../http-common';

class Schemesservice {
  getAll() {
    return http.get('/schemes');
  }

  get(id) {
    return http.get(`/schemes/${id}`);
  }

  create(data) {
    return http.post('/schemes', data);
  }

  update(id, data) {
    return http.put(`/schemes/${id}`, data);
  }

  delete(id) {
    return http.delete(`/schemes/${id}`);
  }

  getSchemesDashBoard() {
    return http.get('/schemes/dashBoard');
  }
  pagination(data) {
    return http.post(`/schemes/searchscheme`, data)
  }
  getStatus(data) {
    return http.post(`/schemes/status`, data);
  }
  schemesReceivables(data) {
    return http.post(`/schemes/schemesReceivables`, data);
  }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
}

export default new Schemesservice();
