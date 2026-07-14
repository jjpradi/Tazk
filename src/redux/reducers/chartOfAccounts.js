import {
  LIST_CHARTOFACCOUNTS,
  LIST_PAYINACCOUNTS,
  LIST_PAYOUTACCOUNTS,
  TOTAL_CHARTOFACCOUNTS_COUNT,
  CHARTOFACCOUNTS_BY_PAGINATION,
  EXPORT_LIST_CHARTOFACCOUNTS,
  SET_SEARCH_CHARTOFACCOUNTS,
  JOURNAL_ACCOUNTS,
  JOURNAL_ENTRY_SEQUENCE,
  GET_ACC_TYPES
} from '../actionTypes';

const initialState = {
  chartOfAccounts: [],
  chartOfAccountsByPagination: [],
  chartOfAccounts_id_data: [],
  chartOfAccounts_payIn_data: [],
  chartOfAccounts_payOut_data: [],
  chartofaccounts_count: 0,
  export_chart:[],
  searchChartOfAccountData:[],
  searchChartOfAccountCount: 0,
  journalaccount:[],
  journalEntrySequence: {currentSeq: 0},
  acctypes: []
};

function ChartOfAccountsReducer(state = initialState, action) {
  const {type, payload} = action;
  switch (type) {
    case LIST_CHARTOFACCOUNTS:
      return {...state, chartOfAccounts: payload};
    case EXPORT_LIST_CHARTOFACCOUNTS:
      return {...state,export_chart: payload };

    case CHARTOFACCOUNTS_BY_PAGINATION:
      return {...state, chartOfAccountsByPagination: payload};

    case LIST_PAYINACCOUNTS:
      return {...state, chartOfAccounts_payIn_data: payload};

    case LIST_PAYOUTACCOUNTS:
      return {...state, chartOfAccounts_payOut_data: payload};

    case TOTAL_CHARTOFACCOUNTS_COUNT:
      return {...state, chartofaccounts_count: payload};

    case SET_SEARCH_CHARTOFACCOUNTS:
      return {
        ...state,
        searchChartOfAccountData:payload.data.data, 
        searchChartOfAccountCount:payload.data.numRows
      }
    case JOURNAL_ACCOUNTS:
      return{
        ...state, journalaccount: payload
      }

    case JOURNAL_ENTRY_SEQUENCE:
      return { ...state, journalEntrySequence: payload }
    
    case GET_ACC_TYPES:
      return {...state, acctypes: payload}
      
    default:
      return state;
  }
}

export default ChartOfAccountsReducer;
