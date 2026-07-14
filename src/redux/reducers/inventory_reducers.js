import {
  CREATE_INVENTORY,
  LIST_INVENTORY,
  LIST_INVENTORY_BY_ID,
  GET_ID_INVENTORY,
  DELETE_INVENTORY,
  TOTAL_INVENTORY_COUNT,
  //Stock Transfer
  STOCK_TRANSFER_LIST,
  FILTER_STOCK_TRANSFER_LIST,
  CREATE_INVENTORY_STOCK_TRANSFER,
  GET_ID_STOCKTRANSFER,
  EDIT_STOCKTRANSFER,
  DELETE_STOCK_TRANSFER,
  //stock Receiver
  STOCK_RECEIVER_LIST,
  GET_ID_STOCK_RECEIVER,
  GET_DATE_INVENTORY,
  GET_INVENTORY_GRANDTOTAL,
  GET_INVENTORY_NONMOVE,
  GET_INVENTORY_LOCATE,
//available product
  GET_AVAILABLE_STOCK,
  STOCK_AGEING_REPORT,
  TOTAL_STOCK_AGEING_COUNT,
  SET_SEARCH_INVENTORY,
  SET_SEARCH_STOCKTRANSFER,
  SET_SEARCH_STOCK_RECEIVE,
  SET_SEARCH_AGEING_REPORT_STOCK,
  TRANSFER_RECEIVER_DAILYREPORT,
  SET_SEARCH_CLOSING_STOCK,
  FILTER_STOCK_RECEIVE_LIST,
  SUPPLIER_INVOICE_LIST,
  EXPORT_SCRAB
  
  // GET_ID_TRANSFER
} from '../actionTypes';

const initialState = {
  inventory: [],
  inventory_id_data: [],
  stocktransfer_id_data: [],
  stocktransfer: [],
  stockreceiver: [],
  stockreceiver_id_data: [],
  filtered_inventory: [],
  inventory_count: 0,
  inventory_all_data: [],
  grandTotal: 0,
  totalAvailableQty: 0,
  Count:0,
  NonmoveCategory:[],
  getlocateproduct:[],
  getavailablestock:[],
  get_stock_ageing_report:[],
  stock_ageing_count: [],
  // search_value:[],
  searchStockTransfer:[],
  search_value: [],
  searchStockReceiveValue: [],
  searchStockAgingReport:[],
  transferreceiver_dailyreport:[],
  closingStockData:[],
  closingStockDataCount: 0,
  supplierInvoiceList:[],
  scrabExport  : []
};

function inventoryReducer(state = initialState, action) {
  const {type, payload} = action;
  switch (type) {
    case CREATE_INVENTORY:
      return {...state, stocktransfer: payload};
      case SUPPLIER_INVOICE_LIST:
        return {...state, supplierInvoiceList: payload};
    case CREATE_INVENTORY_STOCK_TRANSFER:
      return {...state, inventory: payload};

    case LIST_INVENTORY:
      return {...state, inventory: payload};

    case LIST_INVENTORY_BY_ID:
      return {...state, inventory_all_data: payload};

    case GET_DATE_INVENTORY:
      return {...state, filtered_inventory: payload};

    case GET_ID_INVENTORY:
      return {...state, inventory_id_data: payload};

    case DELETE_INVENTORY:
      //return {...state.product.filter(({ id }) => id !== payload.id)};
      return {...state, inventory: payload};

    case TRANSFER_RECEIVER_DAILYREPORT:
        return {...state, transferreceiver_dailyreport: payload};

    //stock_TRANSFER:
    case EDIT_STOCKTRANSFER:
      return {...state, stocktransfer: payload};

    case GET_ID_STOCKTRANSFER:
      return {...state, stocktransfer_id_data: payload};

    case STOCK_TRANSFER_LIST:
      return {...state, stocktransfer: payload};

    case FILTER_STOCK_TRANSFER_LIST:
      return {...state, searchStockTransfer: payload};

      case DELETE_STOCK_TRANSFER:
        return {...state, stocktransfer: payload};

    // case CREATE_INVENTORY:
    //   return { ...state, stocktransfer: payload };

    //stock receiver

    case STOCK_RECEIVER_LIST:
      return {...state, stockreceiver: payload};
    //return payload
    // case STOCK_RECEIVER_LIST:
    //   return { ...state, stockreceiver: payload };

    case GET_ID_STOCK_RECEIVER:
      return {...state, stockreceiver_id_data: payload};

    case TOTAL_INVENTORY_COUNT:
      return {...state, inventory_count: payload};

    case GET_INVENTORY_GRANDTOTAL:
      return {...state, grandTotal: payload};

      case GET_INVENTORY_NONMOVE:
        return {...state, NonmoveCategory: payload};
        
        case GET_INVENTORY_LOCATE:
          return {...state, getlocateproduct: payload};

          //available stock
          case GET_AVAILABLE_STOCK:
            return {...state,getavailablestock: payload};

    case STOCK_AGEING_REPORT:
      return {...state,get_stock_ageing_report: payload};

    case TOTAL_STOCK_AGEING_COUNT:
      return {...state, stock_ageing_count: payload};
    
    case SET_SEARCH_INVENTORY:
      return {...state,
        search_value: payload.data,
        Count: payload.numRows >= 0 ? payload.numRows : state.Count,
        grandTotal: payload.grandTotal >= 0 ? payload.grandTotal : state.grandTotal,
        totalAvailableQty: payload.totalAvailableQty >= 0 ? payload.totalAvailableQty : state.totalAvailableQty,
       };

    case SET_SEARCH_STOCKTRANSFER:
      return {...state, searchStockTransfer: payload};
     // return { ...state, search_value: payload };
    
    case SET_SEARCH_STOCK_RECEIVE:
      return {...state, searchStockReceiveValue: payload};

    case FILTER_STOCK_RECEIVE_LIST:
      return {...state, searchStockReceiveValue: payload};

    case SET_SEARCH_AGEING_REPORT_STOCK:
        return {...state, searchStockAgingReport: payload};

    case SET_SEARCH_CLOSING_STOCK:
       return {
        ...state, 
        closingStockData: payload.data,
        closingStockDataCount: payload.numRows
      };

    case EXPORT_SCRAB:
        return {...state, scrabExport: payload};

    default:
      return state;
  }
}

export default inventoryReducer;
