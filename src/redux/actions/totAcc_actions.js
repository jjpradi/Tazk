import {TOT_PAYABLE_RECEIVABLE, AGING_RECEIVABLE, AGING_PAYABLE,LIST_PAYABLE_DUE_DAYS,LIST_PAYABLE_OUTSTANDING, TOTAL_PAYABLE, TOTAL_ACCOUNTS_PAYABLE, TOTAL_ACCOUNTS_RECEIVABLE, TOTAL_RECEIVABLE} from '../actionTypes';
import TotAccservice from '../../services/totAcc_dashboard';
import {ErrorAlert, FailLoad, ListLoad} from './load';

export const getTotAccDetails =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await TotAccservice.get();
      if (res.status === 200) {
        dispatch({
          type: TOT_PAYABLE_RECEIVABLE,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");

      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      return Promise.reject("API_FINISHED_ERROR");

  }
}
  export const List_Aging_receivables = (headerLocationId) => async (dispatch) => {
    try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await TotAccservice.getAging(headerLocationId);
        if (res.status === 200) {
            dispatch({
                type: AGING_RECEIVABLE,
                payload: res.data,
            });
            return Promise.resolve("API_FINISHED_SUCCESS");

        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    } catch (err) {
        ErrorAlert(dispatch, err)
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.reject("API_FINISHED_ERROR");

    }
  }
  export const List_Aging_payable = (headerLocationId) => async (dispatch) => {
    try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
        const res = await TotAccservice.getAgingPayable(headerLocationId);
        if (res.status === 200) {
            dispatch({
                type: AGING_PAYABLE,
                payload: res.data,
            });
            return Promise.resolve("API_FINISHED_SUCCESS");

        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    } catch (err) {
        ErrorAlert(dispatch, err)
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
        return Promise.reject("API_FINISHED_ERROR");

    }
  }

  export const getpayable_dueAction = (setLoaderStatusHandler) => async (dispatch) => {
    try {
        // ListLoad(true, setLoaderStatusHandler)
        const res = await TotAccservice.getpayableduedays();
        if (res.status === 200) {
            dispatch({
                type: LIST_PAYABLE_DUE_DAYS,
                payload: res.data,
            });
        }
        // FailLoad(true,setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err)
        // FailLoad(true,setLoaderStatusHandler)
        return Promise.reject("API_FINISHED_ERROR");
    }
  }
  
  export const getpayable_outstanding = (setLoaderStatusHandler) => async (dispatch) => {
    try {
        // ListLoad(true, setLoaderStatusHandler)
        const res = await TotAccservice.getpayableoutStand();
        if (res.status === 200) {
            dispatch({
                type: LIST_PAYABLE_OUTSTANDING,
                payload: res.data,
            });
        }
        // FailLoad(true,setLoaderStatusHandler)
        return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
        ErrorAlert(dispatch, err)
        // FailLoad(true,setLoaderStatusHandler)
        return Promise.reject("API_FINISHED_ERROR");
    }
}
  
export const totalPayableAction = (headerLocationId) => async (dispatch) => {
  try {
    const res = await TotAccservice.totalPayable(headerLocationId);
    if (res.status === 200) {
      dispatch({
        type: TOTAL_PAYABLE,
        payload: res.data,
      });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err)
    return Promise.reject("API_FINISHED_ERROR");
  }
}

export const totalAccountsPayableAction = (headerLocationId) => async (dispatch) => {
  try {
    const res = await TotAccservice.totalAccountsPayable(headerLocationId);
    if (res.status === 200) {
      dispatch({
        type: TOTAL_ACCOUNTS_PAYABLE,
        payload: res.data,
      });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err)
    return Promise.reject("API_FINISHED_ERROR");
  }
}

export const totalAccountsReceivableAction = (headerLocationId) => async (dispatch) => {
  try {
    const res = await TotAccservice.totalAccountsReceivable(headerLocationId);
    if (res.status === 200) {
      dispatch({
        type: TOTAL_ACCOUNTS_RECEIVABLE,
        payload: res.data,
      });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err)
    return Promise.reject("API_FINISHED_ERROR");
  }
}

export const totalReceivableAction = (headerLocationId) => async (dispatch) => {
  try {
    const res = await TotAccservice.totalReceivable(headerLocationId);
    if (res.status === 200) {
      dispatch({
        type: TOTAL_RECEIVABLE,
        payload: res.data,
      });
    }
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err)
    return Promise.reject("API_FINISHED_ERROR");
  }
}
  