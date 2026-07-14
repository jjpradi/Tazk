import {
  LIST_LEDGER,
  CREATE_LEDGER,
  GET_ID_LEDGER,
  TOTAL_LEDGER_COUNT,
  EDIT_LEDGER,
  DELETE_LEDGER,
  LIST_PARENT_GROUP_LEDGER,
  GET_ALL_PARENT_LEDGER,
  GET_LEDGER_VOUCHERS,
  UPDATE_PARENT_LEDGER,
  LIST_LEDGER_PAGINATE,
  LIST_MIGRATION,
  LEDGER_MIGRATION,
  UPDATE_MIGRATION,
  CREATE_MIGRATION,
  LIST_ACCOUNT_GROUP,
  EXIST_UPDATE,
  UPDATE_SEEN_LOAN,
  OPENING_BAL_LEDGERS,
  ACCOUNT_GROUP,
  LEDGER_FILTER_DATA
} from '../actionTypes';

const initialState = {
  ledger_list: [],
  ledger_parent_group_list: [],
  ledger_id_data: [],
  ledger_count: 0,
  all_parent_ledger: [],
  all_ledger_vouchers: { data:[], closingBalance:[], openingBalance:[]},
  update_parent_ledger: [],
  ledgerPagination: [],
  ledgerPaginationCount : 0,
  migrationList : [],
  ledger_migration : [],
  update_migration : [],
  list_groups : [],
  exist_update : [],
  update_seen_loan:[],
  openingBalanceLedgers: [],
  accountGroup: [],
  generalLedgerFilterData: []
};

function ledgerReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case LIST_LEDGER:
      return {...state, ledger_list: payload};

    case LIST_PARENT_GROUP_LEDGER:
      return {...state, ledger_parent_group_list: payload};

    case CREATE_LEDGER:
      return {...state, ledger_list: payload};

    case GET_ID_LEDGER:
      return {...state, ledger_id_data: payload};

    case EDIT_LEDGER:
      return {...state, ledger_list: payload};

    case DELETE_LEDGER:
      return {...state, ledger_list: payload};

    case TOTAL_LEDGER_COUNT:
      return {...state, ledger_count: payload};

    case GET_ALL_PARENT_LEDGER:
      return {...state, all_parent_ledger: payload};
      
    // case UPDATE_PARENT_LEDGER:
    //   return {...state, all_parent_ledger: payload};

    case UPDATE_PARENT_LEDGER:
      return {
        ...state,
        ledgerPagination: payload.data,
        ledgerPaginationCount: payload.numRows
      };

    case GET_LEDGER_VOUCHERS:
      return { ...state, all_ledger_vouchers: payload };

      case UPDATE_SEEN_LOAN:
        return { ...state, update_seen_loan: payload };
    
    case LIST_LEDGER_PAGINATE:
      return {
        ...state,
        ledgerPagination: payload.data,
        ledgerPaginationCount: payload.numRows
      };

      case LIST_MIGRATION:
        return {...state, migrationList: payload};
        
      case LEDGER_MIGRATION:
        return {...state, ledger_migration: payload};

        case UPDATE_MIGRATION:
          return {...state, update_migration: payload};
          
        case CREATE_MIGRATION:
          return {...state, ledger_migration: payload};

          case LIST_ACCOUNT_GROUP:
            return {...state, list_groups: payload};

            case EXIST_UPDATE:
              return {...state, exist_update: payload};
      
      case OPENING_BAL_LEDGERS:
        return {...state, openingBalanceLedgers: payload};

      case ACCOUNT_GROUP:
        return { ...state, accountGroup: payload }

        case LEDGER_FILTER_DATA:
        return { ...state, generalLedgerFilterData: payload }

    default:
      return state;
  }
}

export default ledgerReducer;
