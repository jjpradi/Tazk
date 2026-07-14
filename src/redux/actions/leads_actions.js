import {
  CREATE_LEADS,
  LIST_LEADS,
  GET_ID_LEADS,
  TOTAL_LEADS_COUNT,
  EDIT_LEADS,
  DELETE_LEADS,
  LIST_LEADS_BY_PAGINATION,
  GET_SEARCH_LEADS,
  SET_SEARCH_LEADS
} from '../actionTypes';
import Leadsservice from '../../services/leads_services';
import {
  DeleteAlert,
  ErrorAlert,
  FailLoad,
  ListLoad,
  UpdateAlert,
  CreateAlert,
} from './load';
import {createAction} from './actions';

export const createLeadsAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    // createAction(Leadsservice, CREATE_LEADS, dispatch, data, null, null,  setModalTypeHandler, setLoaderStatusHandler, sample)
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Leadsservice.create(data);
      if (res.status === 200) {
        dispatch({
          type: CREATE_LEADS,
          payload: res.data.data,
        });
        dispatch({
          type: TOTAL_LEADS_COUNT,
          payload: res.data.numRows,
        });
        if (sample) {
          sample(false);
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        CreateAlert(dispatch);
      } else {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        // alertResponce(res.data.status, 'error')
      }
      return Promise.resolve(res.data.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //  return Promise.reject(err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listLeadsAction =
  (setModalTypeHandler, setLoaderStatusHandler, exportDataCallBack) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Leadsservice.getAll();
      if (res.status === 200) {
        dispatch({
          type: LIST_LEADS,
          payload: res.data,
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
        //FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      //  }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listLeadsByPaginationAction =
  (setModalTypeHandler, setLoaderStatusHandler, data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Leadsservice.getByPagination(data);
      if (res.status === 200) {
        dispatch({
          type: LIST_LEADS_BY_PAGINATION,
          payload: res.data.data,
        });
        dispatch({
          type: TOTAL_LEADS_COUNT,
          payload: res.data.numRows,
        });
        //FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //  }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const getbyidLeadsAction = (id) => async (dispatch) => {
  try {
    const res = await Leadsservice.get(id);
    dispatch({
      type: GET_ID_LEADS,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    // if(err.response?.status === 500) {
    //   getbyidToken(Leadsservice, GET_ID_LEADS, dispatch, id)
    // }
    // else{
    ErrorAlert(dispatch, err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const updateLeadsAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Leadsservice.update(id, data);
      if (res.data.affectedRows === 1) UpdateAlert(dispatch);
      dispatch({
        type: EDIT_LEADS,
        payload: res.data.data,
      });
      dispatch({
        type: TOTAL_LEADS_COUNT,
        payload: res.data.numRows,
      });
      if (sample) {
        sample(false);
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //return Promise.reject(err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const updateInvoiceModelAction = (id, data) => async (dispatch) => {
  try {
    const res = await Leadsservice.invoiceupdate(id, data);
    // if (res.status=== 200)
    UpdateAlert(dispatch);
    dispatch({
      type: EDIT_LEADS,
      payload: res.data.data,
    });
    dispatch({
      type: TOTAL_LEADS_COUNT,
      payload: res.data.numRows,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    // if(err.response?.status === 500) {
    //   updateToken(Leadsservice, EDIT_LEADS, dispatch, data, id, alertResponce)
    // }
    // else{
    ErrorAlert(dispatch, err);
    //return Promise.reject(err);
    // }
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const deleteLeadsAction =
  (id, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Leadsservice.delete(id);
      // if (res.status === 200 && res.statusText === "OK")
      DeleteAlert(dispatch);
      dispatch({
        type: DELETE_LEADS,
        payload: res.data.data,
      });
      dispatch({
        type: TOTAL_LEADS_COUNT,
        payload: res.data.numRows,
      });

      if (sample) {
        sample(false);
      }
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data.data);
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // }
      return Promise.reject("API_FINISHED_ERROR");
    }
  };


//Leads Search.........................................................................

export const getSearchLeadsAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_LEADS,
    body,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
};

//state
export const setSearchLeadsAction = (data) => {
  return {
    type:SET_SEARCH_LEADS,
    payload:data
  }
};

export const leadsPaginationAction = (data) => async (dispatch) => {
  try {
    const res = await Leadsservice.pagination(data);
    dispatch({
      type: SET_SEARCH_LEADS,
      payload: res.data,
    });
    return Promise.resolve(res.data);
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

