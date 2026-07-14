import http from '../http-common';

class TaxJurisdictionservice {
  getAll() {
    return http.get('/taxJurisdictions');
  }

  get(id) {
    return http.get(`/taxJurisdictions/${id}`);
  }

  create(data) {
    return http.post('/taxJurisdictions', {
      table_name: 'pos_tax_jurisdictions',
      table_data: data,
    });
  }

  update(id, data) {
    return http.put(`/taxJurisdictions/${id}`, {
      table_name: 'pos_tax_jurisdictions',
      table_data: data,
    });
  }

  delete(id) {
    return http.delete(`/taxJurisdictions/${id}`);
  }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
}

export default new TaxJurisdictionservice();
