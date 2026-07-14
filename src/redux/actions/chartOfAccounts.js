import {
  LIST_CHARTOFACCOUNTS,
  LIST_PAYINACCOUNTS,
  LIST_PAYOUTACCOUNTS,
  TOTAL_CHARTOFACCOUNTS_COUNT,
  CHARTOFACCOUNTS_BY_PAGINATION,
  EXPORT_LIST_CHARTOFACCOUNTS,
  SET_SEARCH_CHARTOFACCOUNTS,
  GET_SEARCH_CHARTOFACCOUNTS,
  JOURNAL_ACCOUNTS,
  JOURNAL_ENTRY_SEQUENCE,
  GET_ACC_TYPES
} from '../actionTypes';
import chartOfAccountsService from '../../services/chartOfAccounts';
import {ErrorAlert, FailLoad, ListLoad} from './load';

export const listChartOfAccountsAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await chartOfAccountsService.getAll();
      if (res.status === 200) {
        dispatch({
          type: LIST_CHARTOFACCOUNTS,
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
  export const listJournalAccount =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await chartOfAccountsService.journalaccount();
      if (res.status === 200) {
        dispatch({
          type: JOURNAL_ACCOUNTS,
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

  export const chartOfAccountsIdNameAction =
  (body, setData) => async (dispatch) => {
    try {
      const res = await chartOfAccountsService.byIdAndName(body);
      if (res.status === 200) {
        setData(res.data)
      }
    } catch (err) {
      ErrorAlert(dispatch, err);
    }
  };
  

  export const Exportlistaction =
  ( from, to, exportDataCallBack) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await chartOfAccountsService.exportData(from, to);
      if (res.status === 200) {
        dispatch({
          type: EXPORT_LIST_CHARTOFACCOUNTS,
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

export const getlimitchartAction =
  (setModalTypeHandler, setLoaderStatusHandler, data) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await chartOfAccountsService.getpaginationdataAll(data);
      if (res.status === 200) {
        dispatch({
          type: CHARTOFACCOUNTS_BY_PAGINATION,
          payload: res.data.data,
        });
        dispatch({
          type: TOTAL_CHARTOFACCOUNTS_COUNT,
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

export const listChartOfAccountsdataAction =
  (setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
    try {
      //ListLoad(setModalTypeHandler, setLoaderStatusHandler)
      const res = await chartOfAccountsService.getData();
      if (res.status === 200) {
        dispatch({
          type: LIST_CHARTOFACCOUNTS,
          payload: res.data,
        });
      }
      //FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      //FailLoad(setModalTypeHandler, setLoaderStatusHandler)
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
      //}
    }
  };

export const listPayIndataAction =
  (response) => async (dispatch) => {
    try {
      const res = await chartOfAccountsService.accountGroupBasedLedger(
        'PayInData',
      );
      if (res.status === 200) {
        response(res.data)
        dispatch({
          type: LIST_PAYINACCOUNTS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      //}
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listPayOutdataAction =
  (response) => async (dispatch) => {
    try {
      const res = await chartOfAccountsService.accountGroupBasedLedger(
        'PayOutData',
      );
      if (res.status === 200) {
        response(res.data)
        dispatch({
          type: LIST_PAYOUTACCOUNTS,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

export const listChartOfAccountsdateAction = (from, to) => async (dispatch) => {
  try {
    // ListLoad(setModalTypeHandler, setLoaderStatusHandler)
    const res = await chartOfAccountsService.getDate(from, to);
    if (res.status === 200) {
      dispatch({
        type: LIST_CHARTOFACCOUNTS,
        payload: res.data,
      });
    }
    // FailLoad(setModalTypeHandler, setLoaderStatusHandler)
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const chartOfAccountsPaginationAction = (data) => async (dispatch) => {
  try {
    const res = await chartOfAccountsService.pagination(data);
    if (res.status === 200) {
      dispatch({
        type: SET_SEARCH_CHARTOFACCOUNTS,
        payload: res,
      });
      return Promise.resolve("API_FINISHED_SUCCESS");
    }
  } catch (err) {
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const get_searchChartofAccountAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
  return {
    type:GET_SEARCH_CHARTOFACCOUNTS,
    body,
    setModalTypeHandler, 
    setLoaderStatusHandler
  }
};

export const set_searchChartofAccountAction = (data) => {
  return {
    type:SET_SEARCH_CHARTOFACCOUNTS,
    payload:data
  }
};


export const getCurrentJournalEntrySequenceAction = () => async(dispatch) => {
  try{
    const res = await chartOfAccountsService.currentJournalEntrySequence()
    if(res.status === 200){
      dispatch({
        type: JOURNAL_ENTRY_SEQUENCE,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}

export const getaccTypeAction = () => async(dispatch) => {
  try{
    const res = await chartOfAccountsService.getaccType()
    if(res.status === 200){
      dispatch({
        type: GET_ACC_TYPES,
        payload: res.data
      })
    }
    return Promise.resolve("API_FINISHED_SUCCESS")
  }
  catch(err){
    ErrorAlert(dispatch, err)
    return Promise.resolve("API_FINISHED_ERROR")
  }
}