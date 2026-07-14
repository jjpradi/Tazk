import {GET_ALL_PRE_ORDERS, CREATE_PRE_ORDERS, GET_ALL_CANCELLED_ORDERS, GET_SEARCH_CANCELLED_ORDERS, SET_SEARCH_PRE_ORDER, GET_SEARCH_PRE_ORDER} from '../actionTypes';
import PreOrderservice from '../../services/pre_order_services';
import {
  CreateAlert,
  DeleteAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
} from './load';

export const createPreOrderAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, successmsg) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PreOrderservice.create(data);
      if (res.status === 200) {
        CreateAlert(dispatch);
        // dispatch({
        //     type: CREATE_PRE_ORDERS,
        //     payload: res.data,
        // });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        successmsg(false);
      }
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listPreOrderAction =
  (payload, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PreOrderservice.getAll(payload);
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_PRE_ORDERS,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const CancelPreOrderAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, successmsg) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PreOrderservice.update(data.order_id, data);
      if (res.status === 200) {
        UpdateAlert(dispatch);
        // dispatch({
        //     type: CREATE_PRE_ORDERS,
        //     payload: res.data,
        // });
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        successmsg(false);
      }
      // return Promise.resolve(res.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getAllPreOrdersAction = (data, response) => async (dispatch) => {
  try {
    const res = await PreOrderservice.getAllPreOrders(data);
    dispatch({
      type: GET_ALL_CANCELLED_ORDERS,
      payload: res.data,
    });

    if (response) {
      response(res.data)
    }
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
}

export const setSearchPreOrderReportAction = (data) => {
  return {
    type: GET_ALL_CANCELLED_ORDERS,
    payload: data
  }
};

export const getSearchPreOrderReportAction = (val, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_CANCELLED_ORDERS,
    body: val,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};

export const setSearchPreOrderAction = (data) => {
  return {
    type: SET_SEARCH_PRE_ORDER,
    payload: data
  }
};

export const getSearchPreOrderAction = (val, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_PRE_ORDER,
    body: val,
    setModalTypeHandler,
    setLoaderStatusHandler
  }
};

// Backward-compatible alias used in older imports
export const ConvertPreOrder = CancelPreOrderAction;
