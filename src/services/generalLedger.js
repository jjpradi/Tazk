import http from '../http-common';
class GeneralLedgerService {
  getAll(from, to) {
    return http.get(`/generalLedger/filter/${from}/${to}`);
  }

  getDate(data) {
    return http.post(`/ledger/filter/generalLedger`, data);
  }

  get(id) {
    return http.get(`/generalLedger/${id}`);
  }

  getMonthlySummary(id, date, toDate) {
    return http.get(`/generalLedger/monthlySummary/${id}/${date}/${toDate}`);
  }

  searchLedgerPagination(data) {
    return http.post(`/ledger/Searchledger`, data);
  }

  monthlySummarySendMail(data) {
    return http.post(`/generalLedger/monthlySummary/sendMail`, data);
  }

  exportData(from, to){
    return http.get(`/ledger/exportData/${from}/${to}`)
  }
}

export default new GeneralLedgerService();
