import {LIST_SPECIALPERMISSION, CREATE_SPECIALPERMISSION, GET_BY_ID_SPECIALPERMISSION, UPDATE_SPECIALPERMISSION, DELETE_SPECIALPERMISSION, GET_SEARCH_SPECIALPERMISSION, SET_SEARCH_SPECIALPERMISSION, GET_SPL_PERMISSION_CREATED_YEARS} from '../actionTypes';
import specialPermission_services from 'services/specialPermission_services';
import {
  ListLoad,
  FailLoad,
  ErrorAlert,
  CreateAlert,
  successmsg,
  errormsg,
  UpdateAlert,
  DeleteAlert
} from './load';
import { deleteAction} from './actions';

export const ListSpecialPermissions =
  ( setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await specialPermission_services.getAll();
      if (res.status === 200) {
        dispatch({
          type: LIST_SPECIALPERMISSION,
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


  export const CreateSpecialPermissions =
  (
   
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await specialPermission_services.create(data);
      if (res.data.changedRows === 1) CreateAlert(dispatch);
      dispatch({
        type: SET_SEARCH_SPECIALPERMISSION,
        payload: res.data,
      });
      successmsg(sample);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      errormsg(sample);
      return Promise.reject(err);
      // }
    }
  };


  export const getbyidSpecialPermissionAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await specialPermission_services.getbyid(id);
      dispatch({
        type: GET_BY_ID_SPECIALPERMISSION,
        payload: res.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // if(err.response?.status === 500) {
      //   getbyidToken(specialPermission_services.getbyid GET_ID_STOCK_LOCATION, dispatch, id)
      // }
      // else{
      // FailLoad(setModalTypeHandler.setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const UpdateSpecialPermission =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await specialPermission_services.update(data);
      if (res.data.changedRows === 1) UpdateAlert(dispatch);
      dispatch({
        type: SET_SEARCH_SPECIALPERMISSION,
        payload: res.data,
      });
      successmsg(sample);
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      errormsg(sample);
      return Promise.reject(err);
      // }
    }
  };

  export const DeleteSpecialPermission =
  (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
   
  ) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await specialPermission_services.delete(data);
      if (res.data.changedRows === 1) DeleteAlert(dispatch);
      dispatch({
        type: SET_SEARCH_SPECIALPERMISSION,
        payload: res.data,
      });
      
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
 
      return Promise.reject(err);
      // }
    }
  };

  export const setSearchSpecialPermission = (data) => {
    return {
      type: SET_SEARCH_SPECIALPERMISSION,
      payload: data
    }
  };
  
  export const getSearchSpecialPermissionAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_SPECIALPERMISSION,
      body,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };

  export const getSpecialPermissionCreatedYearsAction = ( setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await specialPermission_services.getSpecialPermissionCreatedYears();
      if (res.status === 200) {
        dispatch({
          type: GET_SPL_PERMISSION_CREATED_YEARS,
          payload: res.data,
        });
        return Promise.resolve(res.data);
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };
  