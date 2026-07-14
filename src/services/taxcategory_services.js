import http from '../http-common';

class TaxCategoryservice {
  getAll() {
    return http.get('/taxCategory');
  }

  get(id) {
    return http.get(`/taxCategory/${id}`);
  }

  create(data) {
    return http.post('/taxCategory', {
      table_name: 'pos_tax_categories',
      table_data: data,
    });
  }

  update(id, data) {
    return http.put(`/taxCategory/${id}`, {
      table_name: 'pos_tax_categories',
      table_data: data,
    });
  }

  delete(id) {
    return http.delete(`/taxCategory/${id}`);
  }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
}

export default new TaxCategoryservice();
