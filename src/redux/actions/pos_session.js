import {
  LIST_POSSESSION,
  SET_PAYMENT_MODES,
  SET_PAYMENT_PREORDER_MODES,
  POS_USER_DASHBOARD_CASHINHAND,
  SET_INITIAL_FREQUENTLY_FILTER,
  SET_FREQUENTLY_FILTERED_BY_POS_ID
} from '../actionTypes';
import PosSessionService from '../../services/pos_session';
import {FailLoad, ListLoad} from './load';
import DB from '../../db';

var db = new DB('pos_session');

export const listPosSessionAction =
  (id, headerLocationId, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSessionService.getAll(id, headerLocationId);
      dispatch({
        type: LIST_POSSESSION,
        payload: res.data,
      });
      res.data?.map(async (d) => {
        await db.deleteOfflineApi(d.posId, d.sales_data);
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const UpdataPosSessionAction =
  (
    id,
    data,
    employeeId,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    resStatus,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSessionService.update(
        id,
        data,
        employeeId,
        headerLocationId,
      );
      dispatch({
        type: LIST_POSSESSION,
        payload: res.data.data,
      });
      if (resStatus) {
        resStatus(res.status);
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const PosLastSyncUpdate =
  (
    id,
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    result,
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSessionService.posLastSyncUpdate(
        id,
        data,
        employee_id,
        headerLocationId,
      );
      dispatch({
        type: LIST_POSSESSION,
        payload: res.data.data,
      });
      if (result) {
        result(true, res.data.data);
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const ListPaymentModesAction =
  (redirect, posId, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSessionService.getPaymentModes(posId);
      dispatch({
        type: SET_PAYMENT_MODES,
        payload: {data: res.data, redirect},
        posId,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const PreOrderListPaymentModesAction =
  (redirect, posId, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSessionService.getPreOrderPaymentModes(posId);
      dispatch({
        type: SET_PAYMENT_PREORDER_MODES,
        payload: {data: res.data, redirect},
        posId,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const PosGetByIdAction =
  (posId, s_id, checkSessionStatus, filtereddata) => async () => {
    try {
      const res = await PosSessionService.getById(posId, filtereddata);

      if (res && res.data && res.data.length > 0) {
        const {status} = res.data[0];

        if ((status && status === 'closed') || status === 'new')
          checkSessionStatus(posId, s_id, true);
        else checkSessionStatus(posId, s_id, false);
      } else checkSessionStatus(posId, s_id, false);

      // dispatch({
      //     type: SET_PAYMENT_MODES,
      //     payload: {data: res.data, redirect},
      //     posId
      // });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  export const getPosUserDashBoardCashInHandAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await PosSessionService.getPosUserDashBoardCashInHand(data);
      dispatch({
        type: POS_USER_DASHBOARD_CASHINHAND,
        payload: res.data.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const setFrequentlyFilteredAction = (data) => {
  return{
    type: SET_INITIAL_FREQUENTLY_FILTER,
    payload: data
  }
}

export const setFrequentlyFilteredByPosId = (data, posId) => {
  return{
    type: SET_FREQUENTLY_FILTERED_BY_POS_ID,
    payload: {data: data, posId: posId}
  }
}