import http from '../http-common';

class DiscountType {
  getAll() {
    return http.get(`/discountType`);
  }
  //   getAllCashBox() {
  //     //http.defaults.headers.common['Authorization'] = token;
  //     return http.get(`/cashBox`);
  //   }

  create(data) {
    return http.post('/discountType', data);
  }

  updateDiscountType(id, data) {
    return http.put(`/discountType/${id}`, data);
  }

  delete(id) {
    return http.delete(`/discountType/${id}`);
  }
}

export default new DiscountType();
