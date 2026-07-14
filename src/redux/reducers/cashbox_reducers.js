import {
  LIST_CASH_BOX_DENOMINATION,
  LIST_CASH_BOX,
  CREATE_CASH_BOX,
  LIST_CASH_BOX_SUMMARY_DATA,
  CASH_IN_HAND,
  CREATE_CASH_BOX_ADJUSTMENT,
  LIST_CASH_BOX_ADJUSTMENT,
  GET_BANK_ENQUIRY,
  CASH_IN_HAND_MONTH,
  CASH_BOX_LOCATION,
  DELETE_CASH_BOX,
  EDIT_CASH_BOX,
  CASH_BOX_OPENING_CLOSING,
  CASH_BOX_PAYMENT_ENTRY,
  CASH_BOX_RECEIPT_ENTRY,
  LOCATIONCASH_BOX_DENOMINATION,
  LEDGER_AMOUNT_SUMMARY,
  SET_SEARCH_CASHBOX,
  GET_CONTRA_CASHBOX,
  CASH_IN_HAND_DETAILS,
  CASH_IN_HAND_DETAILS_BY_TRANSACTIONS,
  CASH_IN_BANK_CASH,
  BANK_AND_CASH_ACCOUNTS,
  CASHBOX_CREDIT_DEBIT_HINT,
  CASH_AND_BANK_CONSOLIDATED_TOTALS,
  CASH_AND_BANK_TRANSACTION_LIST
} from '../actionTypes';

const initialState = {
  cash_box_denomination: [],
  cash_box_list: [],
  cash_box_summary: [],
  cash_box_cashInHand: [],
  cash_box_cashInHandDetails: [],
  cash_box_adjustment_list: [],
  bankopeningclosing: [],
  cashInHandMonth:{
    graphData : [],
    openingBalance : 0,
    closingBalance :0,
    outgoing :0,
    incoming :0
  },
  locateCashBox:[],
  cashboxopeningclosing:[],
  cashboxreceiptentry:[],
  cashboxpaymententry:[],
  locationcashbox:[],
  ledger_amount_summary : [],
  searchCashBoxData:[],
  searchCashBoxCount: 0,
  contra_cash_box:[],
  cashIn_hand_details_byTransactions: [],
  cash_box_cashInBankCash: [],
  cashAndBankAccounts: [],
  cashboxCreditDebitHint: null,
  cashAndBankConsolidatedTotal: [],
  cashAndBankTransactionList: {count: 0, data: []}
};

function cashBoxReducer(state = initialState, action) {
  const {type, payload} = action;
  switch (type) {
    case LIST_CASH_BOX_DENOMINATION:
      return {...state, cash_box_denomination: payload};

    case LIST_CASH_BOX:
      return {...state, cash_box_list: payload};

    case CASH_BOX_LOCATION:
      return {...state, locateCashBox: payload};

    case CREATE_CASH_BOX:
      return {...state, cash_box_list: payload};

    case CREATE_CASH_BOX_ADJUSTMENT:
      return {...state, cash_box_adjustment_list: payload};

    case LIST_CASH_BOX_ADJUSTMENT:
      return {...state, cash_box_adjustment_list: payload};

    case LIST_CASH_BOX_SUMMARY_DATA:
      return {...state, cash_box_summary: payload};

    case CASH_IN_HAND:
      return {...state, cash_box_cashInHand: payload};

    case CASH_IN_HAND_DETAILS:
      return {...state, cash_box_cashInHandDetails: payload};

      case CASH_IN_HAND_DETAILS_BY_TRANSACTIONS:
        return {...state, cashIn_hand_details_byTransactions: payload};

    case GET_BANK_ENQUIRY:
      return {...state, bankopeningclosing: payload};
    
    case CASH_IN_HAND_MONTH:
      return {...state, cashInHandMonth:{...payload}};

    case DELETE_CASH_BOX:
      return {...state, cash_box_list: payload};
    
    case EDIT_CASH_BOX:
      return {...state, cash_box_list: payload};

    case CASH_BOX_OPENING_CLOSING:
      return {...state, cashboxopeningclosing: payload};

    case CASH_BOX_PAYMENT_ENTRY:
       return {...state, cashboxpaymententry : payload}

    case CASH_BOX_RECEIPT_ENTRY:
       return {...state, cashboxreceiptentry: payload} 

    case LOCATIONCASH_BOX_DENOMINATION:
       return {...state, locationcashbox: payload} 

       case LEDGER_AMOUNT_SUMMARY:
        return {...state, ledger_amount_summary: payload} 
        
   case GET_CONTRA_CASHBOX:
        return {...state, contra_cash_box: payload} 
 
    case SET_SEARCH_CASHBOX:
      return {
        ...state,
        searchCashBoxData:payload.data, 
        searchCashBoxCount:payload.numRows
      }
    
    case CASH_IN_BANK_CASH:
      return {...state, cash_box_cashInBankCash: payload};

    case BANK_AND_CASH_ACCOUNTS:
      return { ...state, cashAndBankAccounts: payload }

    case CASHBOX_CREDIT_DEBIT_HINT:
      return { ...state, cashboxCreditDebitHint: payload }

    case CASH_AND_BANK_CONSOLIDATED_TOTALS:
      return { ...state, cashAndBankConsolidatedTotal: payload }

    case CASH_AND_BANK_TRANSACTION_LIST:
      return { ...state, cashAndBankTransactionList: payload }
    
    default:
      return state;
  }
}

export default cashBoxReducer;
