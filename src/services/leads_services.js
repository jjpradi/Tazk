import http from '../http-common';

class Leadsservice {
  getAll() {
    return http.get('/Leads');
  }

  getByPagination(data) {
    return http.post('/Leads/pagination', data);
  }

  get(id) {
    return http.get(`/Leads/${id}`);
  }

  create(data) {
    return http.post('/Leads', data);
  }

  update(id, data) {
    return http.put(`/Leads/${id}`, {
      table_name: 'pos_leads',
      table_data: data,
    });
  }

  invoiceupdate(id, data) {
    return http.put(`/Leads/invoice/${id}`, data);
  }

  delete(id) {
    return http.delete(`/Leads/${id}`);
  }

  pagination(data) {
    return http.post(`/Leads/Leads`, data);
  }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
}

export default new Leadsservice();
