import {
  CREATE_SALES,
  LIST_SALES,
  GET_ID_SALES,
  EDIT_SALES,
  DELETE_SALES,
  SALES_TABLE_DATA,
  RECEIVED_SALES,
  SET_COMPLETED_RECEIVED_SALES,
  RECEIVED_EDIT_SALES,
  LIST_OUTSTANDING_SALES,
  LIST_SALES_DATE_FILTER,
  LIST_AVERAGE_DEBITOR,
  DAY_SALES,
  CONSOLIDATED_SALES,
  ERP_SALE_DETAILS,
  CREDIT_DEBIT_SEQ,
  SALES_DAILY_REPORT,
  LIST_ALL_FILTER_DATA,
  SALESREPORT_BY_PAGINATION,
  TOTAL_SALESREPORT_COUNT,
  SALES_RECEIVABLE_REPORT,
  TOTAL_RECEIVABLE_REPORT_COUNT,
  SALESREPORT_BY_GETALL,
  STOCKGROUP_BY_GETALL,
  GET_SALES_STATUS_LIST,
  SET_SEARCH_SALES,
  LIST_SALES_PAGINATION,
  SET_SEARCH_OUTSTAND,
  SET_SEARCH_CONSOLIDATED,
  SET_SEARCH_SALES_REPORT,
  SET_SEARCH_RECEIVABLE_REPORT,
  GET_ADMIN_ID,
  SALES_ID_GET,
  SALES_ADVANCE_ENTRY,
  SET_SEARCH_SALES_REPORT_NORMAL,
  CREATE_REQUEST_DISCOUNT,
  COLLECTIONREPORTBASEDEMP,
  TRIAL_BALANCE_REPORT,
  SET_PROFIT_WISE_REPORT,
  PAYMENT_REPORT_BASED_EMP_VERIFY,
  INCOME_BASED_ON_CUSTOMER,
  SALE_ORDER_DELIVERY_CHALLAN_BY_CUSTOMER,
  SALES_APPROVALS,
  SALES_APPROVALS_BY_ID,
  REJECT_SALES_APPROVALS,
  CREATE_SALES_APPROVALS,
  SALESMAN_LIST,
  APPROVAL_USER_RIGHTS,
  SALES_GET_ID,
  SCHEDULE_REPORT,
  GET_ALL_RECEIPTS,
  GET_RECEIPTS_BY_ID,
  LIST_SALES_DATA,
  LOT_DETAILS,
  GET_ALL_PRODUCT_SALES_HISTORY,
  SHARE_REPORT,
  LIST_SALE_ORDER_PAGINATION,
  SET_SEARCH_SALE_ORDER,
  CUSTOMER_SALESMAN,
  TRIGGER_SALES_MODAL,
  TRIGGER_DC_MODAL,
  RESET_INCOME_BASED_ON_CUSTOMER,
  RESET_SALE_ORDER_DELIVERY_CHALLAN_BY_CUSTOMER,
  RESET_LIST_SALES_PAGINATION,
  RESET_LIST_SALE_ORDER_PAGINATION,
  RECEIPT_EDIT_DATA,
  RECEIPT_TIMELINE,
  LIST_DC_PAGINATION,
  RESET_LIST_DC_PAGINATION,
  SET_SEARCH_DC,
  THERMAL_PRINTER,
  RECEIPT_BY_CHEQUE,
  CHEQUE_ALREADY_EXIST,
  SALES_SUMMARY,
  GET_BILLING_COMPANY,
  INDIVIDUAL_PAYMENT_DETAILS
} from '../actionTypes';

const initialState = {
  sales: [],
  sales_id_data: [],
  sales_table_data: [],
  sale_outstanding: [],
  sale_outstanding_count : 0,
  completed_sale_outstanding : [],
  list_outstanding: [],
  day_sales: [],
  list_sale_filter_date: [],
  list_debitor: [],
  consolidated_data: [],
  erp_sale_data: [],
  credit_debit_seq: {},
  sales_daily_report: [],
  sales_filter_all_data: [],
  sales_report_data : [],
  sales_report_count : 0,
  receivable_report: [],
  receivable_report_count: [],
  sales_getall_data : [],
  stockgroup_data : [],
  Sale_Status : [],
  salesByPagination : [],
  salesData : [],
  salesByPaginationCount:0,
  searchSalesData:[],
  searchSalesCount: 0,
  searchOutstandData : [],
  searchConsolitData: [],
  searchSalesReportData: [],
  searchSalesReportCount: 0,
  searchReceivableReport:[],
  searchReceivableReportCount: 0,
  getAdminId:[],
  sale_id_get : [],
  completed_count: 0,
  advance_entry:[],
  searchSalesReportDataNormal: [],
  searchSalesReportCountNormal: 0,
  collectionReport: [],
  trialBalanceReport:[],
  profitWiseReport: [],
  profitWiseReportCount: 0,
  paymentReportBasedEmpVerify:[],
  currentMonthProfit: 0,
  currentFinancialYearProfit: 0,
  highestProductProfit: 0,
  lowestProductProfit: 0,
  highestCategoryProfit: 0,
  lowestCategoryProfit: 0,
  incomeBasedOnCustomer:[],
  saleOrderByCustomer: [],
  salesInvoiceByCustomer:[],
  deliveryChallanByCustomer: [],
  customerPayments: [],
  salesApprovals : [],
  salesApprovalsById : [],
  rejectSalesApprovals : [],
  SalesApprovalsUnseenCount : [],
  createSalesApprovals : [],
  getSalesManList : [],
  getApprovalRights : [],
  salesgetbyid : [],
  scheduleReport : [],
  shareReport : [],
  receiptEntryData: [],
  getAllReceipts : [],
  getReceiptsById : [],
  lotDetails:[],
  showSalesModal: false,
 showDcsModal: false,
  getAllProductSalesHistory:[],
  saleOrderByPagination:[],
 saleOrderByPaginationCount : 0,
 searchSaleOrderCount:0,
 searchSaleOrderData:[],
 customer_salesman : [],
 totalCount: [],
  editReceiptData: {},
  receipt_timeline : [],
 dcByPagination:[],
 dcByPaginationCount : 0, 
 searchDcCount:0,
  searchDcData: [],
 thermal_printer: [],
 SalesApprovalsTotalCount: [],
 chequeAlreadyExist: {},
 getSalesSummary: [],
 getbillingcompanydetails : [],
 individualPaymentDetails:[]
};

function salesReducer(state = initialState, action) {
  const { type, payload } = action;
  
  switch (type) {
    case CREATE_SALES:
      return {...state, sales: payload};

    case LIST_SALES:
      return {...state, sales: payload};
    case LOT_DETAILS:
      return {...state, lotDetails: payload};
    case GET_ID_SALES:
      return {...state, sales_id_data: payload};
    //return payload

    case EDIT_SALES:
      return {...state, sales_filter_all_data: payload};

    case DELETE_SALES:
      //return {...state.sales.filter(({ id }) => id !== payload.id)};
      return {...state, sales_filter_all_data: payload};

    case SALES_TABLE_DATA:
      return {...state, sales_table_data: payload};

    case RECEIVED_SALES:
      return {
        ...state, 
        sale_outstanding: payload.data,
        sale_outstanding_count: payload.numRows || 0,
        sharedData: payload.sharedData || [],
      };

    case SET_COMPLETED_RECEIVED_SALES:
        return {...state, completed_sale_outstanding: payload.data,
        completed_count : payload.numRows};

    case CONSOLIDATED_SALES:
      return {...state, consolidated_data: payload};

    case COLLECTIONREPORTBASEDEMP:
      return {...state, collectionReport: payload};

    case RECEIVED_EDIT_SALES:
      return {
        ...state, 
        sale_outstanding: payload.data,
        sale_outstanding_count: payload.numRows
      };

    //Outstanding mailer List
    case LIST_OUTSTANDING_SALES:
      return {...state, list_outstanding: payload};

    case LIST_SALES_DATE_FILTER:
      return {...state, list_sale_filter_date: payload};

    case SALES_ID_GET :
      return {...state, sale_id_get: payload}

    //average debitor

    case LIST_AVERAGE_DEBITOR:
      return {...state, list_debitor: payload};

    case DAY_SALES:
      return {...state, day_sales: payload};
    case ERP_SALE_DETAILS:
      return {...state, erp_sale_data: payload};

    case CREDIT_DEBIT_SEQ:
      return {...state, credit_debit_seq: payload};

    case SALES_DAILY_REPORT:
      return {...state, sales_daily_report: payload};

    case LIST_ALL_FILTER_DATA:
      return {...state, sales_filter_all_data: payload};
      
      case   SALESREPORT_BY_PAGINATION:
        return {...state, sales_report_data:payload};

        case  TOTAL_SALESREPORT_COUNT :
          return {...state, sales_report_count:payload};
          
    case SALES_RECEIVABLE_REPORT:
      return {...state, receivable_report: payload};

    case TOTAL_RECEIVABLE_REPORT_COUNT:
      return {...state, receivable_report_count: payload};

      case SALESREPORT_BY_GETALL:
        return {...state, sales_getall_data: payload};  

        case STOCKGROUP_BY_GETALL:
          return {...state, stockgroup_data: payload};  
        
    case GET_SALES_STATUS_LIST:
      return {...state, Sale_Status: payload};

    case LIST_SALES_PAGINATION: 
      return {
        ...state,
        salesByPagination:payload.data, 
        salesByPaginationCount:payload.numRows
      }
    case LIST_SALE_ORDER_PAGINATION: 
      return {
        ...state,
        saleOrderByPagination:payload.data, 
        saleOrderByPaginationCount:payload.numRows
      }

       case LIST_DC_PAGINATION: 
      return {
        ...state,
        dcByPagination:payload.data, 
        dcByPaginationCount:payload.numRows
      }

       case RESET_LIST_DC_PAGINATION: 
      return {
        ...state,
        dcByPagination:payload.data, 
        dcByPaginationCount:payload.numRows
      }

      case SET_SEARCH_DC:
      return {
        ...state,
        searchDcData:payload.data, 
        searchDcCount:payload.numRows
      }

       case RESET_LIST_SALES_PAGINATION: 
      return {
        ...state,
        salesByPagination:payload.data, 
        salesByPaginationCount:payload.numRows
      }
    case RESET_LIST_SALE_ORDER_PAGINATION: 
      return {
        ...state,
        saleOrderByPagination:payload.data, 
        saleOrderByPaginationCount:payload.numRows
      }

    case LIST_SALES_DATA: 
      return {
        ...state,
        salesData:payload.data, 
      }

    case SET_SEARCH_SALES:
      return {
        ...state,
        searchSalesData:payload.data, 
        searchSalesCount:payload.numRows
      }

      case SET_SEARCH_SALE_ORDER:
      return {
        ...state,
        searchSaleOrderData:payload.data, 
        searchSaleOrderCount:payload.numRows
      }

      case SET_SEARCH_OUTSTAND:
        return {
          ...state,
          searchOutstandData:payload.data
        }

        case SET_SEARCH_CONSOLIDATED:
          return {
            ...state,
            searchConsolitData:payload.data
      }
    
    case SET_SEARCH_SALES_REPORT:
      return {
        ...state,
        searchSalesReportData:payload.data, 
        searchSalesReportCount:payload.numRows
      }

    case SET_SEARCH_SALES_REPORT_NORMAL:
      return {
        ...state,
        searchSalesReportData:payload.data, 
        searchSalesReportCount:payload.numRows,
        searchSalesReportShare:payload.shareData
      }

    case SET_SEARCH_RECEIVABLE_REPORT:
      return {
        ...state,
        searchReceivableReport:payload.data, 
        searchReceivableReportCount:payload.numRows,
      }
      case GET_ADMIN_ID:
        return {...state, getAdminId: payload};

       case SALES_ADVANCE_ENTRY :
         return{ ...state, advance_entry : payload}

         case TRIAL_BALANCE_REPORT :
         return{ ...state, trialBalanceReport : payload}

         case SET_PROFIT_WISE_REPORT :
         return{ 
          ...state, 
          profitWiseReport : payload.data, 
          profitWiseReportCount : payload.numRows, 
          currentMonthProfit: payload.currentMonthProfit, 
          currentFinancialYearProfit: payload.currentFinancialYearProfit,
          highestProductProfit: payload.highestProductProfit,
          lowestProductProfit: payload.lowestProductProfit,
          highestCategoryProfit: payload.highestCategoryProfit,
          lowestCategoryProfit: payload.lowestCategoryProfit
        }

         case PAYMENT_REPORT_BASED_EMP_VERIFY :
         return{ ...state, paymentReportBasedEmpVerify : payload}

         case INCOME_BASED_ON_CUSTOMER :
          return{ ...state, incomeBasedOnCustomer : payload}
          
          case RESET_INCOME_BASED_ON_CUSTOMER:
          return{ ...state, incomeBasedOnCustomer : payload}
    case SALE_ORDER_DELIVERY_CHALLAN_BY_CUSTOMER:
      return { 
        ...state, 
        saleOrderByCustomer: payload.saleOrder, 
        deliveryChallanByCustomer: payload.deliveryChallan,
        customerPayments: payload.customerPayments,
        receiptEntryData: payload.receiptEntry,
        salesInvoiceByCustomer: payload.salesInvoice,
        totalCount: {
          invoice: payload.salesInvoiceCount?.[0]?.saleInvoiceCount || 0,
          customerReceipts: payload.customerReceiptCount?.[0]?.total_receipts || 0,
          deliveryChallan: payload.deliveryChallanCount?.[0]?.total_delivery_challans || 0,
          saleOrder: payload.saleOrderCount?.[0]?.total_sale_orders || 0
        }
        }

         case RESET_SALE_ORDER_DELIVERY_CHALLAN_BY_CUSTOMER:
      return { 
        ...state, 
        saleOrderByCustomer: payload, 
        deliveryChallanByCustomer: payload,
        customerPayments: payload,
        receiptEntryData: payload,
        salesInvoiceByCustomer: payload,
        totalCount: {
          invoice: 0,
          customerReceipts:  0,
          deliveryChallan:  0,
          saleOrder: 0
        }
        }

      case SALES_APPROVALS :
        return{ ...state, salesApprovals : payload.data,SalesApprovalsUnseenCount: payload.unseenCount,quotationApprovalsTotalCount: payload.totalCount,SalesApprovalsTotalCount: payload.totalCount}

      case SALES_APPROVALS_BY_ID :
        return{ ...state, salesApprovalsById : payload}

      case REJECT_SALES_APPROVALS :
        return{ ...state, rejectSalesApprovals : payload}

      case CREATE_SALES_APPROVALS :
        return{ ...state, createSalesApprovals : payload}

      case SALESMAN_LIST :
        return{ ...state, getSalesManList : payload}

      case APPROVAL_USER_RIGHTS :
        return{ ...state, getApprovalRights : payload}

      case SALES_GET_ID : 
        return {...state, salesgetbyid : payload}

      case SCHEDULE_REPORT : 
        return {...state, scheduleReport : payload}

      case SHARE_REPORT : 
        return {...state, shareReport : payload}
      
      case GET_ALL_RECEIPTS :
        return {...state, getAllReceipts : payload}

      case GET_RECEIPTS_BY_ID :
        return {...state, getReceiptsById : payload.data}
        
      case GET_ALL_PRODUCT_SALES_HISTORY :
      return { ...state, getAllProductSalesHistory: payload }
    
     case TRIGGER_SALES_MODAL:
      return {
        ...state,
        showSalesModal: action.payload,
      };
    
       case TRIGGER_DC_MODAL:
      return {
        ...state,
        showDcsModal: action.payload,
      };

      case CUSTOMER_SALESMAN :
        return {...state, customer_salesman : payload}

      case RECEIPT_EDIT_DATA:
      return { ...state, editReceiptData: payload }
    
    case THERMAL_PRINTER :
        return {...state, thermal_printer : payload}

      case RECEIPT_TIMELINE:
        return {...state,receipt_timeline : payload}

      case RECEIPT_BY_CHEQUE:
        return { ...state,  receiptByCheque: payload }

    case CHEQUE_ALREADY_EXIST:
      return { ...state, chequeAlreadyExist: payload }

    case SALES_SUMMARY:
      return { ...state, getSalesSummary: payload }

    case GET_BILLING_COMPANY:
      return { ...state, getbillingcompanydetails: payload }

    case INDIVIDUAL_PAYMENT_DETAILS:
      return { ...state, individualPaymentDetails: payload }

    default:
      return state;
  }
}

export default salesReducer;
