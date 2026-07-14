import {CLAIM_MANUAL_PAYMENT, GET_CLAIM_TRANSACTION, GET_CLAIMS_TIMELINE, GET_COMPANY_LOANS_DUE, LIST_ALL_LOANS,SET_SEARCH_COMPANY_LOAN} from '../actionTypes';

const initialState = {
  companyLoanData: [],
  searchcompanyLoanData: [],
  companyLoansDue: [],
  claimMaunalPayment: [],
  getClaimtransaction: [],
  getClaimtimeline: [],
};

function AllLoansReducer(state = initialState, action) {
  const {type, payload} = action;
  switch (type) {

    case LIST_ALL_LOANS:
      return {...state, companyLoanData: payload};


     case SET_SEARCH_COMPANY_LOAN:
        return {...state, searchcompanyLoanData: payload};

    case GET_COMPANY_LOANS_DUE:
          return {...state, companyLoansDue: payload};

    case CLAIM_MANUAL_PAYMENT:
          return {...state, claimMaunalPayment: payload};

    case GET_CLAIM_TRANSACTION:
          return {...state, getClaimtransaction: payload};

    case GET_CLAIMS_TIMELINE:
          return {...state, getClaimtimeline: payload};

    default:
      return state;
  }
}

export default AllLoansReducer;
