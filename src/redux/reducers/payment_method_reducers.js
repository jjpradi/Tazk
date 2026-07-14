import {
  LIST_PAYMENT_METHOD,
  CREATE_PAYMENT_METHOD,
  GET_ID_PAYMENT_METHOD,
  EDIT_PAYMENT_METHOD,
  DELETE_PAYMENT_METHOD,
  LIST_PAYMENT_TYPE,
  SET_SEARCH_PAYMENT_METHOD,
  BILL_RECEIVABLES_INVOICE,
  RECEIVABLES_LASTSYNC,
  GET_UNMATCHED_RECORDS,
  SEND_OTP,
  VERIFY_PAYMENTOTP
} from '../actionTypes';

const initialState = {
  paymentMethod: [],
  paymentMethod_id_data: [],
  list_payment_type: [],
  search_paymentmethod_data: [],
  search_paymentmethod_count: 0,
  bills_receivables_invoice: [],
  unmatchedRecords: [],
  receivables_lastSync: "No Records",
  SEND_OTP: [],
  VERIFY_PAYMENTOTP: [],
  get_unmatched_records: []
};

function paymentMethodReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case LIST_PAYMENT_METHOD:
      return {...state, paymentMethod: payload};

    case LIST_PAYMENT_TYPE:
      return {...state, list_payment_type: payload};

    case CREATE_PAYMENT_METHOD:
      return {...state, paymentMethod: payload};

    case GET_ID_PAYMENT_METHOD:
      return {...state, paymentMethod_id_data: payload};

    case EDIT_PAYMENT_METHOD:
      return {...state, paymentMethod: payload};

    case DELETE_PAYMENT_METHOD:
      return {...state, paymentMethod: payload};

      case SET_SEARCH_PAYMENT_METHOD:
        return {
          ...state,
          search_paymentmethod_data:payload.data, 
          search_paymentmethod_count:payload.numRows
      }
    
    case BILL_RECEIVABLES_INVOICE:
        return {
          ...state,
          bills_receivables_invoice: payload.insertedData,
          unmatchedRecords: payload.unmatchedRecords || [],  
        };
    
      case RECEIVABLES_LASTSYNC:
          return {
            ...state,
            receivables_lastSync: action.payload.receivables_lastSync,  
      };
    
      case SEND_OTP:
      return { ...state, paymentMethod: payload };
    
      case VERIFY_PAYMENTOTP:
      return { ...state, paymentMethod: payload };
    
      case GET_UNMATCHED_RECORDS:
        return {
          ...state,
          get_unmatched_records: action.payload.data,  
    };
    
    default:
      return state;
  }
}

export default paymentMethodReducer;
