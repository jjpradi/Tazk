import http from '../http-common';

class ProductErpDetailsService {
  get(id) {
    return http.get(`/product/erpDesign/${id}`);
  }

  getCustomerDetails(id, type) {
    return http.get(`/customer/erpDesign/${id}/${type}`);
  }
}
export default new ProductErpDetailsService();
