import {
  LIST_BALANCESHEET,
  LIST_ACCOUNTS_BALANCESHEET,
  TOTAL_BALANCESHEET_COUNT,
  GROUP_NAME,
  LIST_BALANCE_PROFITS
} from '../actionTypes';

const initialState = {
  balancesheet: [],
  balancesheet_id_data: [],
  balancesheetaccounts: [],
  balancesheet_count: 0,
  groupname:[],
  balanceprofit : []
};

function balancesheetReducer(state = initialState, action) {
  const {type, payload} = action;

  switch (type) {
    case LIST_BALANCESHEET:
      return {...state, balancesheet: payload};
    case LIST_ACCOUNTS_BALANCESHEET:
      return {...state, balancesheetaccounts: payload};

    case TOTAL_BALANCESHEET_COUNT:
      return {...state, balancesheet_count: payload};
    
    case GROUP_NAME:
      return {...state, groupname: payload};

    case LIST_BALANCE_PROFITS:
        return {...state, balanceprofit: payload};

    default:
      return state;
  }
}

export default balancesheetReducer;
