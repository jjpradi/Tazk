import {
  ALL_EMP,
  GET_BY_SALES_STATUS_ON_HOLD,
  GET_BY_SALES_STATUS_READY_TO_SHIP,
  GET_INVOICE_DATE_FILTER_DATA,
  SET_STATUS_IN_TRANSIT,
} from '../actionTypes';
import soTrackingservices from '../../services/soTracking_services';
import {ErrorAlert, FailLoad, ListLoad} from './load';

export const getBySalesStatusOnHoldAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await soTrackingservices.getByStatus(1);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: GET_BY_SALES_STATUS_ON_HOLD,
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

  export const getBySalesStatusOnHoldActionByPagination =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await soTrackingservices.getByStatusByPagination(1, data);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: GET_BY_SALES_STATUS_ON_HOLD,
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

export const getBySalesStatusReadyToShipAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await soTrackingservices.getByStatus(2);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: GET_BY_SALES_STATUS_READY_TO_SHIP,
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

export const getInvoiceDateFilterAction =
  (from, to,cust_id,data ,setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await soTrackingservices.getInvoiceDateFilter(from, to,cust_id,data);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: GET_INVOICE_DATE_FILTER_DATA,
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

  export const getAllBySalesStatusfilter =
  (data) =>
  async (dispatch) => {
    try {
      const res = await soTrackingservices.getAllBySalesfilter(data);
      if (res.status === 200) {
        dispatch({
          type: GET_BY_SALES_STATUS_ON_HOLD,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const setStatusInTransitAction =
  (data, setModalTypeHandler, setLoaderStatusHandler,response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await soTrackingservices.setStatusInTransit(data);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: SET_STATUS_IN_TRANSIT,
          payload: res.data,
        });
      }
      if (response) {
          response(res.status)
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
  export const updateStatusAction =
  (data,setModalTypeHandler, setLoaderStatusHandler, response) => async (dispatch) => {
    try {
      const res = await soTrackingservices.updateStatus(data);
      //const res1 = await soTrackingservices.getInvoiceDateFilter(from, to);
      if (res.status === 200) {
        dispatch({
          type: SET_STATUS_IN_TRANSIT,
          payload: res.data,
        });
      }
      if(response){
        response(res.data)
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getAllemployeeincludingAdminAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await soTrackingservices.getAllemployee();
      //const res1 = await soTrackingservices.getInvoiceDateFilter(from, to);
      if (res.status === 200) {
        dispatch({
          type: ALL_EMP,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };