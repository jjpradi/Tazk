import http from '../http-common';

class ManualNotesService {
  getAll(data) {
    return http.post('/manualNotes/getAllData', data);
  }

  create(data) {
    return http.post('/manualNotes', data);
  }

  delete(type, id,data) {
    return http.put(`/manualNotes/deleteNote/${type}/${id}`,data);
  }

  deleteAllNotes(type, id) {
    return http.delete(`/manualNotes/deleteAllNotes/${type}/${id}`);
  }

  update(data, id) {
    return http.put(`/manualNotes/updateManualNote/${id}`, data);
  }
  getsequence(){
    return http.get('/manualNotes/numbergenerate/sequencecndn');
  }

  getPaginate(data) {
    return http.post('/manualNotes/SearchCreditdebit', data);
  }
  
  recentCreditDebitNotes(data) {
    return http.post('/manualNotes/recentCreditDebitNotes', data);
  }

  getSchemesLedger(data) {
    return http.post('/manualNotes/getSchemesLedger',data);
  }

   getSchemesLedgerParent(data) {
    return http.post('/manualNotes/getSchemes/parentLedger',data);
  }


  createSchemesLedger(data) {
    return http.post('/manualNotes/createSchemesLedger', data);
  }

  getManualNoteSchemesById(type, id, data = {}) {
    return http.post(`/manualNotes/getSchemes/${type}/${id}`, data);
  }
 ManualcreditSalesPurchase(data){
  return http.post('/manualNotes/ManualcreditSalesPurchase', data)
 }
 getAllCreditNotes() {
  return http.get('/manualNotes/allCreditNotes')
 }
 getCreditNotesReceiptsById(id) {
  return http.get(`/manualNotes/creditNotesReceipts/${id}`)
 }
 ManualcreditSalesReturn(data){
  return http.post('/manualNotes/ManualcreditSalesReturn', data)
 }
 creditNotesTimeline(id){
  return http.post(`/manualNotes/creaditNoteTimeline/${id}`)
  }
  
  getAllDebittNotes() {
  return http.get('/manualNotes/getAllDebitNotes')
 }

  cancelManualIrn(data) {
    return http.post('/manualNotes/cancelirn', data);
  }


}
export default new ManualNotesService();
