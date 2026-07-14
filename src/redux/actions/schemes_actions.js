import {
  CREATE_SCHEMES,
  LIST_SCHEMES,
  GET_ID_SCHEMES,
  EDIT_SCHEMES,
  DELETE_SCHEMES,
  DASHBOARD_DATA_SCHEMES,
  GET_SEARCH_SCHEMES_DATA,
  SET_SEARCH_SCHEMES,
  GET_STATUS,
  SCHEMES_RECEIVABLES,
  SET_SCHEMES_RECEIVABLES
} from '../actionTypes';
import Schemesservice from '../../services/schemes_services';
import {
  CreateAlert,
  DeleteAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  ExistAlert,
} from './load';
// import { updateAction } from './actions';

export const createSchemesAction =
  (data, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Schemesservice.create(data);
      if(res.data.status === 'exists'){
        ExistAlert(dispatch);
      }
      if (res.status === 200 && res.data.status !== 'exists') {
        CreateAlert(dispatch);
        dispatch({
          type: SET_SEARCH_SCHEMES,
          payload: res,
        });
        // callback()
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      } else if (res.data.status === 'exists') {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        // alertResponce("Already Exists", 'error')
      }
      return Promise.resolve(res.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const schemesStatusAction =
  (data) => async (dispatch) => {
    try {
      const res = await Schemesservice.getStatus(data);
      if (res.status === 200) {
        dispatch({
          type: GET_STATUS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listSchemesAction =
  (setModalTypeHandler, setLoaderStatusHandler,exportDataCallBack,) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Schemesservice.getAll();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: LIST_SCHEMES,
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
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getbyidSchemesAction = (id) => async (dispatch) => {
  try {
    const res = await Schemesservice.get(id);
    dispatch({
      type: GET_ID_SCHEMES,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    // if (err.response?.status === 500) {
    //     getbyidToken(Schemesservice, GET_ID_SCHEMES, dispatch, id)
    // }
    // else {
    ErrorAlert(dispatch, err);
    // }
  }
};

export const updateSchemesAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler,callback) =>
  async (dispatch) => {
    //  updateAction(Schemesservice, EDIT_SCHEMES, dispatch, id, data,setModalTypeHandler,setLoaderStatusHandler)
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Schemesservice.update(id, data);
      if(res.data.status === 'exists'){
        ExistAlert(dispatch);
      }
      if (res.status === 200 && res.data.length > 0) {
      
      dispatch({
        type: EDIT_SCHEMES,
        payload: res.data,
      });
      UpdateAlert(dispatch);
      callback();
    }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      // return Promise.resolve(res.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //   return Promise.reject(err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const deleteSchemesAction =
  (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Schemesservice.delete(id);
      if (res.status === 200 && res.statusText === 'OK') DeleteAlert(dispatch);
      dispatch({
        type: SET_SEARCH_SCHEMES,
        payload: res,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      //   return Promise.resolve(res.data.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listDashBoardSchemesAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Schemesservice.getSchemesDashBoard();
      dispatch({
        type: DASHBOARD_DATA_SCHEMES,
        payload: res.data,
      });
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // if (err.response?.status === 500) {
      //     getToken(Schemesservice, DASHBOARD_DATA_SCHEMES, dispatch)
      // } else {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  //search schemes actions
  export const searchSchemesAction = (val,setModalTypeHandler, setLoaderStatusHandler) => {
    return {
      type: GET_SEARCH_SCHEMES_DATA,
      data: val,
      setModalTypeHandler,
      setLoaderStatusHandler
    }
  };
  
  export const set_searchSchemesAction = (data) => {
    return {
      type: SET_SEARCH_SCHEMES,
      payload: data
    }
};
  
export const schemesPaginationAction = (data) => async (dispatch) => {
  try {
    const res = await Schemesservice.pagination(data);
    if (res.status === 200) {
      dispatch({
        type: SET_SEARCH_SCHEMES,
        payload: res,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const schemesReceivablesAction = (data) => async (dispatch) => {
  try {
    const res = await Schemesservice.schemesReceivables(data);
    if (res.status === 200) {
      dispatch({
        type: SCHEMES_RECEIVABLES,
        payload: res.data,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const getSchemesReceivablesAction = (data) => {
    return {
        type : SCHEMES_RECEIVABLES,
        payload : data
    }
}

export const setSchemesReceivablesAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
    return {
        type : SET_SCHEMES_RECEIVABLES,
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
    }
}