import {
  RECHARGE_LOADING,
  RECHARGE_ERROR,
  RECHARGE_OPERATORS_LIST,
  RECHARGE_OPERATOR_UPSERTED,
  RECHARGE_DASHBOARD,
  RECHARGE_WALLET_LOADS_LIST,
  RECHARGE_WALLET_LOAD_CREATED,
  RECHARGE_TRANSACTIONS_LIST,
  RECHARGE_TRANSACTION_CREATED,
  RECHARGE_PAYMENT_METHODS,
  RECHARGE_DAILY_SUMMARY,
} from '../actionTypes/recharge_types';

const initialState = {
  loading: false,
  error: null,
  operators: [],
  dashboard: null,
  walletLoads: [],
  transactions: [],
  paymentMethods: [],
  lastCreatedTxn: null,
  dailySummary: null,
};

export default function rechargeReducer(state = initialState, action) {
  switch (action.type) {
    case RECHARGE_LOADING:
      return {...state, loading: action.payload};
    case RECHARGE_ERROR:
      return {...state, error: action.payload, loading: false};
    case RECHARGE_OPERATORS_LIST:
      return {...state, operators: action.payload};
    case RECHARGE_OPERATOR_UPSERTED:
      return {...state};
    case RECHARGE_DASHBOARD:
      return {...state, dashboard: action.payload};
    case RECHARGE_WALLET_LOADS_LIST:
      return {...state, walletLoads: action.payload};
    case RECHARGE_WALLET_LOAD_CREATED:
      return {...state};
    case RECHARGE_TRANSACTIONS_LIST:
      return {...state, transactions: action.payload};
    case RECHARGE_TRANSACTION_CREATED:
      return {...state, lastCreatedTxn: action.payload};
    case RECHARGE_PAYMENT_METHODS:
      return {...state, paymentMethods: action.payload};
    case RECHARGE_DAILY_SUMMARY:
      return {...state, dailySummary: action.payload};
    default:
      return state;
  }
}
