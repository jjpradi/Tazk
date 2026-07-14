import {idID} from '@mui/material/locale';
import http from '../http-common';

class CashBox {
  getAll() {
    return http.get(`/cashDenominaation`);
  }
  getAllCashBox() {
    //http.defaults.headers.common['Authorization'] = token;
    return http.get(`/cashBox`);
  }
  getAllCashBoxByHeaderLocationId(headerLocationId) {
    //http.defaults.headers.common['Authorization'] = token;
    return http.get(`/cashBox/location/${headerLocationId}`);
  }
  getCashBoxLocation(headerLocationId) {
    //http.defaults.headers.common['Authorization'] = token;
    return http.get(`/cashBox/cashBoxByLocation/${headerLocationId}`);
  }
  getAllCashBoxAdjustment(id, headerLocationId) {
    //http.defaults.headers.common['Authorization'] = token;
    return http.get(`/cashBox/userLocationCashbox/${id}/${headerLocationId}`);
  }

  createCashBox(data) {
    return http.post('/cashBox', data);
  }

  createCashBoxAdjustment(data) {
    return http.post('/cashBox/cashBoxAdjustment', data);
  }

  createCurrentBalance(data) {
    return http.post('/cashBox/currentBalance', data);
  }

  updateCashBox(id, data) {
    return http.put(`/cashBox/${id}`, data);
  }
  getCashBoxSummary(id) {
    return http.get(`/cashBox/summary/${id}`);
  }

  getSessionBasedCashBoxSummary(id) {
    return http.get(`/cashBox/summary/session/${id}`);
  }

  deleteCashBox(id, ledgerId) {
    return http.delete(`/cashBox/${id}/${ledgerId}`);
  }
  CashInHand() {
    return http.get('/cashBox/CashInHand');
  }
  CashInHandDetails(data) {
    return http.post('/cashBox/CashInHandDetails', data);
  }

  CashInHandDetailsByTransactionEntries(data) {
    return http.post('/cashBox/CashInHandDetails/byTransactionEntries', data);
  }

  getbalanceenquiry(date) {
    return http.get(
      `/cashBox/openingclosing/dailyReport/balanceenquiry/${date}`,
    );
  }
  cashInHandMonth(data) {
    return http.post(`/cashBox/cashInHand/dashBoard`,data);
  }

  cashInHandFiscalYear(data) {
    return http.post(`/cashBox/cashInHand/financialYear`,data);
  }
  
  cashboxOpeningClosing(data) {
    return http.post(`/cashBox/cashboxopeningclosing/dailyreport`, data)
  }
  
  cashboxPaymentEntry(data) {
    return http.post(`/cashBox/PaymentEntry`, data)
  }

  cashboxReceiptEntry(data) {
    return http.post(`/cashBox/ReceiptEntry`, data)
  }

  locationcashboxdenomination(location_id, date){
    return http.get(`/cashBox/Locationcashboxdenomination/${location_id}/${date}`)
  }

  GetledgerSummary(data) {
    return http.post(`/cashBox/GetledgerSummary/all`,data)
  }

  pagination(data) {
    return http.post(`/cashBox/searchCashBox`, data)
  }

  getContraCashBox() {
    return http.get(`/cashBox/contraCashBox`)
  }

  CashInBankCash(data) {
    return http.post('/cashBox/CashInBankCash', data);
  }

  getBankAndCashAccounts(payload){
    return http.post('/cashBox/cashAndBankAccounts', payload)
  }

  getCreditDebitHint(payload){
    return http.post('/cashBox/creditDebitHint', payload)
  }

  getConsolidatedTotalAmount(payload){
    return http.post('/cashBox/consolidatedRecords', payload)
  }

  getTransactionList(payload){
    return http.post('/cashBox/transactionsByCashBank', payload)
  }

}

export default new CashBox();
