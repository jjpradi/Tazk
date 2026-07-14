import {
  LIST_POS_SALE,
  TOTAL_POSSALE_COUNT,
  GET_POS_SALE_REPORT,
  GET_POS_SALE_GRANDTOTAL,
  POS_SALE_BY_PAGINATION,
  TOTAL_SALE_BY_LOCATION,
  TOP_SALE_BY_BRAND,
  SALE_COMPARISON,
  TOTAL_SALE_BY_MONTH,
  TOTAL_SALE_BY_DAY,
  TOTAL_SALE_BY_LOCATION_BAR,
  CANCEL_POS_SALE,
  LAST_TEN_DAYS_SALES,
  SALES_TILL_DATE_RECORD,
  CUSTOMER_ERP_SALES,
  SET_SEARCH_POS_SALE,
  POS_REPORTS_COLUMNS,
  POS_REPORT_EXPORT_DATA,
  SET_SEARCH_POS_PROMOTIONS,
  SET_SEARCH_RECEIVABLE_SEARCH,
} from '../actionTypes';

const initialState = {
  pos_sale_list: [],
  pos_sale_by_pagination: [],
  possale_count: 0,
  pos_sales_report: [],
  grandTotal: 0,
  totalSaleByLocation:[],
  totalSaleLocationBar:[],
  topSaleByBrand:[],
  saleComparison:[],
  totalSaleByDate:[],
  totalSaleByMonth:[],
  cancelPosSale:[],
  lastTenDaysSales:[],
  salesTillDateRecord:[],
  customer_individual_sales:[],
  searchPosSaleData:[],
  searchPosSaleCount: 0,
  column: {},
  posExportData: [],
  searchPosPromotionData : [],
  searchPosPromotionCount: 0,
  setReceivable:[],
};

function posSaleReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case LIST_POS_SALE:
      return {...state, pos_sale_list: payload};

    case POS_SALE_BY_PAGINATION:
      return {...state, pos_sale_by_pagination: payload};

    case TOTAL_POSSALE_COUNT:
      return {...state, possale_count: payload};

    case GET_POS_SALE_REPORT:
      return { ...state, pos_sales_report: payload };
    
    case GET_POS_SALE_GRANDTOTAL:
      return { ...state, grandTotal: payload };
    
    case TOTAL_SALE_BY_LOCATION:
      return { ...state, totalSaleByLocation: payload };
    
    case TOP_SALE_BY_BRAND:
      return { ...state, topSaleByBrand: payload };
    
    case SALE_COMPARISON:
      return { ...state, saleComparison: payload };
    
    case TOTAL_SALE_BY_DAY:
      return { ...state, totalSaleByDate: payload };
    
    case TOTAL_SALE_BY_MONTH:
      return { ...state, totalSaleByMonth: payload };
    
    case TOTAL_SALE_BY_LOCATION_BAR:
      return { ...state, totalSaleLocationBar: payload };
    
    case CANCEL_POS_SALE:
      return { ...state, cancelPosSale: payload };  
    
    case LAST_TEN_DAYS_SALES:
      return { ...state, lastTenDaysSales: payload };
    
    case SALES_TILL_DATE_RECORD:
      return { ...state, salesTillDateRecord: payload }
    
    case CUSTOMER_ERP_SALES:
       return {...state, customer_individual_sales: payload}
    case SET_SEARCH_POS_SALE:
    return {
      ...state,
      searchPosSaleData:payload.data, 
      searchPosSaleCount:payload.numRows,
      grandTotal:payload.grandTotal
      }
    
    case POS_REPORTS_COLUMNS:
      return { ...state, column: payload }
    
    case POS_REPORT_EXPORT_DATA:
      return { ...state, posExportData: payload }

    case SET_SEARCH_POS_PROMOTIONS:
      return {
          ...state,
          searchPosPromotionData:payload.data, 
          searchPosPromotionCount:payload.numRows,
      }
    
      case SET_SEARCH_RECEIVABLE_SEARCH:
        return { ...state, setReceivable: payload };
    
    default:
      return state;
  }
}

export default posSaleReducer;
