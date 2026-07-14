import {
  LIST_BALANCESHEET,
  LIST_ACCOUNTS_BALANCESHEET,
  TOTAL_BALANCESHEET_COUNT,
  GROUP_NAME,
  LIST_BALANCE_PROFITS
} from '../actionTypes';
import Balancesheetservice from '../../services/balancesheet_services';
import {ErrorAlert, FailLoad, ListLoad} from './load';

export const listBalancesheetAction =
  (from, to, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Balancesheetservice.getAll(from, to);
      if (res.status === 200) {
        dispatch({
          type: LIST_BALANCESHEET,
          payload: res.data,
        });
       
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getlimitdatafrombalancesheet =
  (setModalTypeHandler, setLoaderStatusHandler, data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Balancesheetservice.getpaginationdata(data);
      if (res.status === 200) {
        dispatch({
          type: LIST_BALANCESHEET,
          payload: res.data.data,
        });
        dispatch({
          type: TOTAL_BALANCESHEET_COUNT,
          payload: res.data.numRows,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listBalancesheetdateAction = (from, to) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
    const res = await Balancesheetservice.getDate(from, to);
    if (res.status === 200) {
      dispatch({
        type: LIST_BALANCESHEET,
        payload: res.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    }

    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const listBalancesheetAccountsAction =
  (from, to, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Balancesheetservice.getaccounts(from, to);
      if (res.status === 200) {
        dispatch({
          type: LIST_ACCOUNTS_BALANCESHEET,
          payload: res.data,
        });
        dispatch({
          type: GROUP_NAME,
          payload: res.data[0]?.account,
        });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const listBalancesheetProfitAction =
  (from, to, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Balancesheetservice.getbalanceprofit(from, to);
      if (res.status === 200) {
        dispatch({
          type: LIST_BALANCE_PROFITS,
          payload: res.data,
        });
       
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
