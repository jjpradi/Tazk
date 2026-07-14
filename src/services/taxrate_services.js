import http from '../http-common';

class TaxRateservice {
  getAll(data) {
    return http.post('/taxRates/searchTaxRate', data);
  }

  get(id) {
    return http.get(`/taxRates/${id}`);
  }

  create(data) {
    return http.post('/taxRates', {
      table_name: 'pos_tax_rates',
      table_data: data,
    });
  }

  update(id, data) {
    return http.put(`/taxRates/${id}`, {
      table_name: 'pos_tax_rates',
      table_data: data,
    });
  }

  delete(id) {
    return http.delete(`/taxRates/${id}`);
  }

  search(data) {
    return http.post(`/taxRates/searchTaxRate`, data)
  }
  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
}

export default new TaxRateservice();
