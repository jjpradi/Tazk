import {CASH_FLOW, LIST_ACCOUNTSLEDGER, TRIAL_BALANCE} from '../actionTypes';
import accountsLedgerService from '../../services/accountsLedger';
import _ from 'lodash';
import {getToken} from './common_actions';
import {
  ListLoad,
  FailLoad,
  UpdateAlert,
  ErrorAlert,
  CreateAlert,
  DeleteAlert,
} from './load';

export const listAccountsLedgerAction = () => async (dispatch) => {
  try {
    const res = await accountsLedgerService.getAll();
    dispatch({
      type: LIST_ACCOUNTSLEDGER,
      payload: res.data,
    });
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const cashFlowAction = () => async (dispatch) => {
  try {
    const res = await accountsLedgerService.getcashFlow();
    dispatch({
      type: CASH_FLOW,
      payload: res,
    });
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const trailBalanceAction = () => async (dispatch) => {
  try {
    const res = await accountsLedgerService.getTrailBalance();
    dispatch({
      type: TRIAL_BALANCE,
      payload: res,
    });
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};
