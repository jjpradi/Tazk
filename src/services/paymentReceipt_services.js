import http from '../http-common';

class PaymentReceiptservice {
  getAll(from, to) {
    //http.defaults.headers.common['Authorization'] = token;
    return http.get(`/paymentReceipt/${from}/${to}`);
  }

  getDate(data) {
    //http.defaults.headers.common['Authorization'] = token;
    return http.post(`/paymentReceipt/searchPaymentReceipt`,data);
  }

  // get(id) {
  //   //http.defaults.headers.common['Authorization'] = token;
  //   return http.get(`/paymentReceipt/${id}`);
  // }

  // getAll() {
  //   return http.get("/paymentReceipt");
  // }

  get(id) {
    return http.get(`/paymentReceipt/${id}`);
  }

  create(data) {
    return http.post('/paymentReceipt', data);
  }

  update(id, data) {
    return http.put(`/paymentReceipt/${id}`, data);
  }

  updateStatus(id) {
    return http.put(`/paymentReceipt/${id}`);
  }

  delete(id) {
    return http.delete(`/paymentReceipt/${id}`);
  }
  //expense get all
  expense() {
    return http.get('/paymentReceipt/expense');
  }

  top3(location_id) {
    return http.get(`/paymentReceipt/top3/${location_id}`);
  }

  getData() {
    return http.get(`/paymentReceipt`);
  }

  getMonthData(from, to) {
    return http.get(`/paymentReceipt/month/${from}/${to}`);
  }

  getTotalAmountData() {
    return http.get(`/paymentReceipt/total/amount`);
  }

  getPayinPayoutById(id, type) {
    return http.get(`/paymentReceipt/payinPayoutById/${id}/${type}`);
  }
}
export default new PaymentReceiptservice()
