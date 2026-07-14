import {LIST_GENERALLEDGER, LIST_LEDGER_MONTHLY_SUMMARY,GET_SEARCH_LEDGER,SET_SEARCH_LEDGER, LIST_LEDGER_PAGINATE, EXPORT_LIST_LEDGER} from '../actionTypes';
import generalLedgerService from '../../services/generalLedger';
import {ErrorAlert, FailLoad, ListLoad, MailAlert, mailNotSentAlert, setupMailConfigAlert} from './load';

export const listGeneralLedgerAction =
  (from, to, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await generalLedgerService.getAll(from, to);
      if (res.status === 200) {
        dispatch({
          type: LIST_GENERALLEDGER,
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

export const listGeneralLedgerdateAction = (data,setModalTypeHandler, setLoaderStatusHandler) => async (dispatch) => {
  try {
    ListLoad(setModalTypeHandler,setLoaderStatusHandler)
    
    const res = await generalLedgerService.getDate(data);
    if (res.status === 200) {
      dispatch({
        type: LIST_LEDGER_PAGINATE,
        payload: res.data,
      });
    }
    //  FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    return Promise.resolve("API_FINISHED_SUCCESS");
  } catch (err) {
    // FailLoad(setModalTypeHandler,setLoaderStatusHandler)
    ErrorAlert(dispatch, err);
    return Promise.reject("API_FINISHED_ERROR");
  }
};

export const listGeneralLedgerMonthlySummaryAction =
  (id, date, toDate, setModalTypeHandler, setLoaderStatusHandler) =>
  async (dispatch) => {
    try {
       dispatch({
          type: LIST_LEDGER_MONTHLY_SUMMARY,
          payload: { data: {}, openingbalance: null, ledgerName: [] },
        });
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await generalLedgerService.getMonthlySummary(id, date, toDate);
      if (res.status === 200) {
        const payload = {
          ...res.data,
          data: res?.data?.data || {},
          openingbalance: res?.data?.openingbalance ?? null,
          ledgerName: res?.data?.ledgerName || [],
        };
        dispatch({
          type: LIST_LEDGER_MONTHLY_SUMMARY,
          payload,
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

  export const get_searchLedgerAction = (body, setModalTypeHandler, setLoaderStatusHandler) =>{
    return {
      type:GET_SEARCH_LEDGER,
      body,
      setModalTypeHandler, 
      setLoaderStatusHandler
    }
  };
  
  export const set_searchLedgerAction = (data) => {
    return {
      type:SET_SEARCH_LEDGER,
      payload:data
    }
  };

  export const searchLedgerPaginationAction =
  (data,) =>
  async (dispatch) => {
    try {
      const res = await generalLedgerService.searchLedgerPagination(data);
      if (res.status === 200) {
        dispatch({
          type: SET_SEARCH_LEDGER,
          payload: res.data,
        });
      }
      return Promise.resolve("API_FINISHED_SUCCESS");
    } catch (err) {
      ErrorAlert(dispatch, err);
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  
  export const monthlySummarySendMail = (data) =>
  async (dispatch) => {
    try {
     const res = await generalLedgerService.monthlySummarySendMail(data);
        // console.log("1111res", res);

        if (res.status === 200) {
            
            if (res?.data?.message === 'MAIL_SENT') {
                MailAlert(dispatch);
                return Promise.resolve("API_FINISHED_SUCCESS");
            }

            if (res?.data?.message === 'Setup Mail Configuration') {
                setupMailConfigAlert(dispatch); 
                return Promise.reject("NO_MAIL_CONFIG");
            }

            return Promise.resolve("API_FINISHED_SUCCESS");
        }
    } catch (err) {
      mailNotSentAlert(dispatch)
      return Promise.reject("API_FINISHED_ERROR");
    }
  };

  export const Exportlistaction =
  ( from, to, exportDataCallBack) => async (dispatch) => {
    try {
      // ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const res = await generalLedgerService.exportData(from, to);
      if (res.status === 200) {
        dispatch({
          type: EXPORT_LIST_LEDGER,
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
