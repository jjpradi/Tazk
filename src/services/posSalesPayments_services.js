import http from '../http-common';

class PosSalesPaymentservice {
  getAll(id) {
    return http.get(`/posSalesPayments/${id}`);
  }
}

export default new PosSalesPaymentservice();
