import {GET_EMPLOYEE_LOAN, GET_LOAN_DETAIL, GET_LOAN_LEDGER_DETAILS, GET_LOAN_SEQUENCE, GET_PAYROLL_PAYMENT_MODE, SET_SEARCH_LOAN, UPDATE_LOAN_DETAIL,TENURE_TYPE, GET_LOCATION, GET_EMPLOYEE_LOAN_DUE, LOAN_CLEAR_STATE,CREATE_CLAIM,SEARCH_CLAIM, CLAIMS_CATEGORY,DELETE_LOAN,DELETE_CLAIM,APPROVED_CLAIMS,ADD_CLAIMS_CATEGORY,DELETE_CLAIMS, SET_SEARCH_CLAIMS_CATEGORY_LIST} from '../actionTypes';

const initialState = {
  loansdetail: [],
  updateloansdetail:[],
  createClaim:[],
  searchClaim:[],
  searchloandata: [],
  payrollPaymentMode: [],
  loanSequence: [],
  loanLedgerDetails:[],
  employeeLoans: {},
  tenureMonths: [],
  claimsCategory: [],
  getLocation: [],
  employeeLoansDueAmount: [],
  searchloandataCount: 0,
  deleteLoan: [],
  deleteClaim: [],
  approvedClaims : [],
  addClaimsCategory :[],
  deleteClaims : []
};

function LoanReducer(state = initialState, action) {
  const {type, payload} = action;
  switch (type) {
    case GET_LOAN_DETAIL:
      return {...state, loansdetail: payload};

      case UPDATE_LOAN_DETAIL:
        return {...state, updateloansdetail: payload};

    case CREATE_CLAIM:
      return { ...state, createClaim: payload };

        case SET_SEARCH_LOAN:
      return { ...state, searchloandata: payload, loansdetail:payload };
    
        case GET_PAYROLL_PAYMENT_MODE:
      return { ...state, payrollPaymentMode: payload };
    
        case GET_LOAN_SEQUENCE:
      return { ...state, loanSequence: payload };
    
        case GET_LOAN_LEDGER_DETAILS:
        return {...state, loanLedgerDetails: payload};

    case GET_EMPLOYEE_LOAN:
      return {...state, employeeLoans: payload};

    case GET_EMPLOYEE_LOAN_DUE:
      return {...state, employeeLoansDueAmount: payload};

    case TENURE_TYPE:
      return { ...state, tenureMonths: payload }

    case CLAIMS_CATEGORY:
      case SET_SEARCH_CLAIMS_CATEGORY_LIST:
      return { ...state, claimsCategory: payload }

    case SEARCH_CLAIM:
      return { ...state, searchClaim: payload }

      case GET_LOCATION:
        return { ...state, getLocation: payload}

      case LOAN_CLEAR_STATE:
        return { ...state, searchloandata: []}

        case DELETE_LOAN:
          return { ...state, deleteLoan: payload}

          case DELETE_CLAIM:
            return { ...state, deleteClaim: payload}

            case APPROVED_CLAIMS:
            return { ...state, approvedClaims: payload}

            case ADD_CLAIMS_CATEGORY:
            return { ...state, addClaimsCategory: payload}

            case DELETE_CLAIMS:
            return { ...state, deleteClaims: payload}

    default:
      return state;
  }
}


export default LoanReducer;
