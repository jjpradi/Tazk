import http from '../http-common';

class CndnReportService {
  getReturnCreditNotes(data) {
    return http.post('/reports/cndn/returnCreditNotes', data);
  }

  getManualCreditNotes(data) {
    return http.post('/reports/cndn/manualCreditNotes', data);
  }

  getReturnDebitNotes(data) {
    return http.post('/reports/cndn/returnDebitNotes', data);
  }

  getManualDebitNotes(data) {
    return http.post('/reports/cndn/manualDebitNotes', data);
  }
}

export default new CndnReportService();
