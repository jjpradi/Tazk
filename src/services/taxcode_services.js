import http from '../http-common';

class TaxCodeservice {
  getAll() {
    return http.get('/taxCodes');
  }

  get(id) {
    return http.get(`/taxCodes/${id}`);
  }

  create(data) {
    return http.post('/taxCodes', {
      table_name: 'pos_tax_codes',
      table_data: data,
    });
  }

  update(id, data) {
    return http.put(`/taxCodes/${id}`, {
      table_name: 'pos_tax_codes',
      table_data: data,
    });
  }

  delete(id) {
    return http.delete(`/taxCodes/${id}`);
  }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
}

export default new TaxCodeservice();
