import {
  CREATE_STOCK_LOCATION,
  LIST_STOCK_LOCATION,
  GET_ID_STOCK_LOCATION,
  EDIT_STOCK_LOCATION,
  DELETE_STOCK_LOCATION,
  ALL_LIST_STOCK_LOCATIN,
  LOCATION_TYPE,
  GET_ID_SOURCE_LOCATION,
  GET_ID_DESTINATION_LOCATION,
  GET_SEARCH_LOCATION,
  SET_SEARCH_LOCATION,
  GET_USER_LOCATIONS,
  GPS_LOCATION_ACTIVATION
} from '../actionTypes';
import StockLocationService from '../../services/stocklocation_services';
import {createAction, deleteAction, updateAction} from './actions';
import {
  ListLoad,
  FailLoad,
  ErrorAlert,
  CreateAlert,
  locationexists,
  successmsg,
  errormsg,
  UpdateAlert,
} from './load';
import { updateAccessToken } from 'pages/common/login/cookies';

export const createStockLocationAction =
  (
    data,
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
  ) =>
  async (dispatch) => {
    // createAction(StockLocationService, CREATE_STOCK_LOCATION, dispatch, data,  null, null, setModalTypeHandler, setLoaderStatusHandler, sample)
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await StockLocationService.create(
        data,
        employee_id,
        headerLocationId,
      );
      // if (res.data.affectedRows === 1) 
      if(res.data.status === 'Location Code Exists' || res.data.status === 'Location Name Exists'){
        locationexists(dispatch, res.data.status)

      }else{
        CreateAlert(dispatch);
        // dispatch({
        //   type: GET_USER_LOCATIONS,
        //   payload: res.data.accessToken,
        // });
        updateAccessToken(res.data.accessToken)
        // dispatch({
        //   type: CREATE_STOCK_LOCATION,
        //   payload: res.data.data,
        // });
        successmsg(sample);
      }
      // else if (res.status === 200 && res.data.status === 'Location Code Exists' ||res.status === 200 && res.data.status === 'Location Name Exists'){
      //   locationexists(dispatch, res.data.status)

      // }
      
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      errormsg(sample);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listStockLocationAction =
  (
    employee_id,
    headerLocationId,
    setModalTypeHandler,
    setLoaderStatusHandler,
    exportDataCallBack
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await StockLocationService.getAll(
        employee_id,
        headerLocationId,
      );
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: LIST_STOCK_LOCATION,
          payload: res.data,
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
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

export const listStockLocationSequenceAction =
  (data, setLoaderStatusHandler, employee_id, headerLocationId) =>
  async (dispatch) => {
    try {
      // ListLoad(true, setLoaderStatusHandler);
      const res = await StockLocationService.getAllSequence(
        employee_id,
        headerLocationId,
        data,
      );
      if (res.status === 200) {
        dispatch({
          type: LIST_STOCK_LOCATION,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      // FailLoad(true, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(true, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getbyidStockLocationAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await StockLocationService.get(id);
      dispatch({
        type: GET_ID_STOCK_LOCATION,
        payload: res.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getbyidToken(StockLocationService, GET_ID_STOCK_LOCATION, dispatch, id)
      // }
      // else{
      // FailLoad(setModalTypeHandler.setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updateStockLocationAction =
  (
    id,
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    employee_id,
    headerLocationId,
    type
  ) =>
  async (dispatch) => {
    // updateAction(StockLocationService, EDIT_STOCK_LOCATION, dispatch, id, data,setModalTypeHandler,setLoaderStatusHandler,sample )
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await StockLocationService.update(id, data);
      // if (res.data.changedRows === 1)
      if(res.data.status === 'Location Name Exists' || res.data.status === 'Location Code Exists'){
        locationexists(dispatch, res.data.status)
      }
      else{
        if(type !== 'detailpage') {
          // UpdateAlert(dispatch);
        } 
        dispatch({
          type: EDIT_STOCK_LOCATION,
          payload: res.data.data,
        });
        if(type !== 'detailpage') {
          successmsg(sample);
        }
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      errormsg(sample);
      return Promise.reject(err);
      // }
    }
  };

export const deleteStockLocationAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    return deleteAction(
      StockLocationService,
      DELETE_STOCK_LOCATION,
      dispatch,
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    );
    // try {
    //   ListLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   const res = await StockLocationService.delete(id);
    //   if (res.status === 200 && res.statusText === "OK")
    //   DeleteAlert(dispatch)
    //   dispatch({
    //     type: DELETE_STOCK_LOCATION,
    //     payload: res.data.data,
    //   });
    //   FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   return Promise.resolve(res.data.data);
    // } catch (err) {
    //   FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    //   ErrorAlert(dispatch,err)
    //   // }
    // }
  };

export const allListStockLocation =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await StockLocationService.getAlllist();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: ALL_LIST_STOCK_LOCATIN,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const location_typeAction =
  () =>
  async (dispatch) => {
    try {
      // ListLoad(true, setLoaderStatusHandler);
      const res = await StockLocationService.getlocation_type();
      if (res.status === 200) {
        dispatch({
          type: LOCATION_TYPE,
          payload: res.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
      // FailLoad(true, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(true, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


  export const getsourcelocationAction =
  (headerLocationId) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await StockLocationService.get_source(headerLocationId);
      dispatch({
        type: GET_ID_SOURCE_LOCATION,
        payload: res.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getbyidToken(StockLocationService, GET_ID_STOCK_LOCATION, dispatch, id)
      // }
      // else{
      // FailLoad(setModalTypeHandler.setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const getdestinationAction =
  () => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await StockLocationService.get_destination();
      dispatch({
        type: GET_ID_DESTINATION_LOCATION,
        payload: res.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getbyidToken(StockLocationService, GET_ID_STOCK_LOCATION, dispatch, id)
      // }
      // else{
      // FailLoad(setModalTypeHandler.setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
export const updateDefaultLocation =
  (data) => async (dispatch) => {
    try {
      const res = await StockLocationService.updateDefaultLocation(data);
      if(res.data === "Can't able to delete location"){
      ErrorAlert(dispatch, {message: res.data});
        }else{
      dispatch({
        type: SET_SEARCH_LOCATION,
        payload: res.data,
      });
      dispatch({
        type: GET_USER_LOCATIONS,
        payload: res.data.data,
      });
    }
      
      return Promise.resolve(res.data);
    } catch (err) {

      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const get_SearchlocationAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_LOCATION,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };
  
  
  export const set_SearchlocationAction = (data) => {
    return {
      type:SET_SEARCH_LOCATION,
      payload:data
    }
  };

  export const stockLocationPaginationAction = (data) => async (dispatch) => {
    try {
      const res = await StockLocationService.pagination(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_LOCATION,
          payload: res.data,
        });
        dispatch({
          type: GET_USER_LOCATIONS,
          payload: res.data.data,
        });
        return Promise.resolve("API_FINISHED_SUCCESS");
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

   export const getGpsLocationActivationAction =
  () => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await StockLocationService.getGpsLocationActivation();
      dispatch({
        type: GET_ID_DESTINATION_LOCATION,
        payload: res.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getbyidToken(StockLocationService, GET_ID_STOCK_LOCATION, dispatch, id)
      // }
      // else{
      // FailLoad(setModalTypeHandler.setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };