import {
    GET_NOTIFICATION_DATA,
    GETALL_NOTIFICATION,
    EDIT_NOTIFICATION,
    GET_UNREAD_NOTIFICATION,
    SELECT_ONDATA,
    GET_ENABLE_NTFY,
    NOTIFICATION_TOKEN,
    UPDATE_IS_READ,
    INDIVIDUAL_NOTIFICATION,
    UPDATE_INDIVIDUAL_NOTIFICATION,
    CLEAR_NOTIFICATION
  } from '../actionTypes';
//   import NotificationService from '../../services/manualNotes_services';
import NotificationService from '../../services/notification_services';
  import {
    ErrorAlert,
    FailLoad,
    ListLoad,
    successmsg,
    errormsg,
    CreateAlert,
    DeleteAlert,
    ExistAlert,
    UpdateAlert,
    NotificationClearAlert,
  } from './load';



  export const CreateNotificationAction =
  (data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await NotificationService.getntfydata(data);
      if (res.status === 200) {
        dispatch({
          type: GET_NOTIFICATION_DATA,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

  export const UpdateIsreadAction = (data,mode) => async (dispatch) => {
    try {
      const res = await NotificationService.updateIsread(data,mode);
      if (res.status === 200) {
        dispatch({
          type: UPDATE_IS_READ,
          payload: res.data,
        });
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };


  export const listNotificationAction =
  (data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await NotificationService.getAlldata(data);
      if (res.status === 200) {
        dispatch({
          type: GETALL_NOTIFICATION,
          payload: res.data,
        });
        return res.data
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

  export const clearNotificationAction =
  (data, response) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await NotificationService.clearNotificationData(data);
      if (res.status === 200) {
        // dispatch({
        //   type: GETALL_NOTIFICATION,
        //   payload: res.data,
        // });
        if(response){
          response(res.status)
        }
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };


  export const listunreadNtfyAction =
  (data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await NotificationService.getUnreaddata(data);
      if (res.status === 200) {
        dispatch({
          type:GET_UNREAD_NOTIFICATION ,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

  export const updateNotificationAction = (id, data) => async (dispatch) => {
    try {
      const res = await NotificationService.update(id, data);
      //  if (res.data.changedRows === 1)
      UpdateAlert(dispatch);
      dispatch({
        type: EDIT_NOTIFICATION,
        payload: res.data.data,
      });
      return Promise.resolve(res.data.data);
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject(err);
    }
  };

  export const SelectOnData = (data) => async (dispatch) => {
    dispatch({
      type: SELECT_ONDATA,
      payload: data,
    });
  };

  export const listenabledntfyAction =
  (data , resDate) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await NotificationService.enabledAction(data);
      if (res.status === 200) {
        dispatch({
          type:GET_ENABLE_NTFY ,
          payload: res.data,
        });

        resDate(res)
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

  export const updatedNtfyAction =
  (data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await NotificationService.updatedNtfy(data);
      if (res.status === 200) {
        dispatch({
          type:GET_ENABLE_NTFY ,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };


  
  export const getNotificationTokenAction =
  (data,cb) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await NotificationService.getNotificationToken(data);
      cb(res)
      if (res.status === 200) {
      
        dispatch({
          type: NOTIFICATION_TOKEN,
          payload: res.data,
        });
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
    }
  };

  export const getIndividualNotificationAction = (data) => async (dispatch) => {
    try {
      const res = await NotificationService.getIndividualNotification(data);
      if (res.status === 200) {
      
        dispatch({
          type: INDIVIDUAL_NOTIFICATION,
          payload: res.data,
        });
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

  export const updateIndividualNotificationAction = (data) => async (dispatch) => {
    try {
      const res = await NotificationService.updateIndividualNotification(data);
      if (res.status === 200) {
      
        dispatch({
          type: UPDATE_INDIVIDUAL_NOTIFICATION,
          payload: res.data,
        });
        UpdateAlert(dispatch);
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };

  export const updateClearedNotificationAction = (data) => async (dispatch) => {
    try {
      const res = await NotificationService.clearNotification(data);
      if (res.status === 200) {
      
        dispatch({
          type: CLEAR_NOTIFICATION,
          payload: res.data,
        });
        NotificationClearAlert(dispatch);
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };