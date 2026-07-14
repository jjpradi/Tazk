
const API_URLS = {

  //sales
  GET_SALES_INVOICE_DETAILS: (id, type, poptype) => 
    `/salesservice/api/sales/getSales/salesInvoiceDetailsById/${id}/${type}/${poptype}`,
  GET_LOTS_DETAILS: '/salesservice/api/sales/getLotsDetails',
  GET_RECEIPTS_BY_ID: (id, type) => `/salesservice/api/sales/receipts/getReceiptsById/${id}/${type}`,
  GET_SALES_CHILD_PAGE_DETAILS: (id, type) => `/salesservice/api/sales/getSales/childPageDetails/${id}/${type}`,
  GET_CUSTOMER_PENDING_PAYMENT: (customerId, locationId) => `/salesservice/api/sales/${customerId}/${locationId}/pendingpayment`,
  GET_SALES_TIMELINE_DETAILS: (id, type) => `/salesservice/api/sales/getSales/timeLineDetailsById/${id}/${type}`,
  GET_SALES_INVOICE_BY_SPECIAL_NUMBER: '/salesservice/api/sales/getSales/salesInvoiceDetailsById/specialNumber',
  DELIVERY_CHALLAN_PAGINATION: (cookie, locationId) => `/salesservice/api/sales/deliveryChallan/pagination/${cookie}/${locationId}`,
  DAY_BOOK_REPORT: '/salesservice/api/sales/dayBookReport',
  GET_CUSTOMER_VENDOR_ADVANCES: (headerLocationId, type, id) => `/salesservice/api/sales/customerVendorAdvances/${headerLocationId}/${type}/${id}`,
  GET_RECEIPT_DATA_BY_SALES_PURCHASE: (type, id) => `/salesservice/api/sales//receiptDetails/${type}/${id}`,



  // purchase

  GET_PURCHASE_INVOICE_BY_ID: (id) => `/salesservice/api/purchase/getPurchaseInvoiceById/${id}`,
  GET_SUPPLIER_PENDING_PAYMENTS: (supplierId, locationId) => `/salesservice/api/purchase/${supplierId}/${locationId}/pendingPayments`,
  GET_PURCHASE_PAGINATION: (cookie, locationId) => `/salesservice/api/purchase/pagination/${cookie}/${locationId}`, 
  GET_PURCHASE_DETAILS_BY_RECEIVING_ID: '/salesservice/api/purchase/getPurchaseDetailsByReceivingId',
  DELETE_PURCHASE_ORDER: (poId) => `/salesservice/api/purchase/delete/purchaseOrder/${poId}`,
  CHECK_LOTS_SALES: (receivingId) => `/salesservice/api/purchase/delete/checkLotsSales/${receivingId}`,
  PURCHASE_GET_BILL_SEQ: '/salesservice/api/purchase/getseq/billseq',
  PURCHASE_CHECK_LOT_EXISTS: '/salesservice/api/purchase/checkLotExists',
  GET_PURCHASE_SUMMARY: '/salesservice/api/purchase/purchaseSummary',
  GET_SALES_SUMMARY: '/salesservice/api/sales/salesSummary',
  GET_LOTS_BASED_ON_RECEIVINGS : (id) => `/salesservice/api/purchase/getSequenceBasedOnId/${id}`,
  GET_BILLS_TIMELINE: (type, id) => `/salesservice/api/purchase/timelineData/${type}/${id}`,

  //pos message
  POS_MESSAGE_UPLOAD_FILE: '/comservice/api/posMessage/uploadFile',
  DELETE_POS_MESSAGE: (userId, inboxId, msgId) => 
    `/comservice/api/posMessage/deleteMsg/${userId}/${inboxId}/${msgId}`,
  DELETE_POS_INBOX: (inboxId, userId) => 
      `/comservice/api/posMessage/deleteInbox/${inboxId}/${userId}`,

  //customer
  GET_GST_TYPES: '/comservice/api/customer/GSTType/types',
  GET_OUTSTANDING_SHARE: (customerId, locationId) => `/comservice/api/customer/outstandingShare/${customerId}/${locationId}/Template`,
  GET_OUTSTANDING_SHARE_EXCEL: (customerId, locationId) => `/comservice/api/customer/outstandingShare/${customerId}/${locationId}/Excel`,
  GET_CUSTOMER_IMAGE_BY_ID: (customerId) => `/comservice/api/customer/customerDetailImgById/${customerId}`,
  GET_VENDOR_DETAILS_BY_ID: (vendorId) => `/comservice/api/customer/vendorDetailsById/${vendorId}`,
  GET_EMPLOYEE_DETAILS_BY_ID: (employeeId) => `/comservice/api/customer/EmployeeDetailsById/${employeeId}`,
  GET_CUSTOMER_BY_ID: (customerId) => `/comservice/api/customer/${customerId}`,
  ALL_CUSTOMERS:`/comservice/api/customer`,

  //quotations
  CREATE_QUOTATION_PROPOSAL: '/salesservice/api/quotation/proposal',
  GET_QUOTATION_TEMPLATE: (quotationId) => `/salesservice/api/quotation/quotationTemplate/${quotationId}`,

  //terms & conditions:
  TERMS_CONDITIONS: '/comservice/api/termsConditions',

  //manual notes
  GET_MANUAL_SCHEMES_BY_CUSTOMER: (customerId) => `/accountsservice/api/manualNotes/getSchemes/customer/${customerId}`,
  MANUAL_CREDIT_SALES_PURCHASE: '/accountsservice/api/manualNotes/ManualcreditSalesPurchase',

  // cahbox

  GET_DENOMINATION_TRANSACTED: '/accountsservice/api/cashBox/denominationTransacted',
  CASH_IN_HAND_DETAILS: '/accountsservice/api/cashBox/CashInHandDetails/byTransactionEntries',

  //salary

  GET_YTD_SALARY: '/payrollservice/api/salary/ytd',
  SALARY_CONFIRMED_DETAILS: '/payrollservice/api/salary/salaryComfirmedDetails',
  SALARY_REPORT_FOR_BANK: '/payrollservice/api/salary/salaryReportForBank',
  CHECK_JOB_STATUS: '/payrollservice/api/salary/checkJobStatus',
  EXPORT_PROCESSED_SALARY_DATA: '/payrollservice/api/salary/exportProcessedSalaryData',

  //payroll dashboard

  GET_TASK_BY_STATUS: (projectId, empId) => `/payrollservice/api/payrollDashboard/taskByStatus/project/${projectId}/${empId}`,


  //reports

  GET_RELIEVED_EMPLOYEE_DETAILS: '/reportservice/api/reports/getRelievedEmployeeDetails',
  GET_DEVICE_REGISTERED_DETAILS : `/reportservice/api/reports/DeviceRegisterReport`,
  GET_FRAUD_LOGS : `/reportservice/api/reports/fraudLogs`,
  GET_LOGIN_AUDIT_LOGS : `/userauthservice/api/loginAudit`,
  
 
  // defects
  GET_DEFECT_TEMPLATE: (collectionId) => `/salesservice/api/defects/defectTemp/${collectionId}`,
  SEND_DEFECTS_TEMPLATE: (supplierId) => `/salesservice/api/defects/senddefectsTemp/${supplierId}`,
  CUSTOMER_REPLACEMENT_TEMPLATE: (id) => `/salesservice/api/defects/customerReplacementTemp/${id}`,
  VENDOR_REPLACEMENT_TEMPLATE: (id) => `/salesservice/api/defects/vendorReplacementTemp/${id}`, 


  // income tax

  CHECK_INCOME_TAX_EXIST: '/payrollservice/api/incometax/checkexsist',
  GET_DEDUCTION_LIST: '/payrollservice/api/incometax/deducList',
  GET_FORM16: '/payrollservice/api/incometax/form16',

  // usercreation

  FIRST_LOGIN_DETAIL_UPDATE: '/comservice/api/userCreation/firstLoginDetailUpdate',
    

  // inventory

  GET_INVENTORY_BY_LOCATION: (emp_id,locationId) => `/productservice/api/inventory/${emp_id}/${locationId}`,

  //  leave request

  LEAVE_LOG_BASE_SHIFT: '/payrollservice/api/leaveRequest/logBaseShift',
  GET_SHIFT_DETAIL: '/payrollservice/api/leaveRequest/getshiftdetail',
  GET_APPROVER_VERIFIER: '/payrollservice/api/leaveRequest/getApproverVerifier',
  GET_LEAVE_APPROVER_VERIFIER: '/payrollservice/api/leaveRequest/getApproverVerifier',

  // attendance
  ATTENDANCE_BY_DATE: '/payrollservice/api/attendance/attendanceByDate',
  OVERTIME_REPORT: '/payrollservice/api/attendance/overTimeReport',
  SEARCH_ATTENDANCE_COR: '/payrollservice/api/attendance/searchAttendanceCor',
  GET_COMPANY_BASED_EMPLOYEE: '/payrollservice/api/attendance/getCompanyBasedEmployee',
  LATE_LOGIN_EARLY_CHECKOUT_REPORT: '/payrollservice/api/attendance/lateLoginEarlyCheckoutReport',
  PUNCH_EXCEPTIONS: '/payrollservice/api/attendance/PunchExceptions',
  PRIVILEGE_LEAVE: '/payrollservice/api/attendance/PrivilegeLeaveReport',
  ATTENDANCE_WORK_DURATION_REPORTS: '/payrollservice/api/attendance/work/duration/reports',
  //shifts

  GET_SHIFTS_BASED_ON_EMP: '/payrollservice/api/shifts/getShiftsBasedEmp',
  GET_SHIFTS_FOR_MANUAL_ATT: '/payrollservice/api/shifts/getShiftsBasedEmpForManualAtt',
  //supplier

  GET_SUPPLIER_BY_ID: (supplierId) => `/comservice/api/supplier/byId/${supplierId}`,
  SUPPLIER_PRICE_LIST_VIEW: '/salesservice/api/priceList/vendor/priceList/view',

  //transaction

  TRANSACTION_BY_NOTE: '/accountsservice/api/transaction/byNote',

  //pos sale

   GET_POS_COLUMN_SELECTION: '/salesservice/api/posSale/selection/getColumn',

   //lotItems

   LOTITEMS_RECONCILE_MISSING_STOCKS: (location_id) => `/productservice/api/lotItems/reconciliatemissing/stocks/${location_id}`,
   LOTITEMS_RECONCILIATED_PRODUCT_LIST: (location_id) => `/productservice/api/lotItems/reconciliatedProductList/${location_id}`,
   DELETE_EXCESS_LOT: '/productservice/api/lotItems/deleteExcesslot',
   GET_LIST_BASED_ON_TYPE : (type) => `/productservice/api/lotItems/getList/${type}` ,
   GET_DATA_BASED_ON_TYPE : () => `/productservice/api/lotItems/concilateInventoryData/filter` ,


   //retil service

   CREATE_TRANSACTION_PROMISE: '/salesservice/api/retailServices/createTransactionPromise',
   


};

export default API_URLS;