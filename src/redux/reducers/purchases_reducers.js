import {
  CREATE_PURCHASES,
  LIST_PURCHASES,
  GET_ID_PURCHASES,
  EDIT_PURCHASES,
  DELETE_PURCHASES,
  RECEIVED_PURCHASES,
  ENTRY_PURCHASES,
  LIST_POTCODE,
  CONSOLIDATED_PURCHASES,
  LIST_PURCHASES_FILTER,
  LIST_PURCHASE_REPORT,
  PAGINATED_PURCHASE_REPORT,
  LIST_AGEWISE_PAYABLES,
  COMPARE_PURCHASE,
  PURCHASE_RECEIVABLE,
  GET_PURCHASE_REPORT,
  TOTAL_PURCHASE_REPORT_COUNT,
  FILTER_PURCHASE_REPORT,
  PRINT_LABEL,
  LIST_PURCHASES_PAGINATION,
  SET_SEARCH_PURCHASE,
  SET_SEARCH_PURCHASE_REPORT,
  SET_SEARCH_PAYABLE_REPORT,
  PURCHASE_DAILY_REPORT,
  COMPLETED_RECEIVED_PURCHASES,
  PURCHASE_ADVANCE_ENTRY,
  STOCK_UPLOAD_LIST,
  SET_SEARCH_RECEIVED_PURCHASES,
  BARCODE_QR_SEQUENCE,
  PURCHASE_ORDER_BY_VENDOR,
  TDS_TAX_RATE,
  GET_PRODUCT_PURCHSE_HISTORY,
  GET_ALL_PAYMENTS,
  GET_PAYMENTS_BY_ID,
  BILLS_MODAL,
  PO_MODEL,
  RESET_LIST_PURCHASES_PAGINATION,
  GET_VENDOR_PURCHASES_AMOUNT,
  PURCHASE_SUMMARY,
  SUPPLIER_TIMELINE_DATA
} from "../actionTypes";

const initialState = {
  purchases: [],
  purchases_id_data: {},
  purchase_outstanding: [],
  purchase_outstanding_count: 0,
  completed_purchase_outstanding: [],
  pot_code_seq: [],
  consolidated_data: [],
  purchases_filter: [],
  purchase_count: 0,
  comparepurchase: [],
  purchasereceivable:[],
  get_agewise:[],
  purchase_report: [],
  purchase_report_count: [],
  print_label:[],
  purchasesByPagination : [],
  purchasesByPaginationCount:0,
  purchasesByPaginationCount1:0,
  searchPurchaseData:[],
  searchPurchaseCount: 0,
  searchPurchaseReportData:[],
  searchPayableReport:[],
  searchPayableReportCount:0,
  purchase_daily_report: [],
  searchPurchaseReportCount: 0,
  advance_entry:[],
  stockUploadList:{},
  setPurchase:[],
  barCodeQrSeq: [],
  purchaseOrderByVendor: [],
  vendorPayments: [],
  tds_taxrate:[],
  getProductPurchaseHistory:[],
  getAllPayments: [],
  paymentsById: [],
  purchaseBills: [],
  billsModel: false,
  poModel: false,
  vendorTotalCount: {
    vendorPayments: 0,
    purchaseOrder: 0,
    bills: 0
  },
  getVendorPurchasesAmount: [],
  getPurchaseSummary : [],
  supplierTimelineData : []
}

function purchasesReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case CREATE_PURCHASES:
      return { ...state, purchases: payload };

    case LIST_PURCHASES:
      return { ...state, purchases: payload };

    case CONSOLIDATED_PURCHASES:
      return { ...state, consolidated_data: payload };

    case ENTRY_PURCHASES:
      return { ...state, purchases: payload };

    case GET_ID_PURCHASES:
      return { ...state, purchases_id_data: payload };
    //return payload

    case EDIT_PURCHASES:
      return { ...state, purchases: payload };

    case DELETE_PURCHASES:
      //return {...state.purchases.filter(({ id }) => id !== payload.id)};
      return { ...state, purchases: payload };

    case RECEIVED_PURCHASES:
      return { 
        ...state, 
        purchase_outstanding: payload.data,
        purchase_outstanding_count: payload.numRows 
      };

    case COMPLETED_RECEIVED_PURCHASES:
        return { ...state, completed_purchase_outstanding: payload.data,
          purchasesByPaginationCount1 : payload.numRows};
    case PURCHASE_ADVANCE_ENTRY :
         return{ ...state, advance_entry : payload}
    case LIST_POTCODE:
      return { ...state, pot_code_seq: payload };

    case LIST_PURCHASES_FILTER:
      return { ...state, purchases_filter: payload };

    case LIST_PURCHASE_REPORT:
      return { ...state, purchases: payload };

    case PAGINATED_PURCHASE_REPORT:
      return { ...state, purchase_count: payload };

      case COMPARE_PURCHASE:
      return { ...state, comparepurchase: payload };

      case LIST_AGEWISE_PAYABLES:
        return { ...state, get_agewise: payload };

      case PURCHASE_RECEIVABLE:
        return { ...state, purchasereceivable: payload };  
    
      case GET_PURCHASE_REPORT:
        return { ...state, purchase_report: payload };  

      case TOTAL_PURCHASE_REPORT_COUNT:
        return { ...state, purchase_report_count: payload };
      
      case FILTER_PURCHASE_REPORT:
        return { ...state, purchases: payload };

      case PRINT_LABEL:
        return {...state,print_label:payload}

      case PURCHASE_DAILY_REPORT :
         return {...state, purchase_daily_report : payload}

      case LIST_PURCHASES_PAGINATION:
          return {
            ...state,
            purchasesByPagination:payload.data, 
            purchasesByPaginationCount:payload.numRows
          }
      case RESET_LIST_PURCHASES_PAGINATION:
          return {
            ...state,
            purchasesByPagination:payload.data, 
            purchasesByPaginationCount:payload.numRows
          }

      case SET_SEARCH_PURCHASE:
      return {
        ...state,
        searchPurchaseData:payload.data, 
        searchPurchaseCount:payload.numRows
      }
    
      case SET_SEARCH_PURCHASE_REPORT:
        return { ...state, searchPurchaseReportData: payload.data,
          searchPurchaseReportCount:payload.numRows
        };


        case SET_SEARCH_PAYABLE_REPORT:
          return {
           ...state,
           searchPayableReport:payload.data, 
           searchPayableReportCount:payload.numRows
                    }

                    case STOCK_UPLOAD_LIST :
                      return {...state, stockUploadList : payload}

        case SET_SEARCH_RECEIVED_PURCHASES:
          return { ...state, setPurchase: payload };
        
        case BARCODE_QR_SEQUENCE:
          return {...state, barCodeQrSeq: payload}

        case PURCHASE_ORDER_BY_VENDOR: {
            const {
              vendorPayments = [],
              purchaseOrder = [],
              purchases = [],
              totalCount = {}
            } = payload;

            const vendorPaymentsCount = totalCount?.vendorPayments?.[0]?.total_count || 0;
            const purchaseOrderCount = totalCount?.purchaseOrder?.[0]?.total_count || 0;
            const billsCount = totalCount?.bills?.[0]?.total_count || 0;

            return {
              ...state,
              purchaseOrderByVendor: purchaseOrder,
              vendorPayments,
              purchaseBills: purchases,
              vendorTotalCount: {
                vendorPayments: vendorPaymentsCount,
                purchaseOrder: purchaseOrderCount,
                bills: billsCount
              }
            };
      }

      case TDS_TAX_RATE :
       return {...state, tds_taxrate : payload}

      case GET_PRODUCT_PURCHSE_HISTORY :
       return {...state, getProductPurchaseHistory : payload}

      case GET_ALL_PAYMENTS:
        return { ...state, getAllPayments: payload }

      case GET_PAYMENTS_BY_ID:
        return { ...state, paymentsById: payload }
        
      case BILLS_MODAL:
       return { ...state, billsModel: action.payload }
       
      case PO_MODEL:
       return { ...state, poModel: action.payload };
       
      case GET_VENDOR_PURCHASES_AMOUNT:
        return { ...state, getVendorPurchasesAmount: payload } 
       
      case PURCHASE_SUMMARY:
        return { ...state, getPurchaseSummary: payload } 

      case SUPPLIER_TIMELINE_DATA:
        return { ...state, supplierTimelineData: payload } 
        
      default:
        return state;
  }
};

export default purchasesReducer;