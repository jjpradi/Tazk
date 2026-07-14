import { takeLatest, debounce, throttle } from "redux-saga/effects";
import { GET_SEARCH_SYNC_PRODUCT,GET_SEARCH_PRODUCT, GET_SEARCH_PURCHASE, GET_SEARCH_DATA, GET_SEARCH_POS_SALE, GET_SEARCH_SALES, GET_SEARCH_PAYMENT_REPORT, GET_SEARCH_LEDGER, GET_SEARCH_CREDIT_DEBIT, GET_SEARCH_SALESMAN, GET_SEARCH_STOCK_RECEIVE, GET_SEARCH_LEADS, GET_SEARCH_TRANSACTION, GET_SEARCH_LOCATION, GET_SEARCH_BANK_RECONCILIATION, GET_SEARCH_CHARTOFACCOUNTS, GET_SEARCH_MANUALSCHEMES, GET_SEARCH_BANK, GET_SEARCH_CASHBOX, GET_SEARCH_USERCREATION, GET_SEARCH_POS_CREATION, GET_SEARCH_PAYMENT_METHOD, GET_SEARCH_HISTORYREPORT, GET_SEARCH_DATA_STOCK_TRANSFER, GET_SEARCH_RECONCILATE_DATA, GET_SEARCH_SCHEMES_DATA, GET_SEARCH_CHEQUEBOUNCE, GET_SEARCH_LEAVEREPORT, GET_SEARCH_LOAN_DATA, GET_SEARCH_CLOSING_STOCK, GET_SEARCH_AGEING_REPORT, GET_SEARCH_OUTSTAND, GET_SEARCH_CONSOLIDATED, GET_SEARCH_HOLIDAY,GET_SEARCH_SPECIALPERMISSION, GET_SEARCH_CHEQUE_REPORT, GET_SEARCH_PURCHASE_REPORT, GET_SEARCH_TAX_RATE, GET_SEARCH_SALARY,   GET_SEARCH_SHIFTLIST, GET_SEARCH_PAYROLL_CHECK_IN, GET_SEARCH_PAYROLL_NOTCHECKED_IN,GET_SEARCH_PAYROLL_LATE_LOGIN, GET_SEARCH_PAYROLL_COMPLETE_LIST, GET_SEARCH_SALES_REPORT, GET_SEARCH_REQUEST_REPORT, GET_SEARCH_RECEIVABLE_REPORT, GET_SEARCH_PAYABLE_REPORT,GET_SEARCH_USER_ROLE,GET_SEARCH_BRAND_REPORT, GET_SEARCH_MAIL,  GET_PRODUCT_INFINITE_SCROLL, GET_SEARCH_CONTACTS, PICK_CUSTOMER_GET_SEARCH_CONTACTS, UPDATE_DASHBOARD_LAYOUTS, GET_SEARCH_PRICE_LIST, GET_SEARCH_EXPENSE, GET_SEARCH_PROCESS_SALARY, SEARCH_PAYSLIP_ACTION, GET_SEARCH_COMPANY_LOAN, GET_CHECK_EXISTS, GET_SEARCH_COMPLETED_PAYMENT_VIEW, GET_SEARCH_POS_PROMOTIONS, GET_ATTENDANCEVIEW, GET_SEARCH_RECEIVED_PURCHASES,GET_SEARCH_RECEIVABLE_SEARCH, GET_SEARCH_ATTENDANCECOR_DATA, GET_SEARCH_TASK_LOG, GET_SEARCH_SELFIE_IMAGES, GET_SEARCH_SALARY_STRUCTURE, GET_SEARCH_OVER_TIME_REPORT,  GET_COMPANY_DETAIL ,GET_SEARCH_DEPARTMENT_BASED_EMPLOYEE, GET_SEARCH_LOCATION_BASED_EMPLOYEE, GET_SEARCH_COMPANY_BASED_EMPLOYEE, GET_SEARCH_REGISTERED_USER, GET_SEARCH_ASSEST, GET_LIST_ASSIGN, GET_ASSIGN_DATA, GET_LIST_ALERTS, GET_AUDIT_CHECKLIST, GET_WORK_DURATION_REPORT_DATA, GET_SEARCH_REPORT_BANK, GET_COMPANY_BASED_SEARCH, GET_COMPANY_BASED_DETAILS_SEARCH, GET_SEARCH_CLAIM_DATA, GET_SALARY_REPORT, GET_LIST_GR_PRODUCT, GET_SEARCH_WARRANT , GET_LIST_INSURANCE, GET_SEARCH_DYNAMIC_PROP, GET_LIST_SERVICEDUE,GET__SEARCH_DEPARTMENT_BASED_EMPLOYEE_FOR_DEPARTMENT_HEAD, GET_SEARCH_DEPARTMENTS_HEAD, GET_FILTER_TASK_DETAILS, GET_SEARCH_AUDIT_CHECKLIST, GET_SEARCH_DEPARTMENT, GET_SEARCH_COMPANY_BASED_ADMIN_MANAGER, GET_SEARCH_REQUEST_CONFIG, GET_SEARCH_GROUP, GET_SEARCH_TYPE, GET_MONTH_SHIFT_SCHEDULE, GET_DAY_SHIFT, GET_SEARCH_CATEGORY_BASED_EMPLOYEE, GET_APPROVED_CLAIMS, SET_LEADS_TASK, GET_LEADS_ACCOUNTS, GET_LEADS_SEARCH, GET_LIST_CALLS, GET_LIST_MEETINGS, GET_ACCOUNTS_CONTACTS, GET_SEARCH_DEPARTMENT_LIST, GET_SEARCH_CATEGORY_LIST ,GET_SEARCH_CLAIMS_CATEGORY_LIST, GET_SEARCH_RELIEVED_EMPLOYEE_DETAILS, GET_LIST_PAYROLLCALENDER, GET_SEARCH_DESIGNATION, GET_SEARCH_FACE_REGISTRATION, GET_SEARCH_LATE_EARLY_REPORT, GET_SEARCH_QUOTATION, GET_LIST_TERMSCONDITIONS,GET_SEARCH_PF_REPORT, GET_QUOTATION_CONFIG_SEARCH, GET_LIST_CAMPAIGN,GET_LEAD_SOURCE_LIST, GET_CAMPAIGN_LEADS, GET_LEAD_STATUS, GET_DELETED_LOG_DETAILS, GET_LIST_SMS, GET_COMPLIANCES_SEARCH, GET_RENEWAL_SEARCH, GET_RENEWALS_LOV, GET_SEARCH_ALERTS_EMPLOYEE_FILTER, GET_SEARCH_COST_SUMMARY_REPORT_ACTION,SET_TASK_BY_STATUS, SET_ALL_PROJECTS, SET_WORK_LOG_REPORT, GET_PAYMENT_COLLECTION_REPORT, GET_LIST_COMPLIANCES, GET_SCRAP_ASSET_REPORT, SET_SALARY_STATEMENT, SET_BIOMETRIC_REG, GET_COMPLETED_RECEIVED_SALES, SET_DAY_BOOK, SET_STOCK_GROUP_SUMMARY, GET_PROFIT_WISE_REPORT, GET_SEARCH_SALESMAN_INCENTIVE, GET_GST1_REPORT, GET_FORM27EQ_REPORT, GET_GST2_REPORT, GET_GST_REPORT, GET_GST_RATE_REPORT, GET_TCS_RECEIVABLE, SET_EXPIRY_DATE_REPORT,GET_UNITS_LOV,GET_CREDIT_DAYS_LOV, GET_SEARCH_CANCELLED_ORDERS, GET_SEARCH_PRE_ORDER, GET_SEARCH_SALESMAN_COLLECTION, SET_CUSTOMER_INVOICE, SET_CUSTOMER_PAYMENT, SET_CUSTOMER_DELIVERY_CHALLAN, SET_CUSTOMER_QUOTES, SET_CUSTOMER_CREDIT_NOTE, GET_SEARCH_SALE_ORDER, GET_PRODUCT_BY_LOT_NUMBER, GET_SEARCH_DC, SET_SCHEMES_RECEIVABLES, GET_MANUAL_MATCH_RECORDS, GET_ATTENDANCELOGREPORT, GET_SEARCH_DEFECT_COLLECTION, GET_SEARCH_REPLACEMENT, GET_SEARCH_PUNCH_EXCEPTIONS, GET_SEARCH_PRIVILEGE_LEAVE, GET_PURCHASE_SUMMARY, GET_SALES_SUMMARY, SET_SERVICE_TYPE, GET_ASST_GENERAL, SET_ALL_CHECKLIST_TEMPLATE, GET_SALARY_TEMPLATE, GET_SEARCH_SCRAP_LOT_REPORT, GET_SEARCH_BY_CUSTOMER, GET_SEARCH_BY_CUSTOMER_SALESMAN, GET_SEARCH_BY_CUSTOMER_SUPPLIER, GET_SEARCH_BY_VENDOR, GET_TASK_ID_BY_SEARCH, GET_CHECK_PROJECT_EXISTS} from "redux/actionTypes";


import { handleGetSearchsyncProduct, handleGetSearchProduct, handleGetSearchPurchase ,handleGetSearchInventory ,handleGetSearchPosSale, handleGetSearchSales, handleGetSearchPaymentreport,handleGetSearchLedger,handleGetSearchCreditdebit,handleGetSearchSalesMan, handleGetSearchChartofAccount, handleGetSearchManualSchemes,handleGetSearchLeads,handleGetSearchTransaction,handleGetSearchLocation, handleGetSearchBank, handleGetSearchCashBox, handleGetSearchUserCreation, handleGetSearchPoscreate,handleGetSearchPaymentMethod, handleGetSearchHistoryReport, handleGetSearchStockTransfer, handleGetSearchSchemes, handleGetSearchChequebounce, handleGetSearchReconcilate, handleGetSearchLeaveReport,handleGetSearchLoan,handleGetSearchClosingStock,handleGetSearchAgeingReport,handleGetSearchOutstandReport,handleGetSearchConsolidatedReport, handleSearchChequeReport, handleSearchPurchaseReport, handleSearchTaxRate, handleSearchSalary, handleSearchHoliday, handleSearchSpecialPermission, handleGetSearchShiftlist, handleGetSearchPayrollCheckin, handleGetSearchPayrollNotCheckin, handleGetSearchPayrollLatelogin, handleGetSearchPayrollCompleteList, handleSearchSalesReport, handleSearchStockReceive, handleGetSearchrequestReport, handleGetSearchPayableReport, handleGetSearchReceivableReport,handleGetSearchUserrole, handleSearchBrandReport, handleSearchMail, handleSearchSms, handleProductInfiniteScroll, handleSearchContacts, pickcustomerhandleSearchContacts,  handleUpdateDashboardLayout, handleSearchPriceList, handlExpenseSearch, handleProcessSalarySearch, handlePaySlipReportSearch, handleGetSearchCompanyLoan, handleGetSearchBankReconcilation, handleGetCheckExists, handleGetSearchCompletedPaymentView, handleGetSearchPosPromotion,handleGetSearchAttendanceView,handleSearchPayable,handlesearchReceivable, handleGetSearchAttendanceCor, handleGetSearchTaskLog, handleGetSearchSelfieImages, handleSalaryStructure, handleGetSearchOverTimeReport,  handleGetRegisterRequest, handleGetCompanyDetail,handleGetSearchDepartMentBasedCompany,handleGetOrgChart, handleGetSearchLocationBasedCompany, handleGetSearchCompanyBasedEmployee, handleAssetSearch, handleGetAssignSearch, handleGetAssignToSearch, handleGetSearchAlerts, handleGetSearchAudits, handleworkdurationReport, handlesearchReportForBank, handlegetCompanyBasedEmpAction, handlegetCompanyBasedEmpDetailsAction,handleGetSearchClaim, handleSalaryReportSearch, handleGetSearchProducts, handleGetWarrantSearch,handleGetSearchInsurance, handleGetSearchDynamicProp, handleGetSearchServiceDue,handleGetSearchDepartMentBasedCompanyForDepartmentHead, handleGetSearchDepartMentHead, handleGetFilterTaskDetails, handleGetSearchAuditCheckList, handleGetClaimApprovedDetails, handleGetSearchDepartMent, handleGetSearchCompanyBasedAdminManager, handleGetSearchRequestConfig, handleGetSearchAssetType, handleGetSearchAssetGroup, handleMonthShiftScheduleShiftSearch, handleDayShiftSearch, handleGetSearchCategoryBasedCompany, handleGetLeadsTask, handleGetLeadsAccounts, handleLeadsSearch, handleGetSearchCalls, handleGetSearchMeetings, handleGetAccountContacts, handleGetDepartmentList, handleCategoryList, handleClaimsCategoryList, handleRelievedEmployeeSearch, handleGetSearchPayrollCalender, handleDesignationSearch, handleGetSearchFaceRegistration, handleGetSearchlateAndEarlyReport, handleQuotationSearch, handleGetSearchTermsConditions,handleGetSearchPfReport, handleQuotationConfigSearch, handleGetSearchCampaign,handleLeadSourceList, handleGetSearchCampaignLeads, handleLeadStatusSearch, handleGetSearchDeleteLogs, handleCompliancesSearch, handleRenewalSearch, handleGetSearchRenewalsLov, handleGetSearchAlertsEmployeeFilter, handleGetSearchCostSummaryReport,handleGetTasksStatus, handleGetProjects, handleGetWorkLog, handleGetPaymentCollectionReport, handleGetSearchCompliances, handleGetSearchScrapAssetReport, handleSalaryStatement, handleGetBiometric, handleGetSearchcompletedSalesOutstanding, handleDayBook, handleStockGroupSummary, handleGetSearchProfitWiseReport, handleGetSearchIncentives, handleGetSearchGst1Report, handleGetSearchForm27EQReport, handleGetSearchGst2Report, handleGetSearchGstReport, handleGetSearchGstRateReport, handleGetSearchTcsReceivable, handleExpiryDateReport,handleGetSearchUnitsLov,handleGetSearchCreditDaysLov, handleGetSearchPreOrderReport, handleGetSearchPreOrder, handleGetSalesmanCollection, handleCustomerInvoice, handleCustomerPayment, handleCustomerDeliveryChallan, handleCustomerQuotes, handleCustomerCreditnote, handleGetSearchSaleOrder, handleProductSearchByLotNumber, handlesearchSalesManListAction, handleGetSearchDC, handlesearchUserModules, handleSchemesReceivables, handleGetSearchManualMatch, handleGetSearchAttendanceLogReport, handleSearchCollectedDefects, handleSearchReplacements, handleGetPunchExceptionReport,handleGetPrivilegeLeaveReport, handleGetSearchRentalAndTenants, handleGetPurchaseSummary, handleGetSalesSummary, handleGetSearchServiceTypeLov, handleGetSearchgeneralContact, handleGetSearchInsuranceLov, handleGetAllChecklist, handleGetSearchDeviceRegisterReport, handleGetSearchFraudLogsReport, handleGetSearchLoginAuditLogs, handleSearchSalaryTemplate, handleScrapLotSearch, handleGetSearchByCustomer, handleGetSearchByCustomerSalesman, handleGetSearchByCustomerSupplier, handleGetSearchByVendor, handleGetTaskIdBySearch, handleGetSearchCustomRenewals, handleCheckProjectExists} from "./handlers/searchHandlers";
import { GET_RENTALS_AND_TENANTS, GET_SEARCH_SALES_MAN_LIST, GET_SEARCH_USER_MODULE_ACTION, SET_DEVICE_REGISTER, SET_FRAUD_LOGS, SET_LOGIN_AUDIT_LOGS, SET_INSURANCE_LOV,ORG_CHARTDATA, GET_LIST_CUSTOM_RENEWALS } from "../actionTypes";


export function* watcherSaga() {
    yield debounce(1000, GET_SEARCH_PRODUCT, handleGetSearchProduct);
    yield debounce(1000, GET_SEARCH_PURCHASE, handleGetSearchPurchase);
    yield debounce(1000, GET_SEARCH_SALES, handleGetSearchSales);
    yield debounce(1000, GET_SEARCH_DC, handleGetSearchDC);
    yield debounce(1000, GET_SEARCH_SALE_ORDER, handleGetSearchSaleOrder );
    yield debounce(1000, GET_SEARCH_DATA, handleGetSearchInventory);
    yield debounce(1000, GET_COMPLETED_RECEIVED_SALES, handleGetSearchcompletedSalesOutstanding);
    yield debounce(1000, GET_SEARCH_POS_SALE, handleGetSearchPosSale);
    yield debounce(1000, GET_SEARCH_TASK_LOG, handleGetSearchTaskLog);
    yield debounce(1000, GET_SEARCH_DATA_STOCK_TRANSFER, handleGetSearchStockTransfer);
    yield debounce(1000, GET_SEARCH_STOCK_RECEIVE, handleSearchStockReceive);
    yield debounce(1000, GET_SEARCH_PAYMENT_REPORT, handleGetSearchPaymentreport);
    yield debounce(1000, GET_SEARCH_LEDGER, handleGetSearchLedger);
    yield debounce(1000, GET_SEARCH_CREDIT_DEBIT, handleGetSearchCreditdebit);
    // yield debounce(1000, GET_SEARCH_SALESMAN, handleGetSearchSalesMan);
    yield debounce(1000, GET_SEARCH_RECONCILATE_DATA,handleGetSearchReconcilate)
    yield debounce(1000, GET_SEARCH_SALESMAN,  handleGetSearchSalesMan);
    yield debounce(1000, GET_SEARCH_BANK_RECONCILIATION, handleGetSearchBankReconcilation);
    yield debounce(1000, GET_SEARCH_CHARTOFACCOUNTS, handleGetSearchChartofAccount);
    yield debounce(1000, GET_SEARCH_MANUALSCHEMES, handleGetSearchManualSchemes);
    yield debounce(1000, GET_SEARCH_LOCATION, handleGetSearchLocation);
    yield debounce(1000, GET_SEARCH_SCHEMES_DATA, handleGetSearchSchemes);
    yield debounce(1000, GET_SEARCH_CHEQUEBOUNCE, handleGetSearchChequebounce)
    yield debounce(1000, GET_SEARCH_LEADS, handleGetSearchLeads);
    yield debounce(1000, GET_SEARCH_TRANSACTION, handleGetSearchTransaction);
    yield debounce(1000, GET_SEARCH_TAX_RATE, handleSearchTaxRate);
    yield debounce(1000, GET_SEARCH_SALARY, handleSearchSalary);
    yield debounce(1000, SET_SALARY_STATEMENT, handleSalaryStatement);
    yield debounce(1000, SET_DAY_BOOK, handleDayBook);
    yield debounce(1000, SET_STOCK_GROUP_SUMMARY , handleStockGroupSummary)
    yield debounce(1000, SET_EXPIRY_DATE_REPORT , handleExpiryDateReport)
    yield debounce(1000, GET_SEARCH_HOLIDAY, handleSearchHoliday);
    yield debounce(1000, GET_SEARCH_SPECIALPERMISSION, handleSearchSpecialPermission);
    yield debounce(1000, GET_SEARCH_CHEQUE_REPORT, handleSearchChequeReport);
    yield debounce(1000, GET_SEARCH_PURCHASE_REPORT, handleSearchPurchaseReport);
    yield debounce(1000, GET_SEARCH_BANK, handleGetSearchBank);
    yield debounce(1000, GET_SEARCH_CASHBOX, handleGetSearchCashBox);
    yield debounce(1000, GET_SEARCH_USERCREATION, handleGetSearchUserCreation);
    yield debounce(1000, GET_SEARCH_POS_CREATION, handleGetSearchPoscreate);
    yield debounce(1000, GET_SEARCH_PAYMENT_METHOD, handleGetSearchPaymentMethod);
    yield debounce(1000, GET_SEARCH_LOAN_DATA, handleGetSearchLoan)
    yield debounce(1000, GET_SEARCH_CLAIM_DATA, handleGetSearchClaim)
    yield debounce(1000, GET_SEARCH_HISTORYREPORT, handleGetSearchHistoryReport);
    yield debounce(1000, GET_SEARCH_LEAVEREPORT, handleGetSearchLeaveReport);
    yield debounce(1000, GET_SEARCH_CLOSING_STOCK, handleGetSearchClosingStock);
    yield debounce(1000, GET_SEARCH_AGEING_REPORT, handleGetSearchAgeingReport);
    yield debounce(1000, GET_SEARCH_OUTSTAND, handleGetSearchOutstandReport);
    yield debounce(1000, GET_SEARCH_CONSOLIDATED, handleGetSearchConsolidatedReport);
    yield debounce(1000, GET_SEARCH_RECEIVABLE_REPORT, handleGetSearchReceivableReport);
    yield debounce(1000, GET_SEARCH_PAYABLE_REPORT, handleGetSearchPayableReport);
    yield debounce(1000, GET_SEARCH_COMPANY_LOAN, handleGetSearchCompanyLoan)
    yield debounce(1000, GET_ATTENDANCEVIEW, handleGetSearchAttendanceView)
    yield debounce(1000, GET_SEARCH_SALES_REPORT, handleSearchSalesReport);
    yield debounce(1000, GET_SEARCH_SHIFTLIST, handleGetSearchShiftlist);
    yield debounce(1000, GET_SEARCH_PAYROLL_CHECK_IN, handleGetSearchPayrollCheckin);
    yield debounce(1000, GET_SEARCH_PAYROLL_NOTCHECKED_IN, handleGetSearchPayrollNotCheckin);
    yield debounce(1000, GET_SEARCH_PAYROLL_LATE_LOGIN, handleGetSearchPayrollLatelogin);
    yield debounce(1000, GET_SEARCH_PAYROLL_COMPLETE_LIST, handleGetSearchPayrollCompleteList);
    yield debounce(1000,GET_SEARCH_REQUEST_REPORT,handleGetSearchrequestReport)
    yield debounce(1000,GET_SEARCH_MAIL,handleSearchMail)
    yield debounce(1000,GET_LIST_SMS,handleSearchSms)
    yield debounce(1000,GET_SEARCH_USER_ROLE,handleGetSearchUserrole)
    yield debounce(1000, GET_SEARCH_BRAND_REPORT, handleSearchBrandReport);
    yield debounce(1000, GET_PRODUCT_INFINITE_SCROLL, handleProductInfiniteScroll);
    yield debounce(1000, GET_SEARCH_CONTACTS, handleSearchContacts);
    yield debounce(1000, PICK_CUSTOMER_GET_SEARCH_CONTACTS, pickcustomerhandleSearchContacts);
    yield debounce(1000, UPDATE_DASHBOARD_LAYOUTS, handleUpdateDashboardLayout);
    yield debounce(1000, GET_SEARCH_PRICE_LIST, handleSearchPriceList);
    yield debounce(1000, GET_SEARCH_EXPENSE, handlExpenseSearch);
    yield debounce(1000, GET_SEARCH_PROCESS_SALARY, handleProcessSalarySearch);
    yield debounce(1000, GET_SALARY_REPORT, handleSalaryReportSearch);
    yield debounce(1000, SEARCH_PAYSLIP_ACTION, handlePaySlipReportSearch);
    yield debounce(1000, GET_CHECK_EXISTS, handleGetCheckExists)
    yield debounce(1000, GET_SEARCH_COMPLETED_PAYMENT_VIEW,  handleGetSearchCompletedPaymentView)
    yield debounce(1000, GET_SEARCH_POS_PROMOTIONS, handleGetSearchPosPromotion);
    yield debounce(1000, GET_SEARCH_RECEIVED_PURCHASES, handleSearchPayable);
    yield debounce(1000, GET_SEARCH_RECEIVABLE_SEARCH, handlesearchReceivable);
    yield debounce(1000, GET_SEARCH_ATTENDANCECOR_DATA, handleGetSearchAttendanceCor);
    yield debounce(1000, GET_SEARCH_SELFIE_IMAGES, handleGetSearchSelfieImages);
    yield debounce(1000, GET_SEARCH_SALARY_STRUCTURE, handleSalaryStructure)
    yield debounce(1000, GET_SEARCH_OVER_TIME_REPORT, handleGetSearchOverTimeReport);
    yield debounce(1000, GET_SEARCH_LATE_EARLY_REPORT, handleGetSearchlateAndEarlyReport);
    yield debounce(1000, GET_SEARCH_PUNCH_EXCEPTIONS, handleGetPunchExceptionReport);
    yield debounce(1000, GET_SEARCH_PRIVILEGE_LEAVE, handleGetPrivilegeLeaveReport);
    yield debounce(1000, GET_SEARCH_PF_REPORT, handleGetSearchPfReport);
    yield debounce(1000, GET_PURCHASE_SUMMARY, handleGetPurchaseSummary);
    yield debounce(1000, GET_SALES_SUMMARY, handleGetSalesSummary);

    // yield debounce(1000, GET_SEARCH_ASSEST, handleAssetSearch)
    yield debounce(1000, GET_LIST_ASSIGN, handleGetAssignSearch)
    yield debounce(1000, GET_SEARCH_WARRANT, handleGetWarrantSearch)
    yield debounce(1000, GET_ASSIGN_DATA, handleGetAssignToSearch)
    yield debounce(1000, GET_SEARCH_ASSEST, handleAssetSearch)
    yield debounce(1000, GET_LIST_ALERTS, handleGetSearchAlerts)
    yield debounce(1000, GET_SEARCH_DEPARTMENT_BASED_EMPLOYEE, handleGetSearchDepartMentBasedCompany);
    yield debounce(1000, GET_SEARCH_CATEGORY_BASED_EMPLOYEE, handleGetSearchCategoryBasedCompany);
    yield debounce(1000, GET__SEARCH_DEPARTMENT_BASED_EMPLOYEE_FOR_DEPARTMENT_HEAD, handleGetSearchDepartMentBasedCompanyForDepartmentHead);
    yield debounce(1000, GET_SEARCH_COMPANY_BASED_ADMIN_MANAGER, handleGetSearchCompanyBasedAdminManager);
    yield debounce(1000, GET_SEARCH_REQUEST_CONFIG, handleGetSearchRequestConfig);
    yield debounce(1000, GET_SEARCH_FACE_REGISTRATION, handleGetSearchFaceRegistration);
    yield debounce(1000, GET_SEARCH_DEPARTMENTS_HEAD, handleGetSearchDepartMentHead);
    yield debounce(1000, GET_SEARCH_DEPARTMENT, handleGetSearchDepartMent);
    yield debounce(1000, GET_SEARCH_LOCATION_BASED_EMPLOYEE, handleGetSearchLocationBasedCompany);
    yield debounce(1000, GET_SEARCH_COMPANY_BASED_EMPLOYEE, handleGetSearchCompanyBasedEmployee);
    yield debounce(1000, GET_SEARCH_REGISTERED_USER, handleGetRegisterRequest);
    yield debounce(1000, GET_COMPANY_DETAIL, handleGetCompanyDetail);
    yield debounce(1000, GET_AUDIT_CHECKLIST, handleGetSearchAudits);
    yield debounce(1000, GET_WORK_DURATION_REPORT_DATA,handleworkdurationReport)
    yield debounce(1000, GET_SEARCH_REPORT_BANK , handlesearchReportForBank)
    yield debounce(1000, GET_COMPANY_BASED_SEARCH , handlegetCompanyBasedEmpAction)
    yield debounce(1000, GET_COMPANY_BASED_DETAILS_SEARCH , handlegetCompanyBasedEmpDetailsAction)
    yield debounce(1000, GET_LIST_GR_PRODUCT , handleGetSearchProducts)
    yield debounce(1000, GET_LIST_INSURANCE , handleGetSearchInsurance)
    yield debounce(1000, GET_SEARCH_DYNAMIC_PROP, handleGetSearchDynamicProp)
    yield debounce(1000, GET_SEARCH_GROUP, handleGetSearchAssetGroup)
    yield debounce(1000, GET_SEARCH_TYPE, handleGetSearchAssetType)
    yield debounce(1000, GET_LIST_SERVICEDUE, handleGetSearchServiceDue)
    yield debounce(1000, SET_ALL_CHECKLIST_TEMPLATE, handleGetAllChecklist)
    yield debounce(1000, GET_SEARCH_AUDIT_CHECKLIST, handleGetSearchAuditCheckList)
    yield debounce(1000, GET_FILTER_TASK_DETAILS, handleGetFilterTaskDetails)
    yield debounce(1000, GET_MONTH_SHIFT_SCHEDULE, handleMonthShiftScheduleShiftSearch);
    yield debounce(1000, GET_DAY_SHIFT, handleDayShiftSearch);
    yield debounce(1000, SET_LEADS_TASK , handleGetLeadsTask)
    yield debounce(1000, GET_LEADS_ACCOUNTS , handleGetLeadsAccounts)
    yield debounce(1000, GET_ACCOUNTS_CONTACTS , handleGetAccountContacts)
    yield debounce(1000, SET_TASK_BY_STATUS , handleGetTasksStatus)
    yield debounce(1000, SET_ALL_PROJECTS , handleGetProjects)
    yield debounce(1000, SET_WORK_LOG_REPORT , handleGetWorkLog)
    yield debounce(1000, SET_BIOMETRIC_REG , handleGetBiometric)
    yield debounce(1000, SET_CUSTOMER_INVOICE , handleCustomerInvoice)
    yield debounce(1000, SET_CUSTOMER_PAYMENT , handleCustomerPayment)
    yield debounce(1000, SET_CUSTOMER_DELIVERY_CHALLAN , handleCustomerDeliveryChallan)
    yield debounce(1000, SET_CUSTOMER_QUOTES , handleCustomerQuotes)
    yield debounce(1000, SET_CUSTOMER_CREDIT_NOTE , handleCustomerCreditnote)
    yield debounce(1000, GET_ATTENDANCELOGREPORT, handleGetSearchAttendanceLogReport)
    yield debounce(1000, SET_DEVICE_REGISTER, handleGetSearchDeviceRegisterReport)
    yield debounce(1000, SET_FRAUD_LOGS, handleGetSearchFraudLogsReport)
    yield debounce(1000, SET_LOGIN_AUDIT_LOGS, handleGetSearchLoginAuditLogs)
    yield debounce(1000, ORG_CHARTDATA, handleGetOrgChart)
    

    yield debounce(1000, GET_APPROVED_CLAIMS, handleGetClaimApprovedDetails)
    yield debounce(1000, GET_LIST_CALLS, handleGetSearchCalls)
    yield debounce(1000, GET_LIST_MEETINGS, handleGetSearchMeetings)
    yield debounce(1000, GET_LEADS_SEARCH, handleLeadsSearch)
    yield debounce(1000, GET_SEARCH_DEPARTMENT_LIST, handleGetDepartmentList)
    yield debounce(1000, GET_SEARCH_CATEGORY_LIST, handleCategoryList)
    yield debounce(1000, GET_LEAD_SOURCE_LIST, handleLeadSourceList)
    yield debounce(1000, GET_SEARCH_CLAIMS_CATEGORY_LIST, handleClaimsCategoryList)
    yield debounce(1000, GET_LIST_PAYROLLCALENDER, handleGetSearchPayrollCalender)
    yield debounce(1000, GET_SEARCH_RELIEVED_EMPLOYEE_DETAILS, handleRelievedEmployeeSearch)
    yield debounce(1000, GET_SEARCH_DESIGNATION, handleDesignationSearch)
    yield debounce(1000, GET_LIST_TERMSCONDITIONS, handleGetSearchTermsConditions)
    yield debounce(1000, GET_SEARCH_QUOTATION, handleQuotationSearch)
    yield debounce(1000, GET_QUOTATION_CONFIG_SEARCH, handleQuotationConfigSearch)
    yield debounce(1000, GET_LIST_CAMPAIGN, handleGetSearchCampaign)
    yield debounce(1000, GET_SEARCH_SYNC_PRODUCT, handleGetSearchsyncProduct);
    yield debounce(1000, GET_CAMPAIGN_LEADS, handleGetSearchCampaignLeads);
    yield debounce(1000, GET_LEAD_STATUS, handleLeadStatusSearch)
    yield debounce(1000, GET_DELETED_LOG_DETAILS, handleGetSearchDeleteLogs)
    yield debounce(1000, GET_COMPLIANCES_SEARCH, handleCompliancesSearch)
    yield debounce(1000, GET_RENEWAL_SEARCH, handleRenewalSearch)
    yield debounce(1000, GET_RENEWALS_LOV, handleGetSearchRenewalsLov)
    yield debounce(1000, SET_SERVICE_TYPE, handleGetSearchServiceTypeLov)
    yield debounce(1000, GET_SEARCH_ALERTS_EMPLOYEE_FILTER, handleGetSearchAlertsEmployeeFilter)
    yield debounce(1000, GET_SEARCH_COST_SUMMARY_REPORT_ACTION, handleGetSearchCostSummaryReport)
    yield debounce(1000, GET_PAYMENT_COLLECTION_REPORT,handleGetPaymentCollectionReport)
    yield debounce(1000, GET_LIST_COMPLIANCES,handleGetSearchCompliances)
    yield debounce(1000, GET_LIST_CUSTOM_RENEWALS,handleGetSearchCustomRenewals)
    yield debounce(1000, GET_SCRAP_ASSET_REPORT,handleGetSearchScrapAssetReport)
    yield debounce(1000, GET_RENTALS_AND_TENANTS,handleGetSearchRentalAndTenants)
    yield debounce(1000, GET_ASST_GENERAL,handleGetSearchgeneralContact)
    yield debounce(1000, SET_INSURANCE_LOV,handleGetSearchInsuranceLov)
    yield debounce(1000, GET_SEARCH_SALESMAN_INCENTIVE, handleGetSearchIncentives);
    yield debounce(1000, GET_PROFIT_WISE_REPORT,handleGetSearchProfitWiseReport)
    yield debounce(1000, GET_GST1_REPORT, handleGetSearchGst1Report)
    yield debounce(1000, GET_FORM27EQ_REPORT, handleGetSearchForm27EQReport)
    yield debounce(1000, GET_GST2_REPORT, handleGetSearchGst2Report)
    yield debounce(1000, GET_GST_REPORT, handleGetSearchGstReport)
    yield debounce(1000, GET_GST_RATE_REPORT, handleGetSearchGstRateReport)
    yield debounce(1000, GET_TCS_RECEIVABLE, handleGetSearchTcsReceivable)
    yield debounce(1000, GET_UNITS_LOV, handleGetSearchUnitsLov)
    yield debounce(1000, GET_CREDIT_DAYS_LOV, handleGetSearchCreditDaysLov)
    yield debounce(1000, GET_SEARCH_CANCELLED_ORDERS, handleGetSearchPreOrderReport)
    yield debounce(1000, GET_SEARCH_PRE_ORDER, handleGetSearchPreOrder)
    yield debounce(1000, GET_SEARCH_SALESMAN_COLLECTION, handleGetSalesmanCollection)
    yield debounce(1000, GET_PRODUCT_BY_LOT_NUMBER, handleProductSearchByLotNumber)
    yield debounce(1000, GET_SEARCH_SALES_MAN_LIST, handlesearchSalesManListAction)
    yield debounce(1000, GET_SEARCH_USER_MODULE_ACTION, handlesearchUserModules)
    yield debounce(1000, SET_SCHEMES_RECEIVABLES , handleSchemesReceivables)
    yield debounce(1000, GET_MANUAL_MATCH_RECORDS, handleGetSearchManualMatch)
    yield debounce(1000, GET_SEARCH_DEFECT_COLLECTION, handleSearchCollectedDefects)
    yield debounce(1000, GET_SEARCH_REPLACEMENT, handleSearchReplacements)
    yield debounce(1000, GET_SEARCH_SCRAP_LOT_REPORT, handleScrapLotSearch)
    yield debounce(1000, GET_SALARY_TEMPLATE, handleSearchSalaryTemplate)
    yield debounce(1000, GET_SEARCH_BY_CUSTOMER, handleGetSearchByCustomer)
    yield debounce(1000, GET_SEARCH_BY_CUSTOMER_SALESMAN, handleGetSearchByCustomerSalesman)
    yield debounce(1000, GET_SEARCH_BY_CUSTOMER_SUPPLIER, handleGetSearchByCustomerSupplier)
    yield debounce(1000, GET_SEARCH_BY_VENDOR, handleGetSearchByVendor)
    yield debounce(1000, GET_TASK_ID_BY_SEARCH, handleGetTaskIdBySearch)
    yield debounce(1000, GET_CHECK_PROJECT_EXISTS, handleCheckProjectExists)
}


