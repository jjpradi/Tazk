import http from '../http-common';

class ReportsService {
  getAll() {
    return http.get('/pivotReports');
  }

  get(id) {
    return http.get(`/pivotReports/${id}`);
  }

  create(data) {
    return http.post('/pivotReports', {
      table_name: 'pos_reports',
      table_data: data,
    });
  }

  update(id, data) {
    return http.put(`/pivotReports/${id}`, data);
  }

  delete(id) {
    return http.delete(`/pivotReports/${id}`);
  }
  getbrandReport(data){
    return http.post(`/reports/brandReport`, data);
  }
  getchequeReport(){
    return http.get(`/reports/chequeReport`)
  }
  dailyreportStatus(data){
    return http.post(`/reports/dailyreportstatus`, data);
  }
  getdailyreportstatus(data){
    return http.post(`/reports/getdailyreportstatus`, data)
  }
  getcashbox_status(id){
    return http.get(`/reports/closing/cashboxstatus/${id}`);
  }

  searchChequeReport(data){
    return http.post(`/reports/searchChequeReport`, data);
  }

  getcashboxadjustmententrydailyreport(headerLocationId, date){
    return http.get(`/reports/cashboxadjustmententry/dailyreport/${headerLocationId}/${date}/cashboxadjustment`);
  }

  pagination(data) {
    return http.post(`/reports/searchChequeReport`, data);
  }

  // Brand report API----
  brandaction(data) {
    return http.post(`/reports/searchBrandReports`, data);
  }

  getRelievedEmployeeDetails(data){
    return http.post(`/reports/getRelievedEmployeeDetails`,data)
  }

  getMissingLot(data){
    return http.post(`/reports/getMissingLot`,data)
  }

  getExcessLot(data){
    return http.post(`/reports/getExcessLot`,data)
  }

  DeviceRegisterReport(data){
    return http.post(`/reports/DeviceRegisterReport`,data)
  }

  DeviceDeRegister(data){
    return http.put(`/reports/DeviceDeRegister`,data)
  }

  fraudLogs(data){
    return http.post(`/reports/fraudLogs`,data)
  }

  loginAuditLogs(data){
    return http.post(`/loginAudit`,data)
  }

  getScrapLot(data){
    return http.post(`/reports/scrapLot`, data)
  }

  // deleteAll() {
  //   return http.delete(`/tutorials`);
  // }

  getCreditNotes(data) { return http.post(`/reports/creditNotes`, data); }
  getDebitNotes(data) { return http.post(`/reports/debitNotes`, data); }
  getCheques(data) { return http.post(`/reports/cheques`, data); }
  getScrapLot2(data) {
    return http.post(`/reports/scrapLot2`, data);
  }
  getExpiryDate(data) {
    return http.post(`/reports/expiryDate`, data);
  }
  getStockValuation(data) {
    return http.post(`/reports/stockValuation`, data);
  }
  getMissingLot2(data) {
    return http.post(`/reports/missingLot2`, data);
  }
  getExcessLot2(data) {
    return http.post(`/reports/excessLot2`, data);
  }
  getClosingStock(data) {
    return http.post(`/reports/closingStock`, data);
  }
  getStockGroup(data) {
    return http.post(`/reports/stockGroup`, data);
  }
  getStockAgeing(data) {
    return http.post(`/reports/stockAgeing`, data);
  }
  getDeadSlowMoving(data) {
    return http.post(`/reports/deadSlowMoving`, data);
  }
  getLowStock(data) {
    return http.post(`/reports/lowStock`, data);
  }
  getDcOutstanding(data) {
    return http.post(`/reports/dcOutstanding`, data);
  }
  getStockMovement(data) {
    return http.post(`/reports/stockMovement`, data);
  }
  getPurchaseReport2(data) { return http.post(`/reports/purchaseReport2`, data); }
  getAllTransactions(data) { return http.post(`/reports/allTransactions`, data); }
  getDaybook(data) { return http.post(`/reports/daybook`, data); }
  getReceivable(data) { return http.post(`/reports/receivable`, data); }
  getPayable(data) { return http.post(`/reports/payable`, data); }
  getPaymentReport(data) { return http.post(`/reports/paymentReport2`, data); }
  getReceiptReport(data) { return http.post(`/reports/receiptReport2`, data); }
  getPayInOutContra(data) { return http.post(`/reports/payInOutContra`, data); }
  getBrandMargin(data) { return http.post(`/reports/brandMargin`, data); }
  getSalesReport2(data) { return http.post(`/reports/salesReport2`, data); }
  getPosSalesReport(data) { return http.post(`/reports/posSalesReport`, data); }
  getPreOrderReport(data) { return http.post(`/reports/preOrderReport`, data); }

  // MIS Reports
  getBillProfit(data) { return http.post(`/reports/billProfit`, data); }
  getCategoryMargin(data) { return http.post(`/reports/categoryMargin`, data); }
  getSalesmanPerf(data) { return http.post(`/reports/salesmanPerf`, data); }
  getLocationPL(data) { return http.post(`/reports/locationPL`, data); }
  getCustomerRevenue(data) { return http.post(`/reports/customerRevenue`, data); }
  getSupplierPurchase(data) { return http.post(`/reports/supplierPurchase`, data); }
  getDailySalesSummary(data) { return http.post(`/reports/dailySalesSummary`, data); }
  getMonthlyComparison(data) { return http.post(`/reports/monthlyComparison`, data); }
  getPaymentMode(data) { return http.post(`/reports/paymentMode`, data); }
  getInventoryTurnover(data) { return http.post(`/reports/inventoryTurnover`, data); }
  getTaxSummary(data) { return http.post(`/reports/taxSummary`, data); }
  getCccDashboard(data) { return http.post(`/reports/cccDashboard`, data); }
  getDailyNetProfit(data) { return http.post(`/reports/dailyNetProfit`, data); }
  getProfitLeakage(data) { return http.post(`/reports/profitLeakage`, data); }
  getDataQuality(data) { return http.post(`/reports/dataQuality`, data); }
  getCashFlow(data) { return http.post(`/reports/cashFlow`, data); }
  getCashFlowStatement(data) { return http.post(`/reports/cashFlowStatement`, data); }
  getGeneralLedger2(data) { return http.post(`/reports/generalLedger2`, data); }
  getAgeingSummary(data) { return http.post(`/reports/ageingSummary`, data); }
  getGroupSummary(data) { return http.post(`/reports/groupSummary`, data); }
  getBalanceSheet(data) { return http.post(`/reports/balanceSheet`, data); }
  getBalanceSheetScheduleIII(data) { return http.post(`/reports/balanceSheetScheduleIII`, data); }
  getProfitLoss(data) { return http.post(`/reports/profitLoss`, data); }
  getGeneralLedgerList(data) { return http.post(`/reports/generalLedgerList`, data); }
  getGeneralLedgerDetail(data) { return http.post(`/reports/generalLedgerDetail`, data); }
  checkLinkedAccount(data) { return http.post(`/reports/checkLinkedAccount`, data); }

  // Report Schedules
  listSchedules() { return http.get(`/reports/schedules`); }
  createSchedule(data) { return http.post(`/reports/schedules`, data); }
  deleteSchedule(id) { return http.delete(`/reports/schedules/${id}`); }
  editSchedule(id,data) { return http.post(`/reports/schedules/${id}`,data); }
}

export default new ReportsService();
