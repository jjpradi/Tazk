import http from '../http-common';

class Salesservice {
  getAll(employee_id, headerLocationId) {
    return http.get(`/sales/${employee_id}/${headerLocationId}`);
  }

  getLotDetails(data) {
    return http.post(`/sales/getLotsDetails`,data);
  }

  getAllFilterData(data, employee_id, headerLocationId) {
    return http.post(
      `/sales/salesDetails/${employee_id}/${headerLocationId}`,
      data,
    );
  }

  getSalesByPagination(data,employee_id, headerLocationId) {
    return http.post(`/sales/pagination/${employee_id}/${headerLocationId}`,data);
  }

   getSaleOrderByPagination(data,employee_id, headerLocationId) {
    return http.post(`/sales/saleOrder/pagination/${employee_id}/${headerLocationId}`,data);
  }

   getDCByPagination(data,employee_id, headerLocationId) {
    return http.post(`/sales/deliveryChallan/pagination/${employee_id}/${headerLocationId}`,data);
  }

  getSalesData(data,employee_id, headerLocationId) {
    return http.post(`/sales/allInvoice/${employee_id}/${headerLocationId}`,data);
  }

  get(id) {
    return http.get(`/sales/${id}`);
  }

  getSalesStatusList() {
    return http.get(`/sales/salesStatusList`);
  }

  create(data, employee_id, headerLocationId) {
    return http.post(`/sales/${employee_id}/${headerLocationId}`, {
      table_name: 'pos_sales',
      table_data: data,
    });
  }

  createPayment(data) {
    return http.post('/sales/payment', {
      table_name: 'pos_sales',
      table_data: data,
    });
  }

  salesgetbyid(id) {
    return http.get(`/sales/getsalesId/${id}`);
  }

  deletereceipts(data, type) {
    if(type === 'Payments'){
      return http.put(`/purchase/deletePaymentEntry`, data);
    }
    return http.post(`/sales/deleteReceipts`, data);
  }

  sendMail(data) {
    return http.post('/sales/sendMail', data);
  }

  sendTestSMS(data) {
    return http.post('/sales/sendTestSMS', data);
  }

  update(id, data, employee_id, headerLocationId) {
    const { type, ...table_data } = data;
    return http.put(`/sales/${id}/${employee_id}/${headerLocationId}`, {
      table_name: 'pos_sales',
      table_data: data,
      type
    });
  }

  updateSO(id, data, employee_id, headerLocationId){
    return http.put(`/sales/updateSO/${id}/${employee_id}/${headerLocationId}`, data)
  }

  cancelinvoice(id, data) {
    return http.put(`/sales/${id}/invoicecancel`, {
      data
    });
  }

  receiptEntry(data) {
    return http.put(`/sales/receiptEntry`, {
      table_name: 'pos_sales',
      table_data: data,
    });
  }
  updateReceiptEntry(data) {
    return http.put(`/sales/updateReceiptEntry`, {
      table_name: 'pos_sales',
      table_data: data,
    });
  }

  delete(id, employee_id, headerLocationId) {
    return http.delete(`/sales/${id}/${employee_id}/${headerLocationId}`);
  }
  // saleReceived(employee_id, headerLocationId) {
  //   return http.get(`/sales/received/${employee_id}/${headerLocationId}`);
  // }
  saleReceived(data, employee_id, headerLocationId) {
    return http.post(`/sales/received/${employee_id}/${headerLocationId}`, data);
  }

  saleReceivedExport(data, employee_id, headerLocationId) {
    return http.post(`/sales/receivedExport/${employee_id}/${headerLocationId}`, data);
  }

  saleReceivedPending(data, employee_id, headerLocationId) {
    return http.post(`/sales/receivedPending/${employee_id}/${headerLocationId}`, data);
  }
  completedsaleReceived(employee_id, headerLocationId, data) {
    return http.post(`/sales/receipt/${employee_id}/${headerLocationId}/receipt`, data);
  }
  salesidget(customer_id) {
    return http.get(`/sales/${customer_id}/receipt`);
  }
  saleConsolidated() {
    return http.get(`/sales/consolidated`);
  }

  paymentReportBasedEmp(id) {
    return http.get(`/sales/paymentReportBasedEmp/${id}`);
  }

  //oustanding mailer

  outstandingmailer(employee_id, headerLocationId) {
    return http.get(
      `/sales/vpage/outstanding/${employee_id}/${headerLocationId}/out`,
    );
  }
  //debitor

  getDate(date, employee_id, headerLocationId,name) {
    return http.get(
      `/paymentConsolidated/${date}/${employee_id}/${headerLocationId}/${name}/consolidated`,
    );
  }

  getreportdata(date, employee_id, headerLocationId) {
    return http.get(
      `/chartOfAccount/${date}/${employee_id}/${headerLocationId}/dailyReport`,
    );
  }

  getErpData(id) {
    return http.get(`/sales/erpDetails/${id}`);
  }

  averagedebitor() {
    return http.get('/sales/debitor/sales');
  }

  //day sales

  oneDaySales() {
    return http.get('/sales/daySales/sales');
  }

  creditDebitNoteSeq(type) {
    return http.get(`/sales/creditDebitNoteSeq/${type}`);
  }

  creditDebitNoteSeqUpdate(type, data) {
    return http.put(`/sales/creditDebitNoteSeq/${type}`, data);
  }

  return(data, employee_id, headerLocationId) {
    return http.put(`/sales/return/${employee_id}/${headerLocationId}`, data);
  }

  dcreturn(data, employee_id, headerLocationId) {
    return http.put(`/sales/dcreturn/${employee_id}/${headerLocationId}`, data);
  }

  createCustomerTransactionDtl(data) {
    return http.post(`/sales/cutomerTransactionDtl`, data);
  }

  dailyReport(employee_id, headerLocationId, date) {
    return http.get(
      `/sales/dailyreport/${employee_id}/${headerLocationId}/${date}`,
    );
  }

  
  salesDataReport(data){
    return http.post(`/sales/SalesreportData`,data);
  }

  salesgetDataReport(datasvalue){
    return http.post(`/sales/SalesReportsAlldata`,datasvalue);
  }

  getReceivableReport(data) {
    return http.post(`/sales/ReceivableReport`, data);
  }
  exportDatareceivable(data) {
    return http.post(`/sales/exportData`, data);
  }

  getstockgroup(data){
    return http.post(`/sales/stock/Group/group`,data);
  }
  // deleteAll() {
  //   return http.delete(`/tutorials`);s
  // }

  // findByTitle(title) {
  //   return http.get(`/tutorials?title=${title}`);
  // }

  //Sales Report Final API----
  pagination(data) {
    return http.post(`/sales/searchSalesReport`, data);
  }

  //Receivable report API===
  Receivablepagination(data) {
    return http.post(`/sales/searchReceivableReport`, data);
  }

  sendDailyReportMail(data) {
    return http.post('/sales/sendDailyReportMail', data);
  }

  getCompanyAdminId() {
    return http.get(`/sales/getCompanyAdmin`);
  }
  searchSalesPagination(data) {
    return http.post(`/sales/searchSales`, data);
  }

  searchSaleOrderPagination(data) {
    return http.post(`/sales/searchSaleOrder`, data);
  }

  searchDcPagination(data) {
    return http.post(`/sales/searchDC`, data);
  }

  AdvanceEntry(data) {
    return http.post(
      `/sales/Advanceamount`, data,
    );
  }

  collections(data) {
    return http.post(`/paymentConsolidated/collections/reconcilate`,data);
  }

  Reportsget(date, employee_id, headerLocationId,name) {
    return http.get(`/paymentConsolidated/collectionsReport/${date}/${employee_id}/${headerLocationId}/${name}`);
  }
  createreq(data){
    return http.post(`/sales/discountApprovalReq`, data)
  }

  paymentCollection(data){
    return http.post(`/sales/paymentCollection`,data)
  }

  paymentCollectionApprove(data){
    return http.put(`/sales/paymentCollection/approve`,data)
  }

  paymentCollectionFilter(data){
    return http.post(`/sales/paymentCollectionFilter`,data)
  }

  getAllSalesManList(){
    return http.get(`/sales/getAllSalesManList`)
  }

  createIncentiveForSalesman(data) {
    return http.post(`/sales/createIncentive`, data)
  }

  getAllIncentives() {
    return http.get(`/sales/getAllIncentives`)
  }

  searchIncentive(data) {
    return http.post(`/sales/searchIncentive`, data)
  }

  deleteSalesmanIncentive(data) {
    return http.put(`/sales/deleteSalesmanIncentive`, data)
  }

  updateSalesmanIncentive(data) {
    return http.put(`/sales/updateSalesmanIncentive`, data)
  }

  dayBookReport(data){
    return http.post(`/sales/dayBookReport`,data)
  }

  dayBookConsolidate(data){
    return http.post(`/sales/dayBookConsolidate`, data)
  }

  StockGroupSummary(data){
    return http.post(`/sales/getStockGroupSummary`,data)
  }

  ExpiryDatereport(data){
    return http.post(`/sales/expiryDateReport`,data)
  }
  
  trialBalanceReport(data){
    return http.post(`/sales/trialBalanceReport`,data)
  }

  getProfitWiseReport(data){
    return http.post(`/sales/reports/profitWiseReport`, data)
  }

  paymentReportBasedEmpVerify(data){
    return http.put(`/sales/paymentReportBasedEmpVerify`, data)
  }

  incomeBasedOnCustomer(data){
    return http.post(`/sales/incomeBasedOnCustomer`, data)
  }
  
  saleOrderDeliveryChallanByCustomer(data){
    return http.post(`/sales/saleOrderDeliveryChallanByCustomer`, data)
  }
  
  salesApprovals(data){
    return http.post(`/sales/salesApprovals`,data)
  }

  getSalesApprovalsId(data){
    return http.post(`/sales/getSalesApprovalsId`,data)
  }

  updateSeenSalesApproval(data){
    return http.post(`/sales/updateSeenSalesApproval`,data)
  }

  rejectSalesApproval(data){
    return http.post(`/sales/rejectSalesApproval`,data)
  }

  createSalesApproval(data){
    return http.post(`/sales/createSalesApproval`,data)
  }

  listSalesMan(data){
    return http.post(`/sales/listSalesMan`,data)
  }

  approvalUserRights(data){
    return http.post(`/sales/approvalUserRights`,data)
  }

  getLatestTransporterDetails(customer_id){
    return http.post(`/sales/latestTransporterDetails`, {customer_id: customer_id})
  }

  scheduleReportPdf(data){
    return http.post(`/sales/scheduleReport`,data)
  }

  getAllReceipts(){
    return http.get('/sales/getAllReceipts')
  }

  getReceiptsById(id, type){
    return http.get(`/sales/getReceiptsById/${id}/${type}`)
  }

  getAllProductSalesHistory(data){
    return http.post(`/sales/getAllProductSalesHistory`,data)
  }

  shareReport(data){
    return http.post(`/sales/shareReport`,data)
  }

  customesSalesman(data){
    return http.post(`/sales/customesSalesman`,data)
  }

  getReceiptEditData(data){
    return http.post(`/sales/editdatareceipts`, data)
  }

  editReceipt(data) {
    return http.put(`/sales/ReceiptEdit`, {
      table_name: 'pos_sales',
      table_data: data,
    });
  }

  editAdvance(data){
    return http.put(`/sales/editAdvance`, {
      table_name: 'pos_sales',
      table_data: data,
    })
  }

  receiptTimeline(data){
    return http.post(`/sales/receiptTimeline`,data)
  }

   thermalPrinter(data) {
  return http.post('/sales/thermalPrinter', data, {
    responseType: 'blob'
  });
}

  getReceiptDetailsBasedOnCheque(data){
    return http.post(`/sales/receiptByCheque`, data)
  }

  checkChequeNumberExist(data){
    return http.post('/sales/checkChequeNumber', data)
  }

  salesSummary(data){
    return http.post('/sales/salesSummary', data)
  }
  billingcompany() {
    return http.get('/sales/billinggstin')
  }

  individualPaymentDetails(data) {
    return http.post('/sales/individualPaymentDetails',data)
  }
  salesRefundEntry(data){
    return http.post('/sales/refundEntry', data)
  }
  editSalesRefundEntry(data, id){
    return http.put(`/sales/editRefundEntry/${id}`, data)
  }

  // Sales Return (multi-invoice)
  getAllCustomerUnreturnedItems(data) {
    return http.post('/sales/getAllCustomerUnreturnedItems', data);
  }

  scanLotForSalesReturn(data) {
    return http.post('/sales/scanLotForSalesReturn', data);
  }

  getItemLotsForSalesReturn(data) {
    return http.post('/sales/getItemLotsForSalesReturn', data);
  }
}

export default new Salesservice();
