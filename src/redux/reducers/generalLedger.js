import {
  LIST_GENERALLEDGER,
  TOTAL_GENERALLEDGER_COUNT,
  LIST_LEDGER_MONTHLY_SUMMARY,
  SET_SEARCH_LEDGER,
  EXPORT_LIST_LEDGER
} from '../actionTypes';

const initialState = {
  generalLedger: [],
  generalLedger_id_data: [],
  generalLedger_count: 0,
  generalLedger_monthly_summary: { data: {}, openingbalance: null, ledgerName: [] },
  searchLedgerCount:0,
  searchLedgerData:[],
  export_chart:[],
};

function GeneralLedgerReducer(state = initialState, action) {
  const {type, payload} = action;
  switch (type) {
    case LIST_GENERALLEDGER:
      return {...state, generalLedger: payload};

    case TOTAL_GENERALLEDGER_COUNT:
      return {...state, generalLedger_count: payload};

    case LIST_LEDGER_MONTHLY_SUMMARY:
      return {...state, generalLedger_monthly_summary: payload};

      case SET_SEARCH_LEDGER:
        return {
          ...state,
          searchLedgerData:payload.data, 
          searchLedgerCount:payload.numRows
        }

        case EXPORT_LIST_LEDGER:
          return {...state,export_chart: payload };

    default:
      return state;
  }
}

export default GeneralLedgerReducer;
