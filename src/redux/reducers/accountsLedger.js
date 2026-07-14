import {CASH_FLOW, LIST_ACCOUNTSLEDGER, TRIAL_BALANCE} from '../actionTypes';

const initialState = {
  accountsLedger: [],
  accountsLedger_id_data: [],
  cashFlow: [],
  trialBalance: []
};

function AccountsLedgerReducer(state = initialState, action) {
  const {type, payload} = action;
  switch (type) {
    case LIST_ACCOUNTSLEDGER:
      return {...state, accountsLedger: payload};

    case CASH_FLOW:
      return {...state, cashFlow: payload};

    case TRIAL_BALANCE:
      return {...state, trialBalance: payload};

    default:
      return state;
  }
}

export default AccountsLedgerReducer;
