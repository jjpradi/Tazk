import {
  GET_ALL_ERROR_DASHBOARD_LIST,
  CREATE_ERROR_LOG,
  GET_DEVELOPERS_DETAILS,
  UPDATE_ASSIGN_ERROR,
  REMOVE_ASSIGN,
  STATUS_CHANGE,
  EMP_DOCUMENTS_EMAIL
} from '../actionTypes';
import ErrorDashboards from '../../services/errorDashboard_services';
import {
  CreateAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  DeleteAlert,
  errorAlertAction,
  AssignedAlert,
  MailAlert,
  FailedMailAlert,
} from './load';

export const listErrorDashboardAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, response) =>
  async (dispatch) => {
    try {
      //   ListLoad(setModalTypeHandler, setLoaderStatusHandler);

      const res = await ErrorDashboards.getAll(data);
      if (res.status === 200) {
        dispatch({
          type: GET_ALL_ERROR_DASHBOARD_LIST,
          payload: res.data,
        });
      }
      if (res.status !== 200) {
        response(res.status, res);
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      if (err.response) {
        // Access the status code and handle the error
        const statusCode = err.response.status;
        response(err.response);
      }
      ErrorAlert(dispatch, err);
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const updateErrorLogAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await ErrorDashboards.create(data);
      if (res.status === 200) {
        ///UpdateAlert(dispatch);
        dispatch({
          type: CREATE_ERROR_LOG,
          payload: res.data,
        });
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      // ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

export const getDevelopersDetailsAction = () => async (dispatch) => {
  try {
    const res = await ErrorDashboards.get();
    if (res.status === 200) {
      ///UpdateAlert(dispatch);
      dispatch({
        type: GET_DEVELOPERS_DETAILS,
        payload: res.data,
      });
    }
    return Promise.resolve('API_FINISHED_SUCCESS');
  } catch (err) {
    // ErrorAlert(dispatch, err);
    return Promise.reject('API_FINISHED_ERROR');
  }
};

export const updateAssignerror = (data) => async (dispatch) => {
  try {
    const res = await ErrorDashboards.assignError(data);
    if (res.status === 200) {
      AssignedAlert(dispatch);
      dispatch({
        type: UPDATE_ASSIGN_ERROR,
        payload: res.data,
      });
    }
    return Promise.resolve('API_FINISHED_SUCCESS');
  } catch (err) {
    // ErrorAlert(dispatch, err);
    return Promise.reject('API_FINISHED_ERROR');
  }
};

export const removeAssign =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await ErrorDashboards.remove(data);
      if (res.status === 200) {
        ///UpdateAlert(dispatch);
        dispatch({
          type: REMOVE_ASSIGN,
          payload: res.data,
        });
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      // ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

  export const statusChange =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await ErrorDashboards.change(data);
      if (res.status === 200) {
        ///UpdateAlert(dispatch);
        dispatch({
          type: STATUS_CHANGE,
          payload: res.data,
        });
      }
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      // ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };

  export const sendMailErrorsAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      const res = await ErrorDashboards.sendMail(data);
      if (res.status === 200) {
        dispatch({
          type: EMP_DOCUMENTS_EMAIL,
          payload: res,
        });
      }
      console.log("vccvcc",res);
      if(res.data.response_code === 404){
        FailedMailAlert(dispatch);
      }else{
        MailAlert(dispatch);
      }
      
      return Promise.resolve('API_FINISHED_SUCCESS');
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject('API_FINISHED_ERROR');
    }
  };
