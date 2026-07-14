import {TOT_PAYABLE_RECEIVABLE, AGING_RECEIVABLE, AGING_PAYABLE,LIST_PAYABLE_DUE_DAYS,LIST_PAYABLE_OUTSTANDING, TOTAL_ACCOUNTS_PAYABLE, TOTAL_PAYABLE, TOTAL_ACCOUNTS_RECEIVABLE, TOTAL_RECEIVABLE } from '../actionTypes';

const initialState = {
  payable_receivable: [],
  aging_receivable: [],
  aging_payable:[],
  payable_due_days : [],
  payable_Outstand: [],
  totalPayable: {},
  totalAccountsPayable: {},
  totalAccountsReceivable: {},
  totalReceivable: {}
};

function TotAccReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case TOT_PAYABLE_RECEIVABLE:
      return {...state, payable_receivable: payload};
    case AGING_RECEIVABLE:
      return {...state,  aging_receivable : payload};

    case AGING_PAYABLE:
      return {...state,  aging_payable : payload};

      case LIST_PAYABLE_DUE_DAYS:
        return {...state,  payable_due_days : payload};
      
        case LIST_PAYABLE_OUTSTANDING:
      return { ...state, payable_Outstand: payload };     
    
    case TOTAL_PAYABLE:
      return { ...state, totalPayable: payload };

    case TOTAL_ACCOUNTS_PAYABLE:
      return { ...state, totalAccountsPayable: payload };
    
    case TOTAL_ACCOUNTS_RECEIVABLE:
      return { ...state, totalAccountsReceivable: payload };
    
    case TOTAL_RECEIVABLE:
      return { ...state, totalReceivable: payload };
    
    default:
      return state;
  }
}

export default TotAccReducer;
