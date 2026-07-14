import http from '../http-common';

class Balancesheetservice {
  getAll(from, to) {
    //http.defaults.headers.common['Authorization'] = token;
    return http.get(`/balanceSheet/filter/${from}/${to}`);
  }

  getpaginationdata(data) {
    return http.post(`/balanceSheet/pagination`, data);
  }

  getDate(from, to) {
    //http.defaults.headers.common['Authorization'] = token;
    return http.get(`/balanceSheet/filter/${from}/${to}`);
  }

  get(id) {
    //http.defaults.headers.common['Authorization'] = token;
    return http.get(`/balance/${id}`);
  }

  getaccounts(from, to) {
    return http.get(`/balanceSheet/accounts/balancesheet/${from}/${to}`);
  }

  getbalanceprofit(from, to) {
    return http.get(`/balanceSheet/balancesheet/profitloss/${from}/${to}`);
  }
}

export default new Balancesheetservice();
