import http from '../http-common';

class BankCreation {
  getAll() {
    return http.get('/bankCreation');
  }
  getwithledger() {
    return http.get('/bankCreation/withledgerid')
  }

  getByPagination(data) {
    return http.post('/bankCreation/pagination', data);
  }

  //   getAllCashBox() {
  //     //http.defaults.headers.common['Authorization'] = token;
  //     return http.get(`/cashBox`);
  //   }

  getAllBankCreationAdjustment(id, headerLocationId) {
    //http.defaults.headers.common['Authorization'] = token;
    return http.get(
      `/bankCreation/bankCreationAdjustment/${id}/${headerLocationId}`,
    );
  }

  create(data) {
    return http.post('/bankCreation', data);
  }

  updateBankCreation(id, data) {
    return http.put(`/bankCreation/${id}`, data);
  }

  delete(id) {
    return http.delete(`/bankCreation/${id}`);
  }
  getBankAccounts() {
    return http.get('/bankCreation/bank/Reconciliation/bankAccounts');
  }

  getBankReconciliation(id) {
    return http.get(`/bankCreation/bank/Reconciliation/${id}`);
  }

  // getBankReconciliationTable() {
  //   return http.get(`/bankCreation/bank/ReconciliationTable`);
  // }

  getBankReconciliationTable(data) {
    return http.post(`/bankCreation/bank/Reconciliations`,data);
  }

  addBankReconciliationTable(data) {
    return http.post(`/bankCreation/bank/ReconciliationTable`,data);
  }

  getRecords(data) {
    return http.post(`/bankCreation/bank/compareData/getRecords`,data);
  }


  getMatchedReconciliation(id) {
    return http.get(`/bankCreation/bank/matchedReconciliationTable/${id}`);
  }
  deleteBankReconciliationTable(id) {
    return http.delete(`bankCreation/bank/ReconciliationTable/${id}`);
  }
  getBankStatementColumnName(id) {
    return http.get(`/bankCreation/bankStatementColumnName`);
  }
  pagination(data) {
    return http.post(`/bankCreation/searchBank`, data)
  }
  getContraBank() {
    return http.get(`/bankCreation/withContraledgerid`)
  }

  addedPayInOutTransactions(data) {
    return http.post(`/bankCreation/bank/added/payInOut/transactions`, data)
  }

  getReconciliationCountAndTotal(payload){
    return http.post('/bankCreation/overallCountTotal', payload)
  }

  getUnreconciledAndReconciled(payload){
    return http.post('/bankCreation/unreconciledAndReconciled', payload)
  }

  getManualMatchRecords(data) {
    return http.post('/bankCreation/manualMatchRecords', data)
  }

  updateUnreconciled(data) {
    return http.post('/bankCreation/updateUnreconciled', data)
  }

  getAllBankAccs() {
    return http.get('/bankCreation/getAllBankAccs')
  }

  getPaymentMethodByBankId(bankId) {
    return http.get(`/bankCreation/getPaymentMethod/${bankId}`)
  }

  individualReconciliation(payload, type){
    return http.put(`/bankCreation/individualBankReconciliation/${type}`, payload)
  }

  getAllBankReconciliation(data) {
    return http.post(`/bankCreation/allBankReconciliationRecords`, data)
  }
  
}


export default new BankCreation();
