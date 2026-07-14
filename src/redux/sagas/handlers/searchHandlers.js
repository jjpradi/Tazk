import { call, put, cancel, cancelled } from 'redux-saga/effects';
import store from '../../store/index'
import {get_searchsyncProductAction, setSearchProductListAction, set_productInfiniteScroll, set_searchProductAction, set_searchsyncProductAction} from 'redux/actions/product_actions';
import SearchRequests from '../requests/searchRequests';
import http from '../../../http-common';
import axios from 'axios';
import { ListLoad, FailLoad, ErrorAlert, errorAlertAction } from "redux/actions/load";
import { searchPurchaseReportState, setSearchPayableReportAction, set_completedpaymentview, set_purchaseSummaryAction, set_searchPurchaseAction, set_searchPurchasePayablesAction } from 'redux/actions/purchase_actions';
import {setSearchAgeingReportAction, setSearchClosingStockAction, setSearchStockReceiveAction, set_searchinventoryAction} from 'redux/actions/inventory_actions';
import { set_searchPosPromotionAction, set_searchPosSaleAction } from 'redux/actions/pos_sale_actions';
import { setSearchConsolidatedAction, setSearchOutstandReportAction, setSearchReceivableReportAction, set_searchSalesAction,set_searchReceivableAction, set_paymentCollectionAction, set_searchcompletedSalesOutstandingAction, getDayBookAction, getStockSummary, set_searchProfitWiseReportAction, set_searchIncentiveAction, getExpirtDateReport, set_searchSaleOrderAction, set_searchDcAction, set_salesSummaryAction} from 'redux/actions/sales_actions';
import { searchSalesReportState } from 'redux/actions/sales_actions';
import InventoryService from 'services/inventory_services';
import { set_searchCreditdebitAction, set_searchPaymentreportAction } from 'redux/actions/paymentReceipt_actions';
import { set_searchLedgerAction } from 'redux/actions/generalLedger';
import { set_searchSalesManAction, setSearchSalesmanCollectionAction } from 'redux/actions/salesMan_action';
import { set_searchstocktransferAction } from 'redux/actions/inventory_actions';
import { set_searchreconcilateAction } from 'redux/actions/stockReconcilate_actions';
import { set_SearchlocationAction } from 'redux/actions/stock_Location_actions';
import { getSchemesReceivablesAction, set_searchSchemesAction } from 'redux/actions/schemes_actions';
import { set_searchCheqbounceAction } from 'redux/actions/salesMan_action';
import { setSearchLeadsAction } from 'redux/actions/leads_actions';
import { setSearchTransactionAction } from 'redux/actions/transaction_actions';
//import { set_SearchlocationAction } from 'redux/actions/stock_Location_actions';
import { set_searchBankAction, set_searchBankReconciliationAction, setSearchManualMatchAction } from 'redux/actions/bankCreation_actions';
import { set_searchChartofAccountAction } from 'redux/actions/chartOfAccounts';
import { set_searchManualSchemesAction } from 'redux/actions/manual_schemes_actions';
import TaxRateService from 'services/taxrate_services';
import { setSearchTaxRatesAction } from 'redux/actions/taxRate_actions';
import { SetSalaryReportForBankAction, getSalaryStatement, searchPaySlipReportState, searchProcessSalaryState, searchSalaryStructureState, setSearchSalaryAction, setSearchSalaryReport, setSearchSalaryState, setSearchSalaryTemplateAction, setSearchcostSummaryReportAction } from 'redux/actions/salary_actions';
import salary_services from 'services/salary_services';
import { setSearchHolidayState } from 'redux/actions/holidays_actions';
import holidays_services from 'services/holidays_services';
import { searchChequeReportState, setSearchBrandReportState, setSearchRelievedEmployeeDetails, setSearchScrapLotsAction } from 'redux/actions/reports_actions';
import ReportsService from 'services/reports_services';
import PurchasesService from 'services/purchases_services';
import { set_searchCashBoxAction } from 'redux/actions/cash_box_actions';
import { getRegisterRequestState, setCompanyDetailsState, setSearchDesignation, setSearchTrainingType, set_searchUserCreationAction } from 'redux/actions/userCreation_actions';
import { set_searchPoscreateAction } from 'redux/actions/pos_creations_actions';
import { set_searchPaymentMethodAction } from 'redux/actions/payment_method_actions';
import { setSearchApprovedClaimAction, setSearchClaimAction, setsearchClaimAction, setSearchClaimsCategoryList, setsearchLoanAction } from 'redux/actions/loan_actions';
import { set_searchHistoryReportAction, set_searchLeaveReportAction, setSearchCategoryList, setSearchdayShift, setSearchmonthShiftScheduleShift } from 'redux/actions/shifts.actions';
import { getDateTimeFormat } from 'utils/getTimeFormat';

import { setSearchShiftlistAction } from 'redux/actions/shifts.actions';
import { getSearchPayrollCompleteListAction, getSearchPayrollLateLoginAction, getSearchPayrollNotCheckinAction, setProjectsAction, setSearchPayrollCheckinAction,setSearchPayrollCompleteListAction,setSearchPayrollLateLoginAction,setSearchPayrollNotCheckinAction, setSearchWorkLogAction, setTaskByStatusAction, set_searchTaskLogAction, setTaskIdBySearchAction } from 'redux/actions/payrollDashboard_actions';
import { set_dashboardLayoutAction } from 'redux/actions/dashboard_role_actions';
import { setSearchrequestReportAction } from 'redux/actions/shifts.actions';
import configuration_services from 'services/configuration_services';
import { searchMailState, setSearchSmsAction } from 'redux/actions/configuration_actions';
import { set_searchUserModulesAction, set_searchUserRoleAction } from 'redux/actions/role_actions';
import { set_searchContactsAction, set_searchPickcustomerContactsAction, setCustomerCreditNoteAction, setCustomerDeliveryChallan, setCustomerInvoiceAction, setCustomerpaymentAction, setCustomerQuotesAction, setSearchByCustomersDataAction, setSearchByCustomerSupplierDataAction } from 'redux/actions/customer_actions';
import { searchPriceListState } from 'redux/actions/priceList_actions';
import PriceListService from 'services/priceList_services';
import { set_expenseSearchAction } from 'redux/actions/expense_actions'
import { OpenalertActions } from 'redux/actions/alert_actions';
import { setsearchCompanyLoanAction } from 'redux/actions/allLoans_actions';
import { set_checkExistsAction } from 'redux/actions/app_config_actions';
import { setsearchAttendanceCorAction, setsearchAttendanceViewAction, set_searchSelfieImagesAction, setSearchOverTimeReportAction,setSearchAttendanceListAction, set_search_department_based_employee, set_search_location_based_employee, set_search_company_based_employee, setWorkdurationReportAction, setCompanyBasedEmpAction, setCompanyBasedEmpDetailsAction, set_search_category_based_employee, setSearchLateAndEarlyReportAction, setSearchPfReportAction, setSearchAttendanceLogReportAction, setSearchPunchReportAction, setSearchPrivilegeleaveAction } from 'redux/actions/attendance_actions';
import { setSearchOrgChartAction } from 'redux/actions/orgStructure.actions';
import { setSearchAssignListAction, setSearchAssignToAction,setSearchWarrant, setSearchDynamicPropListAction, setSearchAssetGroupAction, setSearchAssetTypeAction, setSearchScrapAssetReportAction ,setRentalAndTenantsAction, setAsstGeneralContactAction} from 'redux/actions/asset_actions';
import { setSearchAssetAction } from 'redux/actions/asset_actions';
import { setSearchAlertsEmployeeFilterAction, setSearchAlertsListAction } from 'redux/actions/asst_alerts_actions';
import { setAuditCheckListSearchAction, setgetAllCheckListTemplateAction, setSerachAuditAction } from 'redux/actions/audit_actions';
import { setSearchDeleteListAction } from 'redux/actions/deletedLogDetailsAction';
import { setSearchInsuranceAction } from 'redux/actions/insurance_actions';
import { setSearchServiceDueAction, setSearchServiceTypeLovAction } from 'redux/actions/serviceDue_actions';
import { setSearchTaskAction } from 'redux/actions/payrollDashboard_actions';
import { setSearchDepartmentHeadState, setSearchDepartmentState, set_search_department_based_employee_for_department_head } from 'redux/actions/departmentHead';
import { setSearchRequestConfigState, set_search_company_based_admin_manager } from 'redux/actions/requestConfig';
import { setSearchCallsAction } from 'redux/actions/calls_actions';
import shiftsServices from 'services/shifts.services';
import { setAccountContacts, setLeadsAccountsAction, setSearchLeadsTaskAction } from 'redux/actions/leads_task_actions';
import { setSearchMeetingsAction } from 'redux/actions/meetings_actions';
import { setLeadSourceList, setLeadsSearchAction, setSearchStatusAction } from 'redux/actions/leadManagement_actions';
import { setQuotationConfigSearchAction, setQuotationSearchAction } from 'redux/actions/quotation_actions';
import { setSearchDepartmentList } from 'redux/actions/shifts.actions';
import { setSearchPayrollCalenderAction } from 'redux/actions/calender_actions';
import { getBioMetricAction, setSearchFaceRegistrationState } from 'redux/actions/face_registration_action';
import { setCreditDaysLovSearchAction, setSearchTermsConditionsAction, setSearchUnitsLovAction } from 'redux/actions/termsConditions_actions';
import { setSearchCampaignAction, setSearchCampaignLeadsAction } from 'redux/actions/campaign_actions';
import { setSearchSpecialPermission } from 'redux/actions/specialPermission_actions';
import specialPermission_services from 'services/specialPermission_services';
import { setCompliancesLOVAction, setSearchCompliancesAction } from 'redux/actions/compliances_actions';
import { setRenewalSearchAction, setSearchRenewalsLovAction } from 'redux/actions/renewals_actions';
import { setSearchForm27EQReportAction, setSearchGst1ReportAction, setSearchGst2ReportAction, setSearchGstReportAction, setSearchGstRateReportAction, setSearchTcsReceivableAction } from 'redux/actions/tax_actions';
import { setSearchAllPlansAction, setSearchScheduledPlansAction } from 'redux/actions/clientSubscription_action';
import { setSearchPreOrderAction, setSearchPreOrderReportAction } from 'redux/actions/preOrder_actions';
import { setSearchCollectedDefectsAction, setSearchReplacementAction } from 'redux/actions/defects_actions';
import { setSearchInsuranceLovAction } from '../../actions/insurance_actions';
import { getDeviceRegisterReportAction, getfraudLogsAction, getLoginAuditLogsAction } from '../../actions/reports_actions';
import { searchErrorMessage } from 'utils/content';
import { setSearchByVendorDataAction } from 'redux/actions/vendor_actions';
import ROUTE_PREFIXES from 'utils/routesprefix';
import { setSearchCustomRenewalsAction } from '../../actions/renewals_actions';

export function* handleGetSearchProduct(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body
      if(val.searchString.length >=3 || val.searchString.length === 0) {
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/product/searchProduct',
           action.body, 
          { cancelToken: source.token,}
        );
  
        const {data} = response;
        yield put(set_searchProductAction(data));
  
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      }
      else{
        yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
      }
    
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchPurchase(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    if(val.trim() !== ''){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/purchase/searchPurchase',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchPurchaseAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
        yield call(source.cancel);
    }
  }
}

export function* handleGetSearchSales(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    if(val.trim() !== ''){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/sales/searchSales',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchSalesAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    }
  } catch (error) {
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchSaleOrder(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    if(val.length >= 3 || val.length === 0){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/sales/searchSaleOrder',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchSaleOrderAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    }
    else {
      yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }
  } catch (error) {
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchDC(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    if(val.length >= 3 || val.length === 0){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/sales/searchDC',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchDcAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    }
    else {
      yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }
  } catch (error) {
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchSalesMan(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    if(val.length >= 3 || val.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/salesMan/searchSalesMan',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchSalesManAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else{
      yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
} 

export function* handleGetSearchcompletedSalesOutstanding(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {
    // console.log("actionaction",action);
    
    const employee_id = action.data.user_id;
    const headerLocationId =action.data.location_id;
    const val = action.data.searchString
    if(val.length >= 3 || val.length === 0){
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, `/sales/receipt/${employee_id}/${headerLocationId}/receipt`,
      {...action.data}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchcompletedSalesOutstandingAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else {
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }
  } catch (error) {
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

// export function* handleGetSearchPaymentReceipt(action) {
//   const CancelToken = axios.CancelToken;
//   const source = CancelToken.source();
  
 
//   try {

//     const val = action.body.searchString
//     if(val.trim() !== ''){
      
//       ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
//       const response = yield call(http.post, '/paymentReceipt/searchPaymentReceipt',
//       {...action.body}, 
//       { cancelToken: source.token,}
//       );
//       const {data} = response;
//       yield put(set_searchPaymentReceiptAction(data));
//       FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
//     }
//   } catch (error) {
    // yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
//     FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
//   } finally {
//     if (yield cancelled()) {
//       yield call(source.cancel);
//     }
//   }
// }

export function* handleGetSearchInventory(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const employeeId = action.data.user_id;
    const headerLocationId =action.data.location_id;
    if(action.data.searchString.length >= 3 || action.data.searchString.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post,`/inventory/searchInventory/${employeeId}/${headerLocationId}`,
      {...action.data}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      console.log('searchhandler', data)
      yield put(set_searchinventoryAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else{
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }

    // const {searchString,employeeId,headerLocationId} = action.data
      
    
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}


export function* handleGetSearchPosSale(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString

      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/posSale/searchPosSales',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchPosSaleAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSearchStockReceive(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    const val = action.body.searchString
    if(val.length >=3 || val.lengt ===0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(InventoryService.getSearchStockReceive, { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchStockReceiveAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else{
      yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchPaymentreport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    // if(val.trim() !== ''){
      if(val.length >= 3 || val.length === 0){
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/paymentReceipt/searchPaymentReceipt',
        action.body, 
        { cancelToken: source.token,}
        ); //searchPaymentReceipt
        const {data} = response;
        yield put(set_searchPaymentreportAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      }
      else{
         yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
      }
      
    // }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchLedger(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    if(val.trim() !== ''){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/ledger/Searchledger',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchLedgerAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchCreditdebit(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString

    if(val.length >= 3 || val.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/manualNotes/SearchCreditdebit',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const { data } = response;
      yield put(set_searchCreditdebitAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else {
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }
      

  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}


//stocktransfer search
export function* handleGetSearchStockTransfer(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const {searchString,employeeId,headerLocationId} = action.data
  
      if(action.data.searchString.length >= 3 || action.data.searchString.length === 0) {
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post,`/inventory/stockTransfer/${employeeId}/${headerLocationId}`,
        {...action.data}, 
        { cancelToken: source.token,}
        );
        const {data} = response;
        yield put(set_searchstocktransferAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);

      }
      else{
        yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
      }
      
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

//physical stock search
export function* handleGetSearchReconcilate(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {

    const {searchString,employeeId,headerLocationId} = action.data
      if(action.data.searchString.length >= 3 || action.data.searchString.length === 0) {
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post,`/lotItems/searchReconcilate`,
        {...action.data}, 
        { cancelToken: source.token,}
        );
        const {data} = response;
        yield put(set_searchreconcilateAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      }
      else{
        yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
      }
      
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchLocation(action) {

  const CancelToken = axios.CancelToken;

  const source = CancelToken.source();

  try {

    const val = action.body.searchString

      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);

      const response = yield call(http.post, '/stockLocation/searchLocation',

      {...action.body}, 

      { cancelToken: source.token,}

      );

      const {data} = response;

      yield put(set_SearchlocationAction(data));

      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);

  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));

    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);

  } finally {

    if (yield cancelled()) {

      yield call(source.cancel);

    }

  }

}

export function* handleGetSearchLeads(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/Leads/Leads',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(setSearchLeadsAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}


export function* handleGetSearchSchemes(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {

    const {searchString} = action.data
      if(action.data.searchString.length >= 3 || action.data.searchString.length === 0) {
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  
        const response = yield call(http.post,`/schemes/searchscheme`,
        {...action.data}, 
        { cancelToken: source.token,}
        );
        const data = response;
        yield put(set_searchSchemesAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      }
      else {
        yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
      }
      
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchIncentives(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {

    const { searchString } = action.data
    if(action.data.searchString.length >= 3 || action.data.searchString.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  
      const response = yield call(http.post, `/sales/searchIncentive`,
        { ...action.data },
        { cancelToken: source.token, }
      );
      const data = response;
      yield put(set_searchIncentiveAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } 
    else {
      yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }

  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchTransaction(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString

      if(val.length >= 3 || val.length === 0) {
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/transaction/SearchTransaction',
        {...action.body}, 
        { cancelToken: source.token,}
        );
        const {data} = response;
        yield put(setSearchTransactionAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      }
      else{
        yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
      }
      

  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}



export function* handleGetSearchBankReconcilation(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    if (val.length >= 3 || val.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/bankCreation/unreconciledAndReconciled',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchBankReconciliationAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);

    }
    else{
      yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }     
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
} 

//chequebounce searchhanlde
export function* handleGetSearchChequebounce(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString 
      if (val.length >= 3 || val.length === 0) {
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, `/salesMan/searchChequebounce/${action.body.employeeId
        }/${action.body.headerLocationId}`,
         {...action.body}, 
        { cancelToken: source.token,}
        ); //searchChequebounce
        const {data} = response;
        yield put(set_searchCheqbounceAction(data));
        if(action.callback){
          action.callback(data)
        }
         FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      }
      else{
        yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
      }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
} 

export function* handleGetSearchChartofAccount(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
      
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    const response = yield call(http.post, '/chartOfAccount/searchChartofAccount',
    {...action.body}, 
    { cancelToken: source.token,}
    );
    const data = response;

    yield put(set_searchChartofAccountAction(data));

    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    // if (yield cancelled()) {
      yield call(source.cancel);
    // }
  }
} 

export function* handleGetSearchManualSchemes(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString

      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/manualSchemes/searchManualSchemes',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchManualSchemesAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      

  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSearchTaxRate(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    const val = action.body.searchString
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(TaxRateService.getAll, { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchTaxRatesAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    // }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchBank(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/bankCreation/searchBank',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchBankAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
} 

export function* handleGetSearchCashBox(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/cashBox/searchCashBox',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchCashBoxAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}
      

export function* handleGetSearchPoscreate(action) {
  const CancelToken = axios.CancelToken;

  const source = CancelToken.source();

  try {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);

      const response = yield call(
        http.post,
        '/posCreation/searchPoscreation',

        {...action.body},

        {cancelToken: source.token},
      );

      const {data} = response;

      yield put(set_searchPoscreateAction(data));

      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);

  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}   
 

export function* handleGetSearchUserCreation(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    // if(val.trim() !== ''){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/userCreation/UserCreations',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchUserCreationAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}     


export function* handleGetSearchPaymentMethod(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString;

      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(
        http.post,
        '/paymentMethod/searchPaymentMethod',
        {...action.body},
        {cancelToken: source.token},
      );
      const {data} = response;
      yield put(set_searchPaymentMethodAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);

  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
} 

export function* handleGetSearchHistoryReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    if(val.trim() !== ''){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/shifts/searchHistoryReport',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchHistoryReportAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
} 

export function* handleGetSearchLeaveReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    // if(val.trim() !== ''){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/shifts/leaveHistory/filter',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchLeaveReportAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    // }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSearchSalary(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    const val = action.body.searchString

      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(salary_services.searchSalary, { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchSalaryAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);

  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSalaryStatement(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
 
  try {

    const val = action.body.id
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, `/salary/salaryStatement`,
         { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(getSalaryStatement(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

  export function* handleStockGroupSummary(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
   
    try {
  
      const val = action.body.searchString
      if(val.length >= 3 || val.length === 0) {
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, `/sales/getStockGroupSummary`,
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(getStockSummary(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      }
      else{
        yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
      }
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
    }

    export function* handleExpiryDateReport(action) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
     
      try {
    
        const val = action.body.id
        if(action.body.searchString.length >= 3 || action.body.searchString.length === 0) {
          ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          const response = yield call(http.post, `/sales/expiryDateReport`,
             { ...action.body },
            { cancelToken: source.token, }
          );
          const { data } = response;
          yield put(getExpirtDateReport(data));
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        }
        else {
          yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
        }
        } catch (error) {
          yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        } finally {
          if (yield cancelled()) {
            yield call(source.cancel);
          }
        }
      }

  export function* handleDayBook(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
   
    try {
  
      const val = action.body.id
      if(action.body.searchString.length >= 3 || action.body.searchString.length === 0) {

        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, `/sales/dayBookReport`,
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(getDayBookAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      }
      else{
        yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
      }
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
    }

export function* handleGetSearchLoan(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const { searchString, pageCount, numPerPage, type } = action.data;
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/loan/searchLoan',{
        searchString,
        pageCount,
        numPerPage,
        employeeId: null,
        date: null,
        type,
        key: 'ApprovalPage',
      }, {cancelToken: source.token},
      );
      const {data} = response;
      yield put(setsearchLoanAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchClaim(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const { searchString, pageCount, numPerPage, type } = action.data;
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/loan/searchClaimAndOthers',{
        searchString,
        pageCount,
        numPerPage,
        employeeId: null,
        date: null,
        type
      }, {cancelToken: source.token},
      );
      const {data} = response;
      yield put(setsearchClaimAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchCompanyLoan(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    // const val = action.data.searchString;
    // if (val.trim() !== '') {
    if(action.body.searchString.length >= 3 || action.body.searchString.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/allLoans/searchLoan',
        {...action.body},
        {cancelToken: source.token},
      );
      const {data} = response;
      yield put(setsearchCompanyLoanAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else{
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSearchHoliday(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    const val = action.body.searchString
    //if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(holidays_services.search, { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchHolidayState(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSearchSpecialPermission(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    const val = action.body.searchString
    //if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(specialPermission_services.search, { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchSpecialPermission(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

// export function* handleSearchAssign(action) {
//   const CancelToken = axios.CancelToken;
//   const source = CancelToken.source();

//   try {
//     const val = action.body.searchString
//     //if (val.trim() !== '') {
//       ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
//       const response = yield call(asset_services.searchAssign, { ...action.body },
//         { cancelToken: source.token, }
//       );
//       const { data } = response;
//       yield put(setSearchAssignState(data));
//       FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
//     //}
//   } catch (error) {
//     yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
//     FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
//   } finally {
//     if (yield cancelled()) {
//       yield call(source.cancel);
//     }
//   }
// }


export function* handleGetSearchClosingStock(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const {searchString,employeeId,headerLocationId} = action.body
    const currentDate = getDateTimeFormat(new Date()).slice(0, 10)
    //const date = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate()
    const val = action.body.searchString;
    if(val.length >= 3 || val.length === 0){
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call( http.post,`/Inventory/Closefilterstock`,
          {...action.body},
          {cancelToken: source.token},
        );
        const {data} = response;
        yield put(setSearchClosingStockAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else{
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}
    
export function* handleGetSearchAgeingReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString;
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/stockInHand/searchStockAgeingReport',
        {...action.body},
        {cancelToken: source.token},
      );
      const {data} = response;
      yield put(setSearchAgeingReportAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchOverTimeReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  console.log('lll',action.data);
  try {
    const val = action.data.searchString;
   
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/attendance/overTimeReport',
        {...action.data},
        {cancelToken: source.token},
      );
      const {data} = response;
      yield put(setSearchOverTimeReportAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    console.log('err');
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchlateAndEarlyReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  console.log('lll',action.data);
  try {
    const val = action.data.searchString;
   
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/attendance/lateLoginEarlyCheckoutReport',
        {...action.data},
        {cancelToken: source.token},
      );
      const {data} = response;
      yield put(setSearchLateAndEarlyReportAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    console.log('err');
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetPunchExceptionReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  console.log('lll',action.data);
  try {
    const val = action.data.searchString;
   
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/attendance/PunchExceptions',
        {...action.data},
        {cancelToken: source.token},
      );
      const {data} = response;
      yield put(setSearchPunchReportAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    console.log('err');
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}


export function* handleGetPrivilegeLeaveReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  console.log('PrivilegeLeave',action.data);
  try {
    const val = action.data.searchString;
   
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/attendance/PrivilegeLeaveReport',
        {...action.data},
        {cancelToken: source.token},
      );
      const {data} = response;
      yield put(setSearchPrivilegeleaveAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    console.log('err');
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchPfReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  console.log('lll',action.data);
  try {
    const val = action.data.searchString;
   
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/salary/pfReport',
        {...action.data},
        {cancelToken: source.token},
      );
      const {data} = response;
      yield put(setSearchPfReportAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    console.log('err');
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetPurchaseSummary(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    console.log(action.data,'sdfsdfsdf')
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/purchase/purchaseSummary',
        {...action.body},
        {cancelToken: source.token},
      );
      const {data} = response;
      yield put(set_purchaseSummaryAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    console.log('err');
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSalesSummary(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    console.log(action.data,'sdfsdfsdf')
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/purchase/purchaseSummary',
        {...action.body},
        {cancelToken: source.token},
      );
      const {data} = response;
      yield put(set_salesSummaryAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    console.log('err');
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}
    
    
export function* handleGetSearchOutstandReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString
    if(val.trim() !== ''){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/sales/SearchOutstandReport',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(setSearchOutstandReportAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSearchChequeReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    const val = action.body.searchString
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    const response = yield call(http.post, '/reports/searchChequeReport',
      { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(searchChequeReportState(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSearchPurchaseReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    const val = action.body.searchString
    if (val.length >= 3 || val.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(PurchasesService.searchPurchaseReport, { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(searchPurchaseReportState(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else {
      yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchConsolidatedReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString
    if(val.trim() !== ''){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/PaymentConsolidated/SearchPaymentConsolidated',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(setSearchConsolidatedAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSearchSalesReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
  try {
    if(action.body.searchString.length >= 3 || action.body.searchString.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/sales/searchSalesReport',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(searchSalesReportState(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);

    }
    else{
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }
    const val = action.body.searchString
    // if(val.trim() !== ''){
      
      
    // }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchShiftlist(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/shifts/SearchShiftList',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(setSearchShiftlistAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}


export function* handleGetSearchPayrollCheckin(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    // if(val.trim() !== ''){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/payrollDashboard/searchCheckedIn',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(setSearchPayrollCheckinAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    // }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchPayrollNotCheckin(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    // if(val.trim() !== ''){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/payrollDashboard/searchNotCheckedIn',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(setSearchPayrollNotCheckinAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    // }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchPayrollLatelogin(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    // if(val.trim() !== ''){
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/payrollDashboard/searchLateLogin',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(setSearchPayrollLateLoginAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    // }
      
    
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}



export function* handleGetSearchPayrollCompleteList(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/payrollDashboard/searchCompleteList',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(setSearchPayrollCompleteListAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleUpdateDashboardLayout(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {   
      const response = yield call(http.put, '/dashboard/layouts',
        {...action.body}, 
        { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_dashboardLayoutAction(data));
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    // --
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchrequestReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    const val = action.body.searchString
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/shifts/searchrequesthistory',
         { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchrequestReportAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    // }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchAttendanceLog(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    const val = action.body.searchString
    if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/attendance/AttendanceProcess',
         { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchAttendanceListAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSearchMail(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    const val = action.body.searchStringValMail
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, `/appConfig/configuration/searchMail`, { ...action.body },
        { cancelToken: source.token, }
      ); //configuration_services.searchMail
      const { data } = response;
      yield put(searchMailState(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    // }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchReceivableReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString
    if(val.trim() !== ''){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/sales/searchReceivableReport',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;

      yield put(setSearchReceivableReportAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSearchSms(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    const val = action.body.searchStringValSms
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, `/appConfig/configuration/searchSms`, { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchSmsAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchPayableReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/purchase/searchPayableReport',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(setSearchPayableReportAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);

  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSearchBrandReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString;
    if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/reports/searchBrandReports',
        {...action.body},
        {cancelToken: source.token},
      );
      const {data} = response;
      yield put(setSearchBrandReportState(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}


export function* handleGetSearchUserrole(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString
    //if(searchString.trim() !== '' && searchString.length > 1){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/role/searchUserRole',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchUserRoleAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
   // }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleProductInfiniteScroll(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString
    if(val.trim() !== ''){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/product/infiniteScrollSearch',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_productInfiniteScroll(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSearchContacts(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const {searchString, type_details, type,numPerPage,pageCount, location_id, department_id,sortKey,sortOrder} = action.data

      if(searchString.length >= 3 || searchString.length === 0){
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, `/customer/searchCustomer/${type_details}/${type}`,
        {searchString,type_details,type,numPerPage,pageCount, location_id, department_id,sortKey,sortOrder}, 
        { cancelToken: source.token,}
        );
        const { data } = response;
        action.response(data)
        yield put(set_searchContactsAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      }
      else{
        yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
      }
    
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* pickcustomerhandleSearchContacts(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const {searchString, numPerPage,pageCount} = action.data

      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, `/customer/pickCustomer`,
      {searchString,numPerPage,pageCount}, 
      { cancelToken: source.token,}
      );
      const { data } = response;
      yield put(set_searchPickcustomerContactsAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSearchPriceList(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    if(action.body.searchString.length >= 3 || action.body.searchString.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(PriceListService.pagination,
        { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(searchPriceListState(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else {
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}


export function* handlExpenseSearch(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    if(action.body.searchString.length >= 3 || action.body.searchString.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/expense/expenseSearch',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const { data } = response;
      yield put(set_expenseSearchAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else{
      yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }  
      

  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleProcessSalarySearch(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    const response = yield call(salary_services.processSalaryPagination,
      { ...action.body }, action.commoncookie,
      { cancelToken: source.token, }
    );
    const { data } = response;
    yield put(searchProcessSalaryState(data));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSalaryReportSearch(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    const response = yield call(salary_services.searchSalaryReport,
      { ...action.body }, action.commoncookie,
      { cancelToken: source.token, }
    );
    const { data } = response;
    yield put(setSearchSalaryReport(data));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handlePaySlipReportSearch(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    const response = yield call(salary_services.paySlipReportPagination,
      { ...action.body }, action.commoncookie,
      { cancelToken: source.token, }
    );
    const { data } = response;
    yield put(searchPaySlipReportState(data));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleCheckProjectExists(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const response = yield call(
      http.post,
      `/projects/checkProjectExists`,
      { ...action.body },
      { cancelToken: source.token }
    );
    if (action.res) action.res(response.data);
  } catch (error) {
    if (action.res) action.res({ exists: false, type: action.body?.type });
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetCheckExists(action) {
   
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {

    // const {searchString,employeeId,headerLocationId} = action.data
  const type = action.types;

      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post,`/company/checkAlreadyExists/${type}`,
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      if(data?.response_code === 400){
          action.res(false)
      }
      else{
        action.res(true)
      }
     
      yield put(set_checkExistsAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    
  } catch (error) {
  //   yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchCompletedPaymentView(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString
    if(val.length >= 3 || val.length === 0){     
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, `/purchase/entrypayment/${action.employee_id
      }/${action.headerLocationId}/payment`,
       {...action.body}, 
      { cancelToken: source.token,}
      ); //searchChequebounce
      const {data} = response;
      yield put(set_completedpaymentview(data));
       FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else {
      yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
} 

export function* handleGetSearchPosPromotion(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/posSale/searchPosPromotions',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(set_searchPosPromotionAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}
export function* handleGetSearchAttendanceView(action) {
  console.log(action,'action')
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/attendance/AttendanceProcess',
        {...action.body},
        {cancelToken: source.token},
      );
    const { data } = response;
      yield put(setsearchAttendanceViewAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSearchPayable(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const {employeeId,headerLocationId, body} = action.data;
    if (body.searchString.length >= 3 || body.searchString.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,`/purchase/payables/${employeeId}/${headerLocationId}/payable`,
        {...body},
        {cancelToken: source.token},
      );
    const { data } = response;
      yield put(set_searchPurchasePayablesAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else {
      yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handlesearchReceivable(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const {employeeId,headerLocationId, searchString} = action.data;
    if (searchString.length >= 3 || searchString.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,`/sales/received/${employeeId}/${headerLocationId}`, 
        {...action.data},
        {cancelToken: source.token},
      );
    const { data } = response;
      yield put(set_searchReceivableAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else {
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchAttendanceCor(action) {
  console.log('checksearch')
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.data.searchString;
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/attendance/searchAttendanceCor',
        {...action.data},
        {cancelToken: source.token},
      );
      const {data} = response;
      yield put(setsearchAttendanceCorAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchSelfieImages(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.data.searchString;
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/attendance/viewSelfieAttendanceImages',
        {...action.data},
        {cancelToken: source.token},
      );
    const { data } = response;
      yield put(set_searchSelfieImagesAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchTaskLog(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/projects/searchSummaryReport',
        {...action.body},
        {cancelToken: source.token},
      );
      const {data} = response;
      yield put(set_searchTaskLogAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}
export function* handleGetTaskIdBySearch(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const searchString = action?.body?.searchString ?? '';

    if (!String(searchString).trim()) {
      yield put(OpenalertActions({ msg: 'Enter task key', severity: 'warning' }));
      return;
    }

    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    const response = yield call(
      http.post,
      '/projects/getTaskIdBySearch',
      { ...action.body },
      { cancelToken: source.token },
    );
    const { data } = response;

    yield put(setTaskIdBySearchAction(data));
    if (typeof action.response === 'function') {
      action.response(data);
    }

    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleAssetSearch(action) {
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
 
  try{
    console.log(action.body)
    const val = action.body.searchString
    if(val.trim() !== ''){
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
      const response = yield call(http.post, '/assets',
                                  {...action.body},
                                  {cancelToken: source.token}
      )
      const {data} = response
      yield put(setSearchAssetAction(data))
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    }
  } catch(error) {
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  } finally {
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}

export function* handleSalaryStructure(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/salary/getAllSalaryStructure',
        {...action.body},
        {cancelToken: source.token},
      );
      const {data} = response;
      yield put(searchSalaryStructureState(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetAssignSearch(action) {
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()

  try{
    const val = action.body.searchString
    if(val.trim() !== ''){
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
      const response = yield call(http.post, '/assets/searchAssign',
                                  {...action.body},
                                  {cancelToken: source.token}
      )
      const {data} = response
      yield put(setSearchAssignListAction(data))
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    }
  } catch(error) {
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  } finally {
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}

export function* handleGetAssignToSearch(action) {
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()

  try{
    const val = action.body.searchString
    // if(val.trim() !== ''){
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
      const response = yield call(http.post, '/assets/assignTo',
                                  {...action.body},
                                  {cancelToken: source.token}
      )
      const {data} = response
      yield put(setSearchAssignToAction(data))
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    // }
  } catch(error) {
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  } finally {
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}
export function* handleGetSearchAlerts(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
 
  try {
    const val = action.body.searchString
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/alerts',
         { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchAlertsListAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

  export function* handleGetSearchDelete(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
   
    try {
      const val = action.body.searchString
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/deletedLogDetails',
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(setSearchDeleteListAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
    }

export function* handleGetRegisterRequest(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/superAdmin/getRegisterRequest',
        {...action.body},
        {cancelToken: source.token},
      );
     const {data} = response;
      yield put(getRegisterRequestState(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetCompanyDetail(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/superAdmin/getCompanyDetails',
        {...action.body},
        {cancelToken: source.token},
      );
      const {data} = response;
      yield put(setCompanyDetailsState(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}




export function* handleGetSearchDepartMentBasedCompany(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.data.searchString;
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/attendance/getDeptBaseEmpFilter',
        {...action.data},
        {cancelToken: source.token},
      );
    const { data } = response;
      yield put(set_search_department_based_employee(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}
export function* handleGetSearchCategoryBasedCompany(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.data.searchString;
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/attendance/getCategoryBaseEmpFilter',
        {...action.data},
        {cancelToken: source.token},
      );
    const { data } = response;
      yield put(set_search_category_based_employee(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchDepartMentBasedCompanyForDepartmentHead(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.data.searchString;
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/departmentHead/getDeptBase/EmpHead',
        {...action.data},
        {cancelToken: source.token},
      );
    const { data } = response;
      yield put(set_search_department_based_employee_for_department_head(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchDepartMent(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString;
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/departmentHead/get/departmentSearch',
        {...action.body},
        {cancelToken: source.token},
      );
    const { data } = response;
      yield put(setSearchDepartmentState(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}




export function* handleGetSearchCompanyBasedAdminManager(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.data.searchString;
    // console.log("action.data.searchString;",action.data)
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/requestConfig/getCompanyBasedAdminManager',
        {...action.data},
        {cancelToken: source.token},
      );

      // console.log("responsess",response)
    const { data } = response;
    // console.log("sdfsdf",data)
    yield put(set_search_company_based_admin_manager(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}
export function* handleGetSearchFaceRegistration(action) {

  // console.log("action",action)
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString;
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/faceRegistration',
        {...action.body},
        {cancelToken: source.token},
      );
    const { data } = response;
    // console.log("data",data)
      yield put(setSearchFaceRegistrationState(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchRequestConfig(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.data.searchString;
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/requestConfig',
        {...action.data},
        {cancelToken: source.token},
      );
    const { data } = response;
      yield put(setSearchRequestConfigState(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchDepartMentHead(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString;
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/departmentHead',
        {...action.body},
        {cancelToken: source.token},
      );
    const { data } = response;
      yield put(setSearchDepartmentHeadState(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchLocationBasedCompany(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.data.searchString;
    console.log("action.data.searchString;",action.data)
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/attendance/getLocationBasedEmployeeFilter',
        {...action.data},
        {cancelToken: source.token},
      );

      console.log("responsess",response)
    const { data } = response;
    console.log("sdfsdf",data)
      yield put(set_search_location_based_employee(data.employees));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchCompanyBasedEmployee(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.data.searchString;
    console.log("action.data.searchString;",action.data)
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/userCreation/getEmpbasecompanyFilter',
        {...action.data},
        {cancelToken: source.token},
      );

      console.log("responsess",response)
    const { data } = response;
    console.log("sdfsdf",data)
      yield put(set_search_company_based_employee(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchAudits(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
 
  try {
    const val = action.body.searchString
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/audits',
         { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSerachAuditAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

  export function* handleworkdurationReport(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    console.log(action,'kkk');
    try {
     
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/attendance/work/duration/reports',
           { ...action.data },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(setWorkdurationReportAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
    }

    export function* handlesearchReportForBank(action) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      console.log(action,'kkk');
      try {
       
          ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          const response = yield call(http.post, '/salary/salaryReportForBank',
             { ...action.body },
            { cancelToken: source.token, }
          );
          const { data } = response;
          yield put(SetSalaryReportForBankAction(data));
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        } catch (error) {
          yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        } finally {
          if (yield cancelled()) {
            yield call(source.cancel);
          }
        }
      }

      export function* handlegetCompanyBasedEmpAction(action) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        console.log(action, 'kkk');
        try {
       
          ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          const response = yield call(http.post, '/attendance/getCompanyBasedEmployee',
            { ...action.body },
            { cancelToken: source.token, }
          );
          const { data } = response;
          yield put(setCompanyBasedEmpAction(data));
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        } catch (error) {
          yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        } finally {
          if (yield cancelled()) {
            yield call(source.cancel);
          }
        }
      }

      export function* handlegetCompanyBasedEmpDetailsAction(action) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        console.log(action, 'kkk');
        try {
       
          ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          const response = yield call(http.post, '/attendance/getCompanyBasedEmployeeDetails',
            { ...action.body },
            { cancelToken: source.token, }
          );
          const { data } = response;
          yield put(setCompanyBasedEmpDetailsAction(data));
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        } catch (error) {
          yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        } finally {
          if (yield cancelled()) {
            yield call(source.cancel);
          }
        }
      }


      export function* handleGetSearchProducts(action) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
       
        try {
          const val = action.body.searchString
            ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
            const response = yield call(http.post, '/grProduct/getGrProduct',
               { ...action.body },
              { cancelToken: source.token, }
            );
            const { data } = response;
            yield put(setSearchProductListAction(data));
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          } catch (error) {
            yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          } finally {
            if (yield cancelled()) {
              yield call(source.cancel);
            }
          }
        }

        export function* handleGetWarrantSearch(action) {
          const CancelToken = axios.CancelToken
          const source = CancelToken.source()
        
          try{
            const val = action.body.searchString
          
              ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
              const response = yield call(http.post, '/assets/warrantyList',
                                          {...action.body},
                                          {cancelToken: source.token}
              )
              const {data} = response
              yield put(setSearchWarrant(data))
              FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
            
          } catch(error) {
            yield put(errorAlertAction({msg: error.message, severity: 'error'}))
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
          } finally {
            if(yield cancelled()){
              yield call(source.cancel)
            }
          }
        }
        export function* handleGetSearchInsurance(action) {
          const CancelToken = axios.CancelToken;
          const source = CancelToken.source();
         
          try {
            const val = action.body.searchString
            
              ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
              const response = yield call(http.post, '/insurance',
                 { ...action.body },
                { cancelToken: source.token, }
              );
              const { data } = response;
              yield put(setSearchInsuranceAction(data));
              FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
            
            } catch (error) {
              yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
              FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
            } finally {
              if (yield cancelled()) {
                yield call(source.cancel);
              }
            }
          }
export function* handleGetSearchDynamicProp(action) {
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  
  try{
    console.log(action.body)
    const val = action.body.searchString
    // if(val.trim() !== ''){
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
      const response =  yield call(http.post, '/assets/getDynamicProp',
                                  {...action.body},
                                  {cancelToken: source.token}
      )
      console.log(response)
      const {data} = response
      yield put(setSearchDynamicPropListAction(data))
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    // }
  } catch(error) {
    console.log(error)
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  } finally {
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}
export function* handleGetSearchAssetGroup(action) {
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  
  try{
    console.log(action.body,'sasdass')
    const val = action.body.searchString
   
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
      const response =  yield call(http.post, '/assets/getAssetGroup',
                                  {...action.body},
                                  {cancelToken: source.token}
      )
      console.log(response)
      const {data} = response
      yield put(setSearchAssetGroupAction(data))
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
   
  } catch(error) {
    console.log(error)
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  } finally {
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}
export function* handleGetSearchAssetType(action) {
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
         
  try{
    console.log(action.body)
    const val = action.body.searchString
    
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
      const response =  yield call(http.post, '/assets/getAssetType',
                                  {...action.body},
                                  {cancelToken: source.token}
      )
      console.log(response)
      const {data} = response
      yield put(setSearchAssetTypeAction(data))
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    
  } catch(error) {
    console.log(error)
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  } finally {
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}

export function* handleGetSearchServiceDue(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
 
  try {
    const val = action.body.searchString
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/serviceDue',
         { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchServiceDueAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

export function* handleGetAllChecklist(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
 
  try {
    const val = action.body.searchString
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/audits/getAllCheckList',
         { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setgetAllCheckListTemplateAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

  export function* handleGetSearchAuditCheckList(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
   
    try {
      const val = action.body.searchString
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/audits/auditCheckList',
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(setAuditCheckListSearchAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
    }
  export function* handleGetFilterTaskDetails(action) {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()
    
    try{
      const val = action.body.searchString
      if(val.trim() !== ''){
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
        const response =  yield call(http.post, '/payrollDashboard/filterTaskDetails',
                                    {...action.body},
                                    {cancelToken: source.token}
        )
        const {data} = response
        yield put(setSearchTaskAction(data))
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
      }
    } catch(error) {
      console.log(error)
      yield put(errorAlertAction({msg: error.message, severity: 'error'}))
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    } finally {
      if(yield cancelled()){
        yield call(source.cancel)
      }
    }
  }

  export function* handleMonthShiftScheduleShiftSearch(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
  
    try {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(shiftsServices.getMonthShiftSchedule,
        { ...action.body }, action.commoncookie,
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchmonthShiftScheduleShift(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

  export function* handleDayShiftSearch(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
  
    try {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(shiftsServices.getDayShift,
        { ...action.body }, action.commoncookie,
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchdayShift(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

  export function* handleGetClaimApprovedDetails(action) {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()
    
    try{
      const val = action.body.searchString
      if(val.trim() !== ''){
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
        const response =  yield call(http.post, '/loan/approvedClaims',
                                    {...action.body},
                                    {cancelToken: source.token}
        )
        const {data} = response
        yield put(setSearchApprovedClaimAction(data))
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
      }
    } catch(error) {
      console.log(error)
      yield put(errorAlertAction({msg: error.message, severity: 'error'}))
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    } finally {
      if(yield cancelled()){
        yield call(source.cancel)
      }
    }
  }

  export function* handleGetLeadsTask(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
   
    try {
      const val = action.body.searchString
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/leadsManagement/leadTask',
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(setSearchLeadsTaskAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
    }

     export function* handleSchemesReceivables(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
   
    try {
      const val = action.body.searchString
      if(val.length >= 3 || val.length === 0) {
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/schemes/schemesReceivables',
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        console.log(data,'datdaaaa')
        yield put(getSchemesReceivablesAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      }
      else{
        yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
      }
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
    }

    export function* handleGetLeadsAccounts(action) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
     
      try {

        console.log('executing')
        const val = action.body.searchString
          ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          const response = yield call(http.post, '/leadsManagement/getLeadsAccounts',
             { ...action.body },
            { cancelToken: source.token, }
          );
          const { data } = response;
          yield put(setLeadsAccountsAction(data));
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        } catch (error) {
          yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        } finally {
          if (yield cancelled()) {
            yield call(source.cancel);
          }
        }
      }

      export function* handleGetAccountContacts(action) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
       
        try {
  
          console.log('executing')
          const val = action.body.searchString
            ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
            const response = yield call(http.post, '/leadsManagement/AccountsContacts',
               { ...action.body },
              { cancelToken: source.token, }
            );
            const { data } = response;
            yield put(setAccountContacts(data));
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          } catch (error) {
            yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          } finally {
            if (yield cancelled()) {
              yield call(source.cancel);
            }
          }
        }

        export function* handleGetTasksStatus(action) {
          const CancelToken = axios.CancelToken;
          const source = CancelToken.source();
         
          try {
    
            console.log('executing')
            const val = action.body.id
            const empId = action.body.empId;
            const endpoint =
              empId && empId !== 'all'
                ? `/payrollDashboard/taskByStatus/${val}/${empId}`
                : `/payrollDashboard/taskByStatus/project/${val}`;
              ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
              const response = yield call(http.post, endpoint,
                 { ...action.body },
                { cancelToken: source.token, }
              );
              const { data } = response;
              yield put(setTaskByStatusAction(data));
              FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
            } catch (error) {
              yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
              FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
            } finally {
              if (yield cancelled()) {
                yield call(source.cancel);
              }
            }
          }
    
          export function* handleGetProjects(action) {
            const CancelToken = axios.CancelToken;
            const source = CancelToken.source();
           
            try {
              const val = action.body.id
                ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
                const response = yield call(http.post, `/payrollDashboard/getProjects`,
                   { ...action.body },
                  { cancelToken: source.token, }
                );
                const { data } = response;
                yield put(setProjectsAction(data));
                FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
              } catch (error) {
                yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
                FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
              } finally {
                if (yield cancelled()) {
                  yield call(source.cancel);
                }
              }
            }
    
          export function* handleGetWorkLog(action) {
            const CancelToken = axios.CancelToken;
            const source = CancelToken.source();
           
            try {
              const val = action.body.id
                ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
                const response = yield call(http.post, `/payrollDashboard/workLogReport`,
                   { ...action.body },
                  { cancelToken: source.token, }
                );
                const { data } = response;
                yield put(setSearchWorkLogAction(data));
                FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
              } catch (error) {
                yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
                FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
              } finally {
                if (yield cancelled()) {
                  yield call(source.cancel);
                }
              }
            }

            export function* handleGetBiometric(action) {
              const CancelToken = axios.CancelToken;
              const source = CancelToken.source();
             
              try {
                const val = action.body.id
                  ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
                  const response = yield call(http.post, `/faceRegistration/getBiometricDetails`,
                     { ...action.body },
                    { cancelToken: source.token, }
                  );
                  const { data } = response;
                  yield put(getBioMetricAction(data));
                  FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
                } catch (error) {
                  yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
                  FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
                } finally {
                  if (yield cancelled()) {
                    yield call(source.cancel);
                  }
                }
              }
      
  export function* handleLeadsSearch(action){
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    try{
      const val = action.body.searchString
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
      const response = yield call(http.post, '/leadManagement', {...action.body}, {cancelToken: source.token})
      const { data } = response
      yield put(setLeadsSearchAction(data))
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    } catch(error){
      yield put(errorAlertAction({msg: error.message, severity: 'error'}))
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    } finally {
      if(yield cancelled()){
        yield call(source.cancel)
      }
    }
  }

  export function* handleGetSearchCalls(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
   
    try {
      const val = action.body.searchString
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/calls',
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(setSearchCallsAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
    }
 
 
    export function* handleGetSearchMeetings(action) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
     
      try {
        const val = action.body.searchString
          ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          const response = yield call(http.post, '/meetings',
             { ...action.body },
            { cancelToken: source.token, }
          );
          const { data } = response;
          yield put(setSearchMeetingsAction(data));
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        } catch (error) {
          yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        } finally {
          if (yield cancelled()) {
            yield call(source.cancel);
          }
        }
      }


      export function* handleGetRelievedEmployeeDetails(action) {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        
        try{
          const val = action.body.searchString
          if(val.trim() !== ''){
            ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
            const response =  yield call(http.post, '/Reports/RelievedEmployeeDetails',
                                        {...action.body},
                                        {cancelToken: source.token}
            )
            const {data} = response
            yield put(setSearchRelievedEmployeeDetails(data))
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
          }
        } catch(error) {
          console.log(error)
          yield put(errorAlertAction({msg: error.message, severity: 'error'}))
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
        } finally {
          if(yield cancelled()){
            yield call(source.cancel)
          }
        }
      }

      export function* handleGetDepartmentList(action) {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        
        try{
          const val = action.body.searchString
            ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
            const response =  yield call(http.post, '/department/listDepartment',
                                        {...action.body},
                                        {cancelToken: source.token}
            )
            const {data} = response
            action.response(response)
            yield put(setSearchDepartmentList(data))
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
          
        } catch(error) {
          console.log(error)
          yield put(errorAlertAction({msg: error.message, severity: 'error'}))
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
        } finally {
          if(yield cancelled()){
            yield call(source.cancel)
          }
        }
      }

      export function* handleCategoryList(action) {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        
        try{
          const val = action.body.searchString
          
            ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
            const response =  yield call(http.post, '/userCreation/employeeCategory',
                                        {...action.body},
                                        {cancelToken: source.token}
            )
            const {data} = response
            yield put(setSearchCategoryList(data))
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
          
        } catch(error) {
          console.log(error)
          yield put(errorAlertAction({msg: error.message, severity: 'error'}))
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
        } finally {
          if(yield cancelled()){
            yield call(source.cancel)
          }
        }
      }

      export function* handleLeadSourceList(action) {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        
        try{
          const val = action.body.searchString
          
            ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
            const response =  yield call(http.post, '/leadManagement/leadSource',
                                        {...action.body},
                                        {cancelToken: source.token}
            )
            const {data} = response
            yield put(setLeadSourceList(data))
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
          
        } catch(error) {
          console.log(error)
          yield put(errorAlertAction({msg: error.message, severity: 'error'}))
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
        } finally {
          if(yield cancelled()){
            yield call(source.cancel)
          }
        }
      }

      export function* handleClaimsCategoryList(action) {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        
        try{
          const val = action.body.searchString
            ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
            const response =  yield call(http.post, '/loan/claimsCategory',
                                        {...action.body},
                                        {cancelToken: source.token}
            )
            const {data} = response
            yield put(setSearchClaimsCategoryList(data))
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
          
        } catch(error) {
          console.log(error)
          yield put(errorAlertAction({msg: error.message, severity: 'error'}))
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
        } finally {
          if(yield cancelled()){
            yield call(source.cancel)
          }
        }
      }

      export function* handleGetSearchPayrollCalender(action) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
       
        try {
          const val = action.body.searchString
            ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
            const response = yield call(http.post, '/calender',
               { ...action.body },
              { cancelToken: source.token, }
            );
            const { data } = response;
            yield put(setSearchPayrollCalenderAction(data));
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          } catch (error) {
            yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          } finally {
            if (yield cancelled()) {
              yield call(source.cancel);
            }
          }
        }

  export function* handleRelievedEmployeeSearch(action){
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()
    try{
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
      const response = yield call(http.post, '/reports/getRelievedEmployeeDetails', 
                                    {...action.body},
                                    {cancelToken: source.token}
      )
      const {data} = response
      yield put(setSearchRelievedEmployeeDetails(data))
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    } catch(error){
      yield put(errorAlertAction({msg: error.message, severity: 'error'}))
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    } finally {
      if(yield cancelled()){
        yield call(source.cancel)
      }
    }
  }

  export function* handleDesignationSearch(action) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
       
        try {
          const val = action.body.searchString
            ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
            const response = yield call(http.post, '/userCreation/designation',
               { ...action.body },
              { cancelToken: source.token, }
            );
            const { data } = response;
            yield put(setSearchDesignation(data));
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          } catch (error) {
            yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          } finally {
            if (yield cancelled()) {
              yield call(source.cancel);
            }
          }
        }

  export function* handleTrainingTypeSearch(action) {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
       
        try {
          const val = action.body.searchString
            ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
            const response = yield call(http.post, '/userCreation/trainingType',
               { ...action.body },
              { cancelToken: source.token, }
            );
            const { data } = response;
            yield put(setSearchTrainingType(data));
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          } catch (error) {
            yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
            FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          } finally {
            if (yield cancelled()) {
              yield call(source.cancel);
            }
          }
        }

        export function* handleGetSearchTermsConditions(action) {
          const CancelToken = axios.CancelToken;
          const source = CancelToken.source();
         
          try {
            const val = action.body.searchString
              ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
              const response = yield call(http.post, '/termsConditions',
                 { ...action.body },
                { cancelToken: source.token, }
              );
              const { data } = response;
              yield put(setSearchTermsConditionsAction(data));
              FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
            } catch (error) {
              yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
              FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
            } finally {
              if (yield cancelled()) {
                yield call(source.cancel);
              }
            }
          }

          
export function* handleQuotationSearch(action){
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  try{
    if(action.body.searchString.length >= 3 || action.body.searchString.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
      const response = yield call(http.post, '/quotation/getQuotations', {...action.body}, {cancelToken: source.token})
      const { data } = response
      yield put(setQuotationSearchAction(data))
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    }
    else {
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }
  }
  catch(error){
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  finally{
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}

export function* handleQuotationConfigSearch(action){
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  try{
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    const response = yield call(http.post, '/leadManagement/quotation/getQuotationConfig', {...action.body}, {cancelToken :source.token})
    const { data } = response
    yield put(setQuotationConfigSearchAction(data))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  catch(error){
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  finally{
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}


export function* handleGetSearchCampaign(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
 
  try {
    const val = action.body.searchString
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/campaign',
         { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchCampaignAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

  export function* handleGetSearchsyncProduct(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    try {
      const val = action.data;
      if(action.body.searchString.length >= 3 || action.body.searchString.length === 0) {
          ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          const response = yield call(http.post, '/product/syncProduct',
             action.body, 
            { cancelToken: source.token,}
          );
          yield put(set_searchsyncProductAction(response));
    
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        }
        else{
          yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
        }
      
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

  export function* handleGetSearchCampaignLeads(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
   
    try {
      const val = action.body.searchString
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, `/campaignLeads/${id}`,
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(setSearchCampaignLeadsAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
    }

export function* handleLeadStatusSearch(action){
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  try{
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    const response = yield call(http.post, '/leadManagement/status', {...action.body}, {cancelToken: source.token})
    const { data } = response
    yield put(setSearchStatusAction(data))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  catch(error){
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  finally{
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}

export function* handleGetSearchDeleteLogs(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
 
  try {
    const val = action.body.searchString
    if(val.trim() !== ''){
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/deletedLogDetails',
         { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchDeleteListAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

export function* handleCompliancesSearch(action){
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  try{
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    const response = yield call(http.post, '/compliances/LOV', {...action.body}, {cancelToken: source.token})
    const { data } = response
    yield put(setCompliancesLOVAction(data))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  catch(error){
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  finally{
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}

export function* handleRenewalSearch(action){
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  try{
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    const response = yield call(http.post, '/renewals', {...action.body}, {cancelToken: source.token})
    const { data } = response
    yield put(setRenewalSearchAction(data))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  catch(error){
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  finally{
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}

export function* handleGetSearchRenewalsLov(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
 
  try {
    const val = action.body.searchString
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/renewals/renewalsLov',
         { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchRenewalsLovAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

export function* handleGetSearchServiceTypeLov(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
 
  try {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/serviceDue/getServiceType',
         { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchServiceTypeLovAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }


  export function* handleGetSearchAlertsEmployeeFilter(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    try {
      const val = action.data.searchString;
      console.log("action.data.searchString;",action.data)
      // if (val.trim() !== '') {
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call( http.post,'/alerts/getAlertsEmployeeFilter',
          {...action.data},
          {cancelToken: source.token},
        );
  
        console.log("responsess",response)
      const { data } = response;
      console.log("sdfsdf",data)
        yield put(setSearchAlertsEmployeeFilterAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      //}
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

  export function* handleGetSearchCostSummaryReport(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    try {
      const val = action.body.searchString
      if(action.body.searchString.length >= 3 || action.body.searchString.length === 0){
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/salary/costSummaryReport',
        {...action.body}, 
        { cancelToken: source.token,}
        );
        const {data} = response;
        yield put(setSearchcostSummaryReportAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      }
      else{
        yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
      }
      
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

  export function* handleGetPaymentCollectionReport(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    try {
      if(action.body.searchString.length >= 3 || action.body.searchString.length === 0){
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/sales/paymentCollection',
        {...action.body}, 
        { cancelToken: source.token,}
        );
        const {data} = response;
        yield put(set_paymentCollectionAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      }
      else{
        yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
      }
      const val = action.body.searchString
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

  export function* handleGetSearchCompliances(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
   
    try {
      const val = action.body.searchString
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/compliances',
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(setSearchCompliancesAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
    }

  export function* handleGetSearchCustomRenewals(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
   
    try {
      const val = action.body.searchString
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/renewals/getAllCustomRenewals',
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(setSearchCustomRenewalsAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
    }

  export function* handleGetSearchScrapAssetReport(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
   
    try {
      const val = action.body.searchString
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/assets/scrapAssetReport',
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(setSearchScrapAssetReportAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
    }

     export function* handleGetSearchRentalAndTenants(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    try {
      const val = action.body.searchString
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/assets/getRentalAndTenants',
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(setRentalAndTenantsAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
    }

    export function* handleGetSearchgeneralContact(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    try {
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/assets/asstGeneralContact',
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(setAsstGeneralContactAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
    }

    export function* handleGetSearchInsuranceLov(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    try {
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/insurance/getInsuranceLov',
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(setSearchInsuranceLovAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
    }

    export function* handleGetSearchProfitWiseReport(action) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
     
      try {
        // console.log("actionaction",action);
        
        const val = action.data.searchString
        if(val.length >=3 || val.length ===0) {
          ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
          const response = yield call(http.post, '/sales/reports/profitWiseReport',
             { ...action.data },
            { cancelToken: source.token, }
          );
          const { data } = response;
          // console.log("dataffd",data);
          
          yield put(set_searchProfitWiseReportAction(data));
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        }
        else{
        yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
        }
        } catch (error) {
          yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
          FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        } finally {
          if (yield cancelled()) {
            yield call(source.cancel);
          }
        }
      }

export function* handleGetSearchGst1Report(action){
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  try{
    if(action.body.searchString.length >= 3 || action.body.searchString.length === 0) {

      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
      const response = yield call(http.post, '/tax/GST1Report', {...action.body}, {cancelToken: source.token})
      const { data } = response
      yield put(setSearchGst1ReportAction(data))
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    }
    else {
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }
  }
  catch(error){
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  finally{
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}

export function* handleGetSearchForm27EQReport(action){
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  try{
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    const response = yield call(http.post, '/tax/form27EQReport', {...action.body}, {cancelToken: source.token})
    const { data } = response
    yield put(setSearchForm27EQReportAction(data))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  catch(error){
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  finally{
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}

export function* handleGetSearchGst2Report(action){
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  try{
    if(action.body.searchString.length >= 3 || action.body.searchString.length === 0) {
      const response = yield call(http.post, '/tax/GST2Report', {...action.body}, {cancelToken: source.token})
      const { data } = response
      yield put(setSearchGst2ReportAction(data))
    } else {
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }
  }
  catch(error){
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
  }
  finally{
    if(yield cancelled()){ yield call(source.cancel) }
  }
}

export function* handleGetSearchGstReport(action){
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  try{
    if(action.body.searchString.length >= 3 || action.body.searchString.length === 0) {
      const response = yield call(http.post, '/tax/GSTReport', {...action.body}, {cancelToken: source.token})
      const { data } = response
      yield put(setSearchGstReportAction(data))
    } else {
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }
  }
  catch(error){
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
  }
  finally{
    if(yield cancelled()){ yield call(source.cancel) }
  }
}

export function* handleGetSearchGstRateReport(action){
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  try{
    if(action.body.searchString.length >= 3 || action.body.searchString.length === 0) {
      const response = yield call(http.post, '/tax/GSTRateReport', {...action.body}, {cancelToken: source.token})
      const { data } = response
      yield put(setSearchGstRateReportAction(data))
    } else {
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }
  }
  catch(error){
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
  }
  finally{
    if(yield cancelled()){ yield call(source.cancel) }
  }
}

export function* handleGetSearchTcsReceivable(action){
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  try{
    if(action.body.searchString.length >= 3 || action.body.searchString.length === 0) {
      const response = yield call(http.post, '/tax/TCSReceivable', {...action.body}, {cancelToken: source.token})
      const { data } = response
      yield put(setSearchTcsReceivableAction(data))
    } else {
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }
  }
  catch(error){
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
  }
  finally{
    if(yield cancelled()){ yield call(source.cancel) }
  }
}

export function* handleGetSearchUnitsLov(action){
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  try{
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    const response = yield call(http.post, '/termsConditions/unitsLov', {...action.body}, {cancelToken: source.token})
    const { data } = response
    yield put(setSearchUnitsLovAction(data))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  catch(error){
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  finally{
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}


export function* handleGetSearchCreditDaysLov(action){
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  try{
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    const response = yield call(http.post, '/termsConditions/creditDaysLov', {...action.body}, {cancelToken: source.token})
    const { data } = response
    yield put(setCreditDaysLovSearchAction(data))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  catch(error){
    yield put(errorAlertAction({msg: error.message, severity: 'error'}))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  finally{
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}

export function* handleGetSearchPreOrderReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    const response = yield call(http.post, '/preOrders/getAllCancelledPreOrders',
      { ...action.body },
      { cancelToken: source.token, }
    );
    const { data } = response;
    yield put(setSearchPreOrderReportAction(data));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchPreOrder(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    const val = action.body.searchString
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    const response = yield call(http.post, '/preOrders',
      { ...action.body },
      { cancelToken: source.token, }
    );
    const { data } = response;
    yield put(setSearchPreOrderAction(data));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSalesmanCollection(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    if(action.body.payload.searchString.length >= 3 || action.body.payload.searchString.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, `/salesMan/collections/${action.body.location_id}`,
        { ...action.body.payload },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchSalesmanCollectionAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else {
      yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleCustomerInvoice(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
 
  try {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/customer/customerInvoice',
         { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setCustomerInvoiceAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

export function* handleCustomerPayment(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
 
  try {

      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/customer/customerPayment',
         { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setCustomerpaymentAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

export function* handleCustomerDeliveryChallan(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
   
    try {
  
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/customer/customerDeliverChallan',
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(setCustomerDeliveryChallan(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
  }

export function* handleCustomerQuotes(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    console.log('searchHandlesrWorkinggggg')
    try {
  
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/customer/customerQuotes',
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(setCustomerQuotesAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
  }

export function* handleCustomerCreditnote(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    console.log('searchHandlesrWorkinggggg')
    try {
  
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/customer/customerCreditNote',
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(setCustomerCreditNoteAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
  }

export function* handleProductSearchByLotNumber(action){
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  try{
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    const response = yield call(http.post, '/sales/getLotsDetails', { ...action.body }, { cancelToken: source.token })
    const { data } = response
    const lotDetails = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
    if (typeof action.response === 'function') {
      action.response(lotDetails)
    }
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  catch(error){
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  finally{
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}

export function* handlesearchSalesManListAction(action){
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  try{
    if(action.data.searchString.length >= 3 || action.data.searchString.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
      const response = yield call(http.post, '/fuelAllowance/searchSalesManList', { ...action.body }, { cancelToken: source.token })
      const { data } = response
      action.response(data)
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
    }
    else {
       yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }
  }
  catch(error){
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }))
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler)
  }
  finally{
    if(yield cancelled()){
      yield call(source.cancel)
    }
  }
}

export function* handlesearchUserModules(action) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    console.log('searchHandlesrWorkinggggg')
    try {
  
        ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
        const response = yield call(http.post, '/role/getModulesForAllRoles',
           { ...action.body },
          { cancelToken: source.token, }
        );
        const { data } = response;
        yield put(set_searchUserModulesAction(data));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } catch (error) {
        yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
        FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      } finally {
        if (yield cancelled()) {
          yield call(source.cancel);
        }
      }
  }

  export function* handleGetSearchManualMatch(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
 
  try {
    const val = action.body.searchString
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/bankCreation/manualMatchRecords',
         { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchManualMatchAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } catch (error) {
      yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    } finally {
      if (yield cancelled()) {
        yield call(source.cancel);
      }
    }
  }

export function* handleSearchCollectedDefects(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    const val = action.body.searchString
    if(val.length >= 3 || val.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, `/defects/getCollection/${action.employee_id}/${action.location_id}`,
        { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchCollectedDefectsAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else{
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}
  export function* handleGetSearchAttendanceLogReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/attendance/AttendanceLogReport',
        {...action.body},
        {cancelToken: source.token},
      );
    const { data } = response;
      yield put(setSearchAttendanceLogReportAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}
export function* handleGetOrgChart(action){
    const BASE = ROUTE_PREFIXES.orgStructure;
   const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try{
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
     const response = yield call( http.post,`${BASE}/orgChart`,
      {...action.body},
        {cancelToken: source.token},
      );
       const { data } = response;
      yield put(setSearchOrgChartAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  }catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleSearchReplacements(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  try {
    const val = action.body.searchString
    if(val.length >= 3 || val.length === 0) {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, `/defects/getReplacement/${action.employee_id}/${action.location_id}`,
        { ...action.body },
        { cancelToken: source.token, }
      );
      const { data } = response;
      yield put(setSearchReplacementAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    }
    else{
      yield put(OpenalertActions({ msg: searchErrorMessage, severity: 'warning' }))
    }
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

  export function* handleGetSearchDeviceRegisterReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/reports/DeviceRegisterReport',
        {...action.body},
        {cancelToken: source.token},
      );
    const { data } = response;
      yield put(getDeviceRegisterReportAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

  export function* handleGetSearchFraudLogsReport(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/reports/fraudLogs',
        {...action.body},
        {cancelToken: source.token},
      );
    const { data } = response;
      yield put(getfraudLogsAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchLoginAuditLogs(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    const response = yield call(http.post, '/loginAudit',
      {...action.body},
      {cancelToken: source.token},
    );
    const { data } = response;
    yield put(getLoginAuditLogsAction(data));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleScrapLotSearch(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    const response = yield call(http.post, '/reports/scrapLot',
      { ...action.body },
      { cancelToken: source.token },
    );
    const { data } = response;
    yield put(setSearchScrapLotsAction(data));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}
  export function* handleSearchSalaryTemplate(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    // if (val.trim() !== '') {
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call( http.post,'/salary/getAllSalaryTemplate',
        {...action.body},
        {cancelToken: source.token},
      );
    const { data } = response;
      yield put(setSearchSalaryTemplateAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
    //}
  } catch (error) {
    yield put(errorAlertAction({ msg: error.message, severity: 'error' }));
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchByCustomer(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    if(val.length >= 3 || val.length === 0){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/customer/getCustomers',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(setSearchByCustomersDataAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    }
    else {
      yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }
  } catch (error) {
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchByCustomerSalesman(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    if(val.length >= 3 || val.length === 0){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, '/customer/getSearchBySalesmanCustomers',
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(setSearchByCustomersDataAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    }
    else {
      yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }
  } catch (error) {
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchByCustomerSupplier(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    if(val.length >= 3 || val.length === 0){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, `/customer/getCustomerSupplier/${action.types}`,
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(setSearchByCustomerSupplierDataAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    }
    else {
      yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }
  } catch (error) {
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}

export function* handleGetSearchByVendor(action) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  
 
  try {

    const val = action.body.searchString
    if(val.length >= 3 || val.length === 0){
      
      ListLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      const response = yield call(http.post, `/supplier/getSuppliers`,
      {...action.body}, 
      { cancelToken: source.token,}
      );
      const {data} = response;
      yield put(setSearchByVendorDataAction(data));
      FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
      
    }
    else {
      yield put(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }
  } catch (error) {
    FailLoad(action.setModalTypeHandler, action.setLoaderStatusHandler);
  } finally {
    if (yield cancelled()) {
      yield call(source.cancel);
    }
  }
}
