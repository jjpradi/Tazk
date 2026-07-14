import {
  LIST_BANK_CREATION,
  CREATE_BANK_CREATION,
  EDIT_BANK_CREATION,
  TOTAL_BANK_COUNT,
  DELETE_BANK_CREATION,
  LIST_BANK_CREATION_ADJUSTMENT,
  LIST_BANK_CREATION_BY_PAGINATION,
  GET_BANK_RECONCILIATION,
  GET_BANK_ACCOUNTS,
  GET_BANK_RECONCILIATION_TABLE,
  CREATE_BANK_RECONCILIATION_TABLE,
  GET_MATCHED_RECONCILIATION_TABLE,
  DELETE_BANK_RECONCILIATION,
  BANK_WITH_LEDGER,
  BANK_STATEMENT_COLUMN,
  SET_SEARCH_BANK_RECONCILIATION,
  SET_SEARCH_BANK,
  GET_CONTRA_BANK,
  SET_BANK_ID,
  SELECTED_TRANSACTION,
  SET_PAY_IN_OUT_TRANSACTION_COUNT,
  EXTRAS,
  GET_RECORDS,
  OVERALL_COUNT_AND_TOTAL,
  UNRECONCILED_AND_RECONCILED,
  SET_MANUAL_MATCH_RECORDS,
  GET_ALL_BANK_ACCS,
  GET_ALL_BANKRECONCILIATION,
  SET_BANK_RECONCILIATION_API_CALL
} from '../actionTypes';

const initialState = {
  bank_creation_list: [],
  bank_creation_list_by_pagination: [],
  bank_creation_adjustment_list: [],
  bankcreation_count: 0,
  bank_reconciliation: [],
  bank_accounts:[],
  bank_reconciliation_table:[],
  matched_reconciliation_entry:[],
  bank_with_ledger:[],
  bankStatementColumn:[],
  searchBankCreationData:[],
  searchBankCreationCount: 0,
  searchBankData:[],
  searchBankCount: 0,
  contra_bank_with_ledgerId:[],
  bank_reconciliation_table_count: 0,
  bank_id: 0,
  selected_transaction: [],
  setPayInOutCount: 0,
  extras: [],
  get_records:[],
  overAllCountValue: {},
  unreconciledAndReconciled: { data: [], numRows: 0 },
  getManualMatchRecords: [],
  manualMatchRecordsCount: [],
  getAllBankAccs: [],
  getAllBankReconciliation: { data: [], numRows: 0 },
  bankReconciliationApiCall: false,
};

function bankCreationReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case LIST_BANK_CREATION:
      return {...state, bank_creation_list: payload};
      
    case BANK_WITH_LEDGER:
        return {...state, bank_with_ledger: payload};

    case LIST_BANK_CREATION_BY_PAGINATION:
      return {...state, bank_creation_list_by_pagination: payload};

    case LIST_BANK_CREATION_ADJUSTMENT:
      return {...state, bank_creation_adjustment_list: payload};

    case CREATE_BANK_CREATION:
      return {...state, bank_creation_list_by_pagination: payload};

    case EDIT_BANK_CREATION:
      return {...state, bank_creation_list_by_pagination: payload};

    case DELETE_BANK_CREATION:
      return {...state, bank_creation_list_by_pagination: payload};

    case TOTAL_BANK_COUNT:
      return {...state, bankcreation_count: payload};

    case GET_BANK_RECONCILIATION:
      return {...state, bank_reconciliation: payload};

    case GET_BANK_ACCOUNTS:
      return {...state, bank_accounts: payload};
      case GET_RECORDS:
        return {...state, get_records: payload};
    case GET_BANK_RECONCILIATION_TABLE:
        return {
          ...state, 
          bank_reconciliation_table: payload.data,
          bank_reconciliation_table_count: payload.numRows
        };

    case CREATE_BANK_RECONCILIATION_TABLE:
      return {...state, bank_reconciliation_table: payload}; 
    case GET_MATCHED_RECONCILIATION_TABLE:
        return {...state, matched_reconciliation_entry: payload}; 
      
    case DELETE_BANK_RECONCILIATION:
        return {...state, bank_reconciliation_table: payload}; 
    case BANK_STATEMENT_COLUMN:
        return {...state, bankStatementColumn: payload}; 

    case SET_SEARCH_BANK_RECONCILIATION:
      return {
        ...state,
        searchBankCreationData:payload.data, 
        searchBankCreationCount:payload.numRows
      }

    case SET_SEARCH_BANK:
      return {
        ...state,
        searchBankData: payload.data, 
        searchBankCount: payload.numRows
      }
    
      case GET_CONTRA_BANK:
      return { ...state, contra_bank_with_ledgerId: payload }; 
    
      case SET_BANK_ID:
        return { ...state, bank_id: payload };
    
      case SELECTED_TRANSACTION:
        return { ...state, selected_transaction: payload }; 
    
      case SET_PAY_IN_OUT_TRANSACTION_COUNT:
        return {...state, setPayInOutCount: payload}; 
      
      case EXTRAS:
        return {...state, extras: payload}; 

      case OVERALL_COUNT_AND_TOTAL:
        return { ...state, overAllCountValue: payload }

      case UNRECONCILED_AND_RECONCILED:
        return { ...state, unreconciledAndReconciled: payload }

      case SET_MANUAL_MATCH_RECORDS:
        return { ...state, getManualMatchRecords: payload.data, manualMatchRecordsCount: payload.numRows }

      case GET_ALL_BANK_ACCS:
        return { ...state, getAllBankAccs: payload}

      case GET_ALL_BANKRECONCILIATION:
        return { ...state, getAllBankReconciliation: payload}

      case SET_BANK_RECONCILIATION_API_CALL:
        return { ...state, bankReconciliationApiCall: payload}

    default:
      return state;
  }
}

export default bankCreationReducer;
