import {
  GET_ADVANCE_SHEET,
  UPDATE_ADVANCE_SHEET,
  GET_ADVANCE_AFTER,
  GET_CHILD_DATA,
  CREATE_ADVANCE_SHEET
  } from '../actionTypes';
  import Advancesheetservice from '../../services/advancesheet_services';
  import {CreateAlert, ErrorAlert, FailLoad, ListLoad} from './load';
  
  export const listAdvancesheetAction =
    (data, setModalTypeHandler, setLoaderStatusHandler) =>
    async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await Advancesheetservice.getAll(data);
        if (res.status === 200) {
          dispatch({
            type: GET_ADVANCE_SHEET,
            payload: res.data,
          });
         
          // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      } catch (err) {
        // /FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
        //}
        return Promise.reject("API_FINISHED_ERROR");
      }
    };

    export const listAdvanceafterDetails =
    (data, setModalTypeHandler, setLoaderStatusHandler) =>
    async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await Advancesheetservice.getAfter(data);
        if (res.status === 200) {
          dispatch({
            type: GET_ADVANCE_AFTER,
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

    export const listAdvancechildDetails =
    (data, setModalTypeHandler, setLoaderStatusHandler) =>
    async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await Advancesheetservice.getChild(data);
        if (res.status === 200) {
          dispatch({
            type: GET_CHILD_DATA,
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

    export const UpdateAdvancesheetAction =
    (id,data, setModalTypeHandler, setLoaderStatusHandler) =>
    async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await Advancesheetservice.update(id,data);
        if (res.status === 200) {
          dispatch({
            type: UPDATE_ADVANCE_SHEET,
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

    export const createAdvanceSheet =
    (data) =>
    async (dispatch) => {
      try {
        // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
        const res = await Advancesheetservice.create(data);
        if (res.status === 200) {
          dispatch({
            type: CREATE_ADVANCE_SHEET,
            payload: res.data,
          });
         
          // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
          CreateAlert(dispatch)
        }
      } catch (err) {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        ErrorAlert(dispatch, err);
      }
    };