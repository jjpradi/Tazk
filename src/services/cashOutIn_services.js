import http from '../http-common';

class CashOutInservice {
  getAll() {
    return http.get('/cashOutIn');
  }

  get(id) {
    return http.get(`/cashOutIn/${id}`);
  }

  create(data) {
    return http.post('/cashOutIn', data);
  }
  createcontra(data) {
    return http.post('/cashOutIn/contracreate/cashtransaction', data);
  }

  updatecontra(data) {
    return http.post('/cashOutIn/contraUpdate/cashtransaction', data);
  }

  getpayinamount(data) {
    return http.post('/cashOutIn/payOutAmountValidation',data);
  }

  update(id, data) {
    return http.put(`/cashOutIn/${id}`, data);
  }

  getpayinout() {
    return http.get('/cashOutIn/totalInOut');
  }

  delete(id) {
    return http.delete(`/cashOutIn/${id}`);
  }

  getallreport(employee_id, location_id, date) {
    return http.get(
      `/cashOutIn/dailyReport/${employee_id}/${location_id}/${date}`,
    );
  }

  getallpaymentreport(data) {
    return http.post(`/cashOutIn/dailyReport`, data);
  }

  getallreportcontra(employee_id, location_id, date) {
    return http.get(
      `/cashOutIn/dailyReport/contra/${employee_id}/${location_id}/${date}`,
    );
  }

  getdenominationvalidation(cashboxId) {
    return http.post(`/cashOutIn/denominationValidation/${cashboxId}`);
  }

  updateCashOutIn(data) {
    return http.post(`/cashOutIn/updateCashOutIn`, data);
  }

  getPayInOutContraSequence(params){
    return http.get(`/cashOutIn/payInOutContraSequence/${params}`)
  }
}
export default new CashOutInservice();
