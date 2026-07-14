import http from '../http-common';

class TotAccservice {
  get() {
    return http.get('/totalAccounts');
  }
  getAging(headerLocationId){
    return http.get(`/totalAccounts/${headerLocationId}/ReceivablesAging`)
  }
  getAgingPayable(headerLocationId){
    return http.get(`/totalAccounts/${headerLocationId}/PayablesAging`)
  }

  getpayableduedays(){
    return http.get("/totalAccounts/payableduedays")
  }

  getpayableoutStand(){
    return http.get("/totalAccounts/payableOutstanding")
  }

  totalPayable(headerLocationId){
    return http.get(`/totalAccounts/${headerLocationId}/totalPayable`)
  }

  totalAccountsPayable(headerLocationId){
    return http.get(`/totalAccounts/${headerLocationId}/totalAccountsPayable`)
  }

  totalAccountsReceivable(headerLocationId){
    return http.get(`/totalAccounts/${headerLocationId}/totalAccountsReceivable`)
  }

  totalReceivable(headerLocationId){
    return http.get(`/totalAccounts/${headerLocationId}/totalReceivable`)
  }
  
}

export default new TotAccservice();
