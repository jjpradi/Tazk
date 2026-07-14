import http from '../http-common';

class TaxCustomerCategoryservice {
  getAll() {
    return http.get('/pos_tax_jurisdictions');
  }

  get(id) {
    return http.get(`/pos_tax_jurisdictions/${id}`);
  }

  create(data) {
    return http.post('/pos_tax_jurisdictions', {
      table_name: 'pos_tax_jurisdictions',
      table_data: data,
    });
  }

  update(id, data) {
    return http.put(`/pos_tax_jurisdictions/${id}`, {
      table_name: 'pos_tax_jurisdictions',
      table_data: data,
    });
  }

  delete(id) {
    return http.delete(`/pos_tax_jurisdictions/${id}`);
  }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
}

export default new TaxCustomerCategoryservice();
