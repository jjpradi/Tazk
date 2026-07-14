import http from '../http-common';

class PosCreationservice {
  getAll() {
    return http.get('/posCreation');
  }

  locationpos(headerLocationId) {
    return http.get(`/posCreation/location/Pos/${headerLocationId}`);
  }

  get(id) {
    return http.get(`/posCreation/${id}`);
  }

  create(data) {
    return http.post('/posCreation', data);
  }

  update(id, data) {
    return http.put(`/posCreation/posUpdate/${id}`, data);
  }

  delete(id) {
    return http.delete(`/posCreation/${id}`);
  }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }
  getType(data) {
    return http.get(`/posCreation/voucher`,data);
  }

  getAllinvoice(data) {
    return http.get(`/posCreation/invoices`,data);
  }

  
  insert(data) {
    return http.post(`/posCreation/voucher`,data);
  }

  Updatenvoice(id,data) {
    return http.put(`/posCreation/voucher/${id}`,data);
  }

  deleteinvoice(id) {
    return http.delete(`/posCreation/voucher/${id}`);
  }

  pagination(data) {
    return http.post(`/posCreation/searchPoscreation`, data)
  }
  
}

export default new PosCreationservice();
