import http from '../http-common';

class PurchasesService {

  getPurchasesByPagination(data,employee_id, headerLocationId) {
    return http.post(`/purchase/pagination/${employee_id}/${headerLocationId}`,data);
  }
  // getPurchasesByPagination(data,employee_id, headerLocationId) {
  //   return http.post(`/purchase/testPagination/${employee_id}/${headerLocationId}`,data);
  // }

  getFilterAll(data, employee_id, headerLocationId) {
    return http.post(
      `/purchase/filterPurchase/${employee_id}/${headerLocationId}`,
      data,
    );
  }
  getdailyreportpurchase(employee_id, headerLocationId, date){
    return http.get(`/purchase/dailyreport/purchasedata/${employee_id}/${headerLocationId}/${date}`)
  }

  purchaseConsolidated(id) {
    return http.get(`/purchase/consolidated/${id}`);
  }

  get(id) {
    return http.get(`/purchase/${id}`);
  }

  potCodeGet(id) {
    return http.get(`/purchase/potCodeSeq/${id}`);
  }

  getPurchaseAllReport(data) {
    return http.post(`/purchase/purchaseReport`,data);
  }
  exportDatapurchasereport(data) {
    return http.post(`/purchase/exportData`,data);
  }

  potCodeUpdate(id, data) {
    return http.put(`/purchase/potCodeSeq/${id}`, data);
  }

  create(data, employee_id, headerLocationId) {
    return http.post(`/purchase/${employee_id}/${headerLocationId}`, {
      table_name: 'purchase',
      table_data: data,
    });
  }

  update(id, data, employee_id, headerLocationId) {
    return http.put(`/purchase/${id}/${employee_id}/${headerLocationId}`, {
      table_name: 'purchase',
      table_data: data,
    });
  }

  paymentEntry(data, employee_id, headerLocationId) {
    return http.put(
      `/purchase/paymentEntry/${employee_id}/${headerLocationId}`,
      { table_name: 'purchase', table_data: data },
    );
  }

  delete(id, data, employee_id, headerLocationId) {
    return http.post(
      `/purchase/${id}/${employee_id}/${headerLocationId}`,
      data,
    );
  }

  // purchaseReceived(employee_id, headerLocationId) {
  //   return http.get(
  //     `/purchase/payables/${employee_id}/${headerLocationId}/payable`,
  //   );
  // }

  purchaseReceived(data, employee_id, headerLocationId) {
    return http.post(
      `/purchase/payables/${employee_id}/${headerLocationId}/payable`,data
    );
  }

  purchaseReceivedPending(data, employee_id, headerLocationId) {
    console.log('dataaaa', data)
    return http.post(
      `/purchase/payablesPending/${employee_id}/${headerLocationId}/payable`,data
    );
  }

  
  completedpurchaseReceived(employee_id, headerLocationId, data) {
    return http.post(
      `/purchase/entrypayment/${employee_id}/${headerLocationId}/payment`, data,
    );
  }

  AdvanceEntry(data) {
    return http.post(
      `/purchase/Advanceamount`, data,
    );
  }

  payablesBySupplierId(employee_id, headerLocationId, supplierId) {
    return http.get(
      `/purchase/payablesBySupplierId/${employee_id}/${headerLocationId}/${supplierId}`,
    );
  }

  vendorTotalPurchaseAmount(supplierId) {
    return http.get(
      `/purchase/totalPurchaseAmount/byVendor/${supplierId}`,
    );
  }

  payablesPaymentEntry(data) {
    return http.put(`/purchase/payablesPaymentEntry`, {
      table_name: 'purchase',
      table_data: data,
    });
  }

  posSequence(id, data) {
    return http.put(`/purchase/posSequence/${id}`, data);
  }

  receivingsPayments(id, data) {
    return http.post(`/purchase/receivingsPayments/${id}`, {table_data : data});
  }

  return(data, employee_id, headerLocationId) {
    return http.put(
      `/purchase/return/${employee_id}/${headerLocationId}`,
      data,
    );
  }

  searchVendorItemForReturn(data) {
    return http.post('/purchase/searchVendorItemForReturn', data);
  }

  getAllVendorUnreturnedItems(data) {
    return http.post('/purchase/getAllVendorUnreturnedItems', data);
  }

  getItemLotsForReturn(data) {
    return http.post('/purchase/getItemLotsForReturn', data);
  }

  scanLotForReturn(data) {
    return http.post('/purchase/scanLotForReturn', data);
  }

  getOpeningStockProducts(data) {
    return http.post('/purchase/getOpeningStockProducts', data);
  }

  stockUpload(data) {
    return http.put(`/purchase/stockUpload`, data);
  }



  getPurchaseReport(employee_id, headerLocationId, data) {
    return http.post(`/purchase/report/${employee_id}/${headerLocationId}`, data);
  }

  filterPurchaseReport(data) {
    return http.post(`/purchase/filterPurchaseReport`, data);
  }

  purchaseCompare() {
    return http.get(`/purchase/dashboard/payables`);
  }
  receivableCompare() {
    return http.get(`/purchase/dashboard/receivables`);
  }
  getagewisepayable(employee_id, headerLocationId) {
    return http.get(`/purchase/getagewise/${employee_id}/${headerLocationId}`);
  }

  printLabel(data){
    return  http.post(`/qrcode/printLabel`,data)
  }

  searchPurchaseReport(data) {
    return http.post(`/purchase/searchPurchaseReport`, data)
  }
  searchPurchase(data) {
    return http.post(`/purchase/searchPurchase`, data)
  }
  
  // //Purchase Report API===
  // pagination(data) {
  //   return http.post(`/purchase/searchPurchaseReport`, data);
  // }

  // payable Report api====
  payablereport(data) {
    return http.post(`/purchase/searchPayableReport`, data);
  }

  updatePayablePaymentEntry(data) {
    return http.put(`/purchase/updatePayablePaymentEntry`,{
      table_name: 'purchase',
      table_data: data,
    });
  }
  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }

  getBarCodeQrSeq(payload){
    return http.post(`/purchase/barCodeQrSequence`, payload)
  }

  purchaseOrderByVendor(data){
    return http.post(`/purchase/purchaseOrderByVendor`, data)
  }

  gettdstax(type, id){
    return http.get(`/purchase/tax/tdstaxrates/${type}/${id}`)
  }

  getProductPurchaseHistory(id){
    return http.get(`/purchase/getProductPurchaseHistory/${id}`)
  }

  getAllPayments(){
    return http.get(`/purchase/getAllPaymentEntry`)
  }

  getPaymentsById(id){
    return http.get(`/purchase/getPaymentById/${id}`)
  }

  advanceEntryEdit(data){
    return http.put(`/purchase/editAdvance`, {
      table_name: 'pos_receivings',
      table_data: data,
    })
  }

  payablesPaymentEntryEdit(data){
    return http.put(`/purchase/editPayment`, {
      table_name: 'pos_receivings',
      table_data: data,
    })
  }

  checkInvoiceNumberExist(data){
    return http.post('/purchase/checkInvoiceExist', data)
  }

  purchaseSummary(data){
    return http.post('/purchase/purchaseSummary',data)
  }

  vendorRefundEntry(data){
    return http.post('/purchase/refundEntry', data)
  }

  editVendorRefundEntry(data, id){
    return http.put(`/purchase/editRefundEntry/${id}`, data)
  }

  supplierTimelineData(id,type){
    return http.get(`/purchase/timelineData/${id}/${type}`)
  }
}

export default new PurchasesService();
