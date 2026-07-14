import http from '../http-common';

class PreOrderservice {
  getAll(payload) {
    return http.post('/preOrders', payload);
  }
  create(data) {
    return http.post('/preOrders/create', data);
  }
  update(id, data) {
    return http.put(`/preOrders/${id}`, data);
  }
  getAllPreOrders(data) {
    return http.post(`/preOrders/getAllCancelledPreOrders`, data);
  }
}

export default new PreOrderservice();
