import http from '../http-common';
class AccountsLedgerService {
  getAll() {
    return http.get('/accountsLedger');
  }

  get(id) {
    return http.get(`/accountsLedger/${id}`);
  }

  getTrailBalance() {
    return http.get('/accountsLedger/trailBalance');
  }

  getcashFlow() {
    return http.get('/accountsservice/api/cashflow');
  }


}

export default new AccountsLedgerService();
