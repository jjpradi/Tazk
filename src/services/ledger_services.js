import http from '../http-common';

class Ledgerservice {
  getAll() {
    return http.get('/ledger');
  }
  getPaginate(data,) {
    return http.post('/ledger/pagination', data);
  }

  get(id) {
    return http.get(`/ledger/${id}`);
  }

  create(data) {
    return http.post('/ledger', data);
  }

  updateStock(id, data) {
    return http.put(`/ledger/${id}`, data);
  }

  update(id, data) {
    return http.put(`/ledger/${id}`, data);
  }

  delete(id) {
    return http.delete(`/ledger/${id}`);
  }

  LedgerReceived() {
    return http.get(`/ledger/stockLedger`);
  }

  getParentWithGroupId() {
    return http.get(`/ledger/parent/group`);
  }

  getAllParentLedger() {
    return http.get(`/ledger/parentLedger`);
  }

  updateAllParentLedger(data) {
    return http.put(`/ledger/parentLedger`,data);
  }

  getAllLedgerVouchers(data) {
    return http.post(`/ledger/ledgerVouchers/getById`,data);
  }

  generalLedgerFilterData() {
    return http.get(`/ledger/generalLedger/filterData`);
  }

  // payablesPaymentEntry(data){
  //   return http.put(`/ledger/stockLedgerPaymentEntry`, { "table_name": "purchase","table_data": data });
  // }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }

  getMigration() {
    return http.get('/ledger/migration/getDetails');
  }

  ledgerMigration(data) {
    return http.post('/ledger/migration/getDetails',data);
  }

  updateMigration(data) {
    return http.put(`/ledger/migration/updateDetails`,data);
  }

  Createmigration(data) {
    return http.post(`/ledger/migration/updateDetails`,data);
  }

  listgroup(data) {
    return http.post(`/ledger/migration/listGroups`,data);
  }

  existUpdate(data) {
    return http.post(`/ledger/exist/Updateledger`,data);
  }

  createSundry(data) {
    return http.post(`/ledger/sundry/Creates`,data);
  }

  getOpeningBal(type) {
    return http.post(`/ledger/getOpeningBal/${type}`,);
  }

  openingBalPayment(data) {
    return http.post(`/ledger/openingBalPayment/`, data);
  }

  getAccountGroup(){
    return http.get('/ledger/accountGroup')
  }
}

export default new Ledgerservice();
