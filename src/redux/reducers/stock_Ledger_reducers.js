import {
  CREATE_STOCK_LEDGER,
  LIST_STOCK_LEDGER,
  GET_ID_STOCK_LEDGER,
  EDIT_STOCK_LEDGER,
  DELETE_STOCK_LEDGER,
} from '../actionTypes';

const initialState = {
  stock_ledger_list: [],
  stockledger_id_data: [],
};

function stockLedgerReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case CREATE_STOCK_LEDGER:
      return {...state, stock_ledger_list: payload};

    case LIST_STOCK_LEDGER:
      return {...state, stock_ledger_list: payload};

    case GET_ID_STOCK_LEDGER:
      return {...state, stockledger_id_data: payload};
    //return payload

    case EDIT_STOCK_LEDGER:
      return {...state, stock_ledger_list: payload};

    case DELETE_STOCK_LEDGER:
      //return {...state.taxcategory.filter(({ id }) => id !== payload.id)};
      return {...state, stock_ledger_list: payload};

    default:
      return state;
  }
}

export default stockLedgerReducer;
