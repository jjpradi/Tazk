import {
  TOP_10_OUTSTANDING_REPORT,
  SALES_MAN_SALE_DETAILS,
  OUTSTANDING_REPORT,
  GET_CHEQUE_BOUNCE,
  CREATE_CHEQUE_BOUNCE,
  GET_SALES_MAN_VISITS,
  GET_SALES_MAN_DATA,
  SET_SEARCH_SALESMAN,
  GET_SALES_MAN_PAGINATION,
  SET_SEARCH_CHEQUEBOUNCE,
  TOTAL_OVERDUE_REPORT,
  TO_BE_COLLECTED_TODAY,
  OVERDUE_TO_BE_COLLECTED,
  COLLECTIONS_UPDATE,
  COLLECTIONS_REPORTS,
  GET_SALES_APPROVAL,
  PAYMENT_COLLECTION_REPORT,
  PAYMENT_COLLECTION_FILTER,
  GET_ALL_SALESMAN_LIST,
  GET_PAYMENT_COLLECTION_REPORT,
  SET_PAYMENT_COLLECTION_REPORT,
  GET_ALL_SALESMAN_INCENTIVE,
  SET_SEARCH_SALESMAN_INCENTIVE,
  GET_DAY_BOOK,
  SET_STOCK_GROUP_SUMMARY,
  GET_EXPIRY_DATE_REPORT,
  PAYMENT_COLLECTION_APPROVE,
  SET_SEARCH_SALESMAN_COLLECTION,
  COLLECTION_BY_SALESMAN,
  GET_CHEQUE_BOUNCE_BY_ID,
  GET_ALL_CHEQUE_STATUS,
  GET_DAY_BOOK_CONSOLIDATE

} from 'redux/actionTypes';
import { UPDATE_CHEQUE_STATUS } from '../actionTypes';

const initialState = {
  salesManSaleDetails: [],
  top10OutstandingReport: [],
  outstandingReport: [],
  chequeBounce: [],
  chequeBounceCount: 0,
  createChequeBounce: [],
  getSalesManVisits:[],
  getSalesmanData : [],  
  searchSalesManData:[],
  searchSalesManCount: 0,
  salesManByPagination : [],
  salesManByPaginationCount:0,
  searchChequebouncedata : [],
  searchChequebouncedataCount: 0,
  totalOverdue: [],
  toBeCollectedToday: [],
  overDueToBeCollected: [],
  collectionStatus:[],
  collection_report:[],
  paymentCollectionReport:[],
  paymentCollectionFilter:[],
  getAllSalesManList:[],
  setPaymentCollectionFilter:[],
  getPaymentCollectionFilter:[],
  getAllSalesmanIncentive: [],
  getDayBookData : [],
  getStockGroupSummary : [],
  getExpiryDateReport : [],
  paymentCollectionApprove:[],
  paymentCollectionReportCount:[],
  salesmanCollections: [],
  collectionsBySalesman: [],
  getChequeById :[],
  updateChequeStatus:[],
  getAllChequeStatus:[],
  daybookConsolidate: []
};

function salesManReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case SALES_MAN_SALE_DETAILS:
      return { ...state, salesManSaleDetails: payload };
    
    case GET_SALES_APPROVAL:
      return {...state, salesApprovalRequest: payload};

    case TOP_10_OUTSTANDING_REPORT:
      return {...state, top10OutstandingReport: payload};

    case OUTSTANDING_REPORT:
      return {...state, outstandingReport: payload};

    case GET_CHEQUE_BOUNCE:
      return {
        ...state, 
        chequeBounce: payload.data,
        chequeBounceCount: payload.numRows
      };
    case GET_CHEQUE_BOUNCE_BY_ID :
        return {...state, getChequeById : payload.data};
    case UPDATE_CHEQUE_STATUS :
        return {...state, updateChequeStatus : payload.data};
    case GET_ALL_CHEQUE_STATUS :
        return {...state, getAllChequeStatus : payload.data};
    case CREATE_CHEQUE_BOUNCE:
      return {...state, createChequeBounce: payload};

    case GET_SALES_MAN_VISITS:
      return {...state, getSalesManVisits: payload};
    case GET_SALES_MAN_DATA:
      return {...state, getSalesmanData: payload};
      
    case SET_SEARCH_SALESMAN:
      return {
        ...state,
        searchSalesManData:payload.data, 
        searchSalesManCount:payload.numRows
      }

    case GET_SALES_MAN_PAGINATION:     
      return {
        ...state,
        salesManByPagination:payload.data, 
        salesManByPaginationCount:payload.numRows
      }
 
      case SET_SEARCH_CHEQUEBOUNCE:
        return {
          ...state, 
          // searchChequebouncedata: payload.data,
          // searchChequebouncedataCount: payload.numRows

          chequeBounce: payload.data,
          chequeBounceCount: payload.numRows
      };
    
      
    case TOTAL_OVERDUE_REPORT:
      return { ...state, totalOverdue: payload };

    case TO_BE_COLLECTED_TODAY:
      return { ...state, toBeCollectedToday: payload };

    case OVERDUE_TO_BE_COLLECTED:
      return { ...state, overDueToBeCollected: payload };

    case COLLECTIONS_UPDATE:
      return { ...state, collectionStatus: payload };

      case COLLECTIONS_REPORTS:
        return { ...state, collection_report: payload };

          case PAYMENT_COLLECTION_APPROVE:
            return { ...state,   paymentCollectionApprove: payload };
          case GET_ALL_SALESMAN_LIST:
            return{...state, getAllSalesManList: payload}

            case PAYMENT_COLLECTION_FILTER:
              return{...state, paymentCollectionFilter: payload}

              case GET_PAYMENT_COLLECTION_REPORT:
                return{...state, getPaymentCollectionFilter: payload}  

              case SET_PAYMENT_COLLECTION_REPORT:
                return {...state, paymentCollectionReport : payload.data, paymentCollectionReportCount : payload.numRows}

    case GET_ALL_SALESMAN_INCENTIVE:
      return { ...state, getAllSalesmanIncentive: payload }


    case SET_SEARCH_SALESMAN_INCENTIVE:
      return {
        ...state,
        searchIncentiveData: payload.data.data,
        searchIncentiveCount: payload.data.numRows
      }
    case GET_DAY_BOOK:
      return {...state,getDayBookData : payload}

    case SET_STOCK_GROUP_SUMMARY : 
      return {...state,getStockGroupSummary : payload}

    case GET_EXPIRY_DATE_REPORT : 
      return {...state,getExpiryDateReport : payload}

    case SET_SEARCH_SALESMAN_COLLECTION:
      return { ...state, salesmanCollections: payload }

    case COLLECTION_BY_SALESMAN:
      return { ...state, collectionsBySalesman: payload }

    case GET_DAY_BOOK_CONSOLIDATE:
      return { ...state, daybookConsolidate: payload }
    
    default:
      return state;
  }
}
export default salesManReducer;
