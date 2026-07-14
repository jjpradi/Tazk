import http from '../http-common';

class PosSession {
  getAll(id, headerLocationId) {
    return http.get(`/posSession/${id}/${headerLocationId}`);
  }

  getById(id) {
    return http.get(`/posSession/newsession/posGetById/${id}`);
  }

  update(id, data, employeeId, headerLocationId) {
    return http.put(
      `/posSession/${id}/${employeeId}/${headerLocationId}`,
      data,
    );
  }

  posLastSyncUpdate(id, data, employee_id, headerLocationId) {
    return http.put(
      `/posSession/lastsync/posLastSyncUpdate/${id}/${employee_id}/${headerLocationId}`,
      data,
    );
  }

  getPaymentModes(id) {
    return http.get(`/posSession/paymentModes/${id}`);
  }

  getPreOrderPaymentModes(id) {
    return http.get(`/posSession/preOrder/paymentModes/${id}`);
  }
  getSalesBySession(id) {
    return http.get(`/posSession/getSalesBySession/${id}`);
  }
  
  // getPosUserDashBoardCashInHand(data) {
  //   return http.post(`/posSession/posUserDashBoard/cashInHand`,data);
  // }
  getPosUserDashBoardCashInHand(data) {
    return http.post(`/posSession/posUserDashBoard/cashInHandByLocation`,data);
  }
}

export default new PosSession();
