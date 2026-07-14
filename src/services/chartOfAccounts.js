import http from '../http-common';
class ChartOfAccountsService {
  getAll() {
    return http.get('/chartOfAccount');
  }

  journalaccount(){
    return http.get('/chartOfAccount/journalAccount');
  }

  byIdAndName(body) {
    return http.post('/chartOfAccount/byNameAndId', body);
  }

  getpaginationdataAll(data) {
    return http.post(`/chartOfAccount/pagination`, data);
  }

  getDate(from, to) {
    return http.get(`/chartOfAccount/filter/${from}/${to}`);
  }

  pagination(data) {
    return http.post(`/chartOfAccount/searchChartofAccount`, data);
  }

  getData() {
    return http.get('/chartOfAccount');
  }

  accountGroupBasedLedger(type) {
    return http.get(`/chartOfAccount/filter/account/${type}`);
  }

  get(id) {
    return http.get(`/chartOfAccount/${id}`);
  }
  exportData(from, to){
    return http.get(`/chartOfAccount/exportData/${from}/${to}`)
  }

  currentJournalEntrySequence(){
    return http.get(`/chartOfAccount/currentJournalEntrySequence`)
  }

  getaccType(){
    return http.get(`/chartOfAccount/acctype`)
  }
}

export default new ChartOfAccountsService();
