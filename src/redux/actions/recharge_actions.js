import RechargeService from '../../services/recharge_services';
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

const startLoad = (dispatch) => dispatch({type: RECHARGE_LOADING, payload: true});
const stopLoad = (dispatch) => dispatch({type: RECHARGE_LOADING, payload: false});
const failLoad = (dispatch, err) => {
  dispatch({type: RECHARGE_LOADING, payload: false});
  dispatch({
    type: RECHARGE_ERROR,
    payload: err?.response?.data?.message || err?.message || 'Something went wrong',
  });
};

export const clearRechargeError = () => (dispatch) =>
  dispatch({type: RECHARGE_ERROR, payload: null});

// --- Operators ---------------------------------------------------------------

export const fetchOperators = (header_location_id) => async (dispatch) => {
  startLoad(dispatch);
  try {
    const res = await RechargeService.listOperators(header_location_id);
    dispatch({type: RECHARGE_OPERATORS_LIST, payload: res.data.operators || []});
    stopLoad(dispatch);
    return res.data.operators || [];
  } catch (err) {
    failLoad(dispatch, err);
  }
};

export const createOperator = (data, onSuccess) => async (dispatch) => {
  startLoad(dispatch);
  try {
    const res = await RechargeService.createOperator(data);
    dispatch({type: RECHARGE_OPERATOR_UPSERTED, payload: res.data});
    stopLoad(dispatch);
    if (onSuccess) onSuccess(res.data);
  } catch (err) {
    failLoad(dispatch, err);
  }
};

export const deleteOperator = (id, onSuccess, onError) => async (dispatch) => {
  startLoad(dispatch);
  try {
    await RechargeService.deleteOperator(id);
    stopLoad(dispatch);
    if (onSuccess) onSuccess();
  } catch (err) {
    failLoad(dispatch, err);
    if (onError) onError(err?.response?.data?.message || 'Delete failed');
  }
};

export const deleteWalletLoad = (id, onSuccess, onError) => async (dispatch) => {
  startLoad(dispatch);
  try {
    await RechargeService.deleteWalletLoad(id);
    stopLoad(dispatch);
    if (onSuccess) onSuccess();
  } catch (err) {
    failLoad(dispatch, err);
    if (onError) onError(err?.response?.data?.message || 'Delete failed');
  }
};

export const updateOperator = (id, data, onSuccess) => async (dispatch) => {
  startLoad(dispatch);
  try {
    const res = await RechargeService.updateOperator(id, data);
    dispatch({type: RECHARGE_OPERATOR_UPSERTED, payload: res.data});
    stopLoad(dispatch);
    if (onSuccess) onSuccess(res.data);
  } catch (err) {
    failLoad(dispatch, err);
  }
};

// --- Dashboard --------------------------------------------------------------

export const fetchDashboard = (header_location_id) => async (dispatch) => {
  startLoad(dispatch);
  try {
    const res = await RechargeService.getDashboard(header_location_id);
    dispatch({type: RECHARGE_DASHBOARD, payload: res.data});
    stopLoad(dispatch);
  } catch (err) {
    failLoad(dispatch, err);
  }
};

// --- Wallet loads ------------------------------------------------------------

export const fetchWalletLoads = (params = {}) => async (dispatch) => {
  startLoad(dispatch);
  try {
    const res = await RechargeService.listWalletLoads(params);
    dispatch({type: RECHARGE_WALLET_LOADS_LIST, payload: res.data.wallet_loads || []});
    stopLoad(dispatch);
  } catch (err) {
    failLoad(dispatch, err);
  }
};

export const createWalletLoad = (data, onSuccess) => async (dispatch) => {
  startLoad(dispatch);
  try {
    const res = await RechargeService.createWalletLoad(data);
    dispatch({type: RECHARGE_WALLET_LOAD_CREATED, payload: res.data});
    stopLoad(dispatch);
    if (onSuccess) onSuccess(res.data);
  } catch (err) {
    failLoad(dispatch, err);
  }
};

export const updateWalletLoad = (id, data, onSuccess, onError) => async (dispatch) => {
  startLoad(dispatch);
  try {
    const res = await RechargeService.updateWalletLoad(id, data);
    stopLoad(dispatch);
    if (onSuccess) onSuccess(res.data);
  } catch (err) {
    failLoad(dispatch, err);
    if (onError) onError(err?.response?.data?.message || 'Edit failed');
  }
};

// --- Transactions ------------------------------------------------------------

export const fetchTransactions = (params = {}) => async (dispatch) => {
  startLoad(dispatch);
  try {
    const res = await RechargeService.listTransactions(params);
    dispatch({type: RECHARGE_TRANSACTIONS_LIST, payload: res.data.transactions || []});
    stopLoad(dispatch);
  } catch (err) {
    failLoad(dispatch, err);
  }
};

export const createRechargeTxn = (data, onSuccess, onError) => async (dispatch) => {
  startLoad(dispatch);
  try {
    const res = await RechargeService.createTransaction(data);
    dispatch({type: RECHARGE_TRANSACTION_CREATED, payload: res.data});
    stopLoad(dispatch);
    if (onSuccess) onSuccess(res.data);
  } catch (err) {
    failLoad(dispatch, err);
    if (onError) onError(err?.response?.data?.message || 'Failed to process recharge');
  }
};

// --- Payment methods ---------------------------------------------------------

export const fetchPaymentMethods = (header_location_id) => async (dispatch) => {
  try {
    const res = await RechargeService.getPaymentMethods(header_location_id);
    dispatch({type: RECHARGE_PAYMENT_METHODS, payload: res.data.payment_methods || []});
  } catch (err) {
    failLoad(dispatch, err);
  }
};

export const fetchRechargeDailySummary = (params) => async (dispatch) => {
  try {
    const res = await RechargeService.getDailySummary(params);
    dispatch({type: RECHARGE_DAILY_SUMMARY, payload: res.data});
  } catch (err) {
    failLoad(dispatch, err);
  }
};
