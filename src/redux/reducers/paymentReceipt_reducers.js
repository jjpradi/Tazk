import {
  LIST_PAYMENT_RECEIPT,
  CREATE_PAYMENT_RECEIPT,
  GET_ID_PAYMENT_RECEIPT,
  EDIT_PAYMENT_RECEIPT,
  EDIT_STATUS_PAYMENT_RECEIPT,
  DELETE_PAYMENT_RECEIPT,
  LIST_EXPENSE,
  TOP3,
  LIST_PAYMENT_RECEIPT_GET_ALL,
  GET_PAYMENT_RECEIPT_MONTH_DATA,
  GET_PAYMENT_RECEIPT_TOTAL_AMOUNT,
  SET_SEARCH_PAYMENT_REPORT,
  SET_SEARCH_CREDIT_DEBIT,
  TRIGGER_PAYINOUT_MODAL,
  GET_PAYIN_PAYOUT_BY_ID
} from '../actionTypes';

const initialState = {
  paymentReceipt: [],
  paymentReceiptCount:0,
  paymentReceipt_id_data: [],
  expense: [],
  top3: {},
  paymentReceiptMonth: [],
  paymentReceipTotalAmount: [],
  searchPaymentreportData:[],
  searchPaymentreportCount: 0,
  searchCreditdebitData:[],
  searchCreditdebitCount:0,
  paymentReceiptINTotal:0,
  paymentReceiptOUTTotal: 0,
  showPayInOutModal: false,
  getPayinPayout: []
};

function paymentReceiptReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case LIST_PAYMENT_RECEIPT:
      return {
        ...state, 
        paymentReceipt: payload.data,
        paymentReceiptCount: payload.numRows,
        paymentReceiptINTotal :payload.totalAmountIn,
        paymentReceiptOUTTotal: payload.totalAmountOut,
      };

    case CREATE_PAYMENT_RECEIPT:
      return {...state, paymentReceipt: payload};

    case GET_ID_PAYMENT_RECEIPT:
      return {...state, paymentReceipt_id_data: payload};

    case EDIT_PAYMENT_RECEIPT:
      return {...state, paymentReceipt: payload};

    case EDIT_STATUS_PAYMENT_RECEIPT:
      return {...state, paymentReceipt: payload};

    case DELETE_PAYMENT_RECEIPT:
      return {...state, paymentReceipt: payload};

    case LIST_EXPENSE:
      return {...state, expense: payload};

    case TOP3:
      return {...state, top3: payload};

    case LIST_PAYMENT_RECEIPT_GET_ALL:
      return {...state, paymentReceipt: payload};

    case GET_PAYMENT_RECEIPT_MONTH_DATA:
      return {...state, paymentReceiptMonth: payload};

    case GET_PAYMENT_RECEIPT_TOTAL_AMOUNT:
      return {...state, paymentReceipTotalAmount: payload};

    case SET_SEARCH_PAYMENT_REPORT:
      return {
        ...state,
        // searchPaymentreportData:payload.data, 
        // searchPaymentreportCount:payload.numRows

        paymentReceipt: payload.data,
        paymentReceiptCount: payload.numRows,
        paymentReceiptINTotal :payload.totalAmountIn,
        paymentReceiptOUTTotal: payload.totalAmountOut,
      }

    case SET_SEARCH_CREDIT_DEBIT:
      return {
        ...state,
        searchCreditdebitData:payload.data, 
        searchCreditdebitCount:payload.numRows
      }
    
     case TRIGGER_PAYINOUT_MODAL:
      return { ...state, showPayInOutModal: action.payload };

     case GET_PAYIN_PAYOUT_BY_ID:
      return { ...state, getPayinPayout: payload.data };

    default:
      return state;
  }
}

export default paymentReceiptReducer;
