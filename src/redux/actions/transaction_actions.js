import {
  CREATE_TRANSACTION,
  LIST_TRANSACTION,
  GET_ID_TRANSACTION,
  TOTAL_TRANSACTION_COUNT,
  EDIT_TRANSACTION,
  DELETE_TRANSACTION,
  LIST_TRANSACTION_BY_PAGINATION,
  EXPORT_LIST,
  GET_SEARCH_TRANSACTION,
  SET_SEARCH_TRANSACTION
} from '../actionTypes';
import Transactionservice from '../../services/transaction_services';
import {
  ErrorAlert,
  FailLoad,
  ListLoad,
  CreateAlert,
  UpdateAlert,
  DeleteAlert,
} from './load';
import {createAction, deleteAction, updateAction} from './actions';

export const createTransactionAction =
  (data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    // createAction(Transactionservice, CREATE_TRANSACTION, dispatch, data, null, null,  setModalTypeHandler, setLoaderStatusHandler, sample)

    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Transactionservice.create(data);

      if (res.status === 200) {
        dispatch({
          type: CREATE_TRANSACTION,
          payload: res.data.data,
        });
        dispatch({
          type: TOTAL_TRANSACTION_COUNT,
          payload: res.data.numRows,
        });
        if (sample) {
          sample(false,res.data?.createStatus || {});
        }
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
        CreateAlert(dispatch);
      } else {
        // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }

      // return Promise.resolve(res.data.data);
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      // FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // return Promise.reject(err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listTransactionAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Transactionservice.getAll();
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: LIST_TRANSACTION,
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

  export const ExportListACTION =
  (setModalTypeHandler, setLoaderStatusHandler, from, to, exportDataCallBack) => async (dispatch) => {
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Transactionservice.exportData(from, to);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: EXPORT_LIST,
          payload: res.data,
        });
        if (exportDataCallBack) {
          exportDataCallBack(res.data);
        }
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      if (exportDataCallBack) {
        exportDataCallBack([]);
      }
      ErrorAlert(dispatch, err);
      //}
    }
  };

export const listTransactionByPaginationAction =
  (setModalTypeHandler, setLoaderStatusHandler, data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Transactionservice.getByPagination(data);
      //  let rem = await res.data.map((m) => {
      //   return delete m['tableData'] ? m :null
      // }).filter( (f) => f !==null )
      if (res.status === 200) {
        dispatch({
          type: LIST_TRANSACTION_BY_PAGINATION,
          payload: res.data.data,
        });
        dispatch({
          type: TOTAL_TRANSACTION_COUNT,
          payload: res.data.numRows,
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

export const getbyidTransactionAction = (id, setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
  ListLoad(setModalTypeHandler, setLoaderStatusHandler);
  try {
    const res = await Transactionservice.get(id);
    dispatch({
      type: GET_ID_TRANSACTION,
      payload: res.data,
    });
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    return Promise.resolve(res.data);
  } catch (err) {
    FailLoad(setModalTypeHandler, setLoaderStatusHandler);
    // if (err.response?.status === 500) {
    //   getbyidToken(Transactionservice, GET_ID_TRANSACTION, dispatch, id)
    // }
    // else {
    ErrorAlert(dispatch, err);
    //  }
  }
};

export const updateTransactionAction =
  (id, data, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    //  updateAction(Transactionservice, EDIT_TRANSACTION, dispatch, id, data,setModalTypeHandler,setLoaderStatusHandler, sample)

    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Transactionservice.update(id, data);
      //  if (res.data.affectedRows === 1){}
      UpdateAlert(dispatch);
      dispatch({
        type: EDIT_TRANSACTION,
        payload: res.data.data,
      });
      dispatch({
        type: TOTAL_TRANSACTION_COUNT,
        payload: res.data.numRows,
      });
      if (sample) {
        sample(false);
      }
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      //  return Promise.resolve(res.data.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      // return Promise.reject(err);
      //}
    }
  };

export const deleteTransactionAction =
  (id, setModalTypeHandler, setLoaderStatusHandler, sample) =>
  async (dispatch) => {
    // deleteAction(Transactionservice, DELETE_TRANSACTION, dispatch, id,setModalTypeHandler,setLoaderStatusHandler)
    try {
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await Transactionservice.delete(id);
      if (res.status === 200 && res.statusText === 'OK') DeleteAlert(dispatch);
      dispatch({
        type: DELETE_TRANSACTION,
        payload: res.data.data,
      });
      dispatch({
        type: TOTAL_TRANSACTION_COUNT,
        payload: res.data.numRows,
      });
      if (sample) {
        sample(false);
      }

      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      return Promise.resolve(res.data.data);
    } catch (err) {
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      ErrorAlert(dispatch, err);
      //}
    }
  };

  //Transaction Search.........................................................................

export const getSearchTransactionsAction = (body, setModalTypeHandler, setLoaderStatusHandler) => {
  return {
    type: GET_SEARCH_TRANSACTION,
    body,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
};

//state
export const setSearchTransactionAction = (data) => {
  return {
    type:SET_SEARCH_TRANSACTION,
    payload:data
  }
};


export const transactionSearchPagination = (data) => async (dispatch) => {
    try {
      const res = await Transactionservice.searchPagination(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_TRANSACTION,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };