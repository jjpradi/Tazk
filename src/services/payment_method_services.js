import http from '../http-common';

class PaymentMethodservice {
  getAll() {
    return http.get('/paymentMethod');
  }

  getPaymentType() {
    return http.get('/paymentMethod/paymentType');
  }

  get(id) {
    return http.get(`/paymentMethod/${id}`);
  }

  create(data) {
    return http.post('/paymentMethod', data);
  }

  update(id, data) {
    return http.put(`/paymentMethod/${id}`, data);
  }

  delete(id) {
    return http.delete(`/paymentMethod/${id}`);
  }

  getAllPaymentModeForPaymentPage() {
    return http.get('/paymentMethod/getAllPaymentModes/paymentPage');
  }

  pagination(data) {
    return http.post(`/paymentMethod/searchPaymentMethod`, data);
  }

  billReceivables(data) {
    return http.post(`/outstanding_xml/xmlData`, data);
  }

  lastSync() {
    return http.get('/outstanding_xml/lastSync');
  }

  sendOtp(data) {
    return http.post('/outstanding_xml/verification/sendOtp', data)
  }

  verifyOtp(data) {
    return http.post('/outstanding_xml/verification/verifyOtp', data)
  }
  getUnmatchedRecords() {
    return http.get('/outstanding_xml/getUnmatchedRecords');
  }

  }
export default new PaymentMethodservice();
