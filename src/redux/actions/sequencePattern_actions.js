import {
   GET_SEQUENCE_DATA,
   DELETE_SEQUENCE_DATA,
   UPDATE_SEQUENCE_DATA,
   CREATE_SEQUENCE_DATA,
   GET_SEQUENCE_BASED_ON_NAME,
  } from '../actionTypes';
  import sequencePattern_service from '../../services/sequencePattern_service'
  import DB from '../../db';
  import {
    CreateAlert,
    ErrorAlert,
    FailLoad,
    ListLoad,
    UpdateAlert,
    successmsg,
    errormsg,
    DeleteAlert,
    MailAlert,
  } from './load';
  import {deleteAction} from './actions';
  import Productservice from '../../services/product_services';
  // import { rearg } from 'lodash';
  // import BarcodeDialog from '../../pages/sales/barcodeDialog'
  
  var db = new DB('pos_session');


  export const listSequenceDataAction =
  (
    headerLocationId,
    exportDataCallBack
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await sequencePattern_service.getSequenceData(headerLocationId);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: GET_SEQUENCE_DATA,
          payload: res.data,
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      // }
    }
  };

  export const sequenceBasedOnNameAction =
  (
   data
  ) =>
  async (dispatch) => {
    try {
      console.log("1111",data)
      const res = await sequencePattern_service.getSequenceBasedOnName(data);
      if (res.status === 200) {
        dispatch({
          type: GET_SEQUENCE_BASED_ON_NAME,
          payload: res.data,
        });
      
      }    
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
     
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      // }
    }
  };


  export const deleteListSequenceDataAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await sequencePattern_service.delete(id);
      if (res.status === 200) {
        DeleteAlert(dispatch);
        dispatch({
          type: GET_SEQUENCE_DATA,
          payload: res.data,
        });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      ErrorAlert(dispatch, err);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    }
  };

  export const updateSequenceDataAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    //  updateAction(Schemesservice, EDIT_SCHEMES, dispatch, id, data,setModalTypeHandler,setLoaderStatusHandler)
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await sequencePattern_service.update(id, data);
      if (res.status === 200 ) {
        UpdateAlert(dispatch);
        dispatch({
          type: GET_SEQUENCE_DATA,
          payload: res.data,
        });
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // return Promise.resolve(res.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //   return Promise.reject(err);
    }
  };

  export const createSequenceDataAction =
  (id,data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await sequencePattern_service.create(id,data);
      if (res.status === 200) {
        CreateAlert(dispatch);
        dispatch({
          type: GET_SEQUENCE_DATA,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
